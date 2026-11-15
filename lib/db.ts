import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CONSENT_DOCUMENT_VERSION,
  decryptReflection,
  deriveAnonCode,
  derivePsychSubjectToken,
  encryptReflection,
  hashPassword,
} from "./crypto";
import { computeVibe, TAGS, type Level, type MoodId } from "@/components/SpillSpace/data";

export const MIN_ANON_RESPONDENTS = 10;

export type AccountStatus = "pending_activation" | "active" | "withdrawn";
export type UserRole = "employee" | "hr";
export type WorkMode = "WFO" | "WFH" | "Hybrid";

export type EmployeeProfile = {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: UserRole;
  accountStatus: AccountStatus;
  generalConsent: boolean;
  psychConsent: boolean;
  consentVersion: string | null;
  consentedAt: string | null;
  anonCode: string;
};

export type AttendanceRecord = {
  id: number;
  employeeId: string;
  workDate: string;
  clockInAt: string;
  clockOutAt: string | null;
  workMode: WorkMode;
  status: string;
  note: string;
};

export type ConsentAuditRecord = {
  id: number;
  employeeId: string;
  action: string;
  generalConsent: boolean;
  psychConsent: boolean;
  documentVersion: string;
  ipAddress: string;
  recordedAt: string;
};

export type PersonalVibeEntry = {
  id: number;
  entryDate: string;
  weekNumber: number;
  moodId: MoodId;
  workloadScore: number;
  tags: string[];
  reflection: string;
  capacityScore: number;
  colorLevel: Level;
  triggerSource: string;
  createdAt: string;
};

export type PersonalBookingEntry = {
  id: number;
  anonCode: string;
  psychologistId: string;
  psychologistName: string;
  slotLabel: string;
  isPriority: boolean;
  preCounselingShared: boolean;
  createdAt: string;
};

export type HrAttendanceRow = {
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  accountStatus: AccountStatus;
  todayClockIn: string | null;
  todayClockOut: string | null;
  todayWorkMode: string | null;
  todayStatus: string;
  totalDaysPresent: number;
};

export type AnonymousAggregateReport = {
  thresholdRequired: number;
  activeRespondents: number;
  totalLogsCount: number;
  meetsThreshold: boolean;
  notice: string;
  metrics: {
    avgCapacityScore: number;
    avgWorkloadScore: number;
    zoneDistribution: {
      greenPct: number;
      yellowPct: number;
      redPct: number;
      greenCount: number;
      yellowCount: number;
      redCount: number;
    };
    weeklyTrend: { week: number; avgScore: number; level: Level }[];
    topContextTags: { tag: string; count: number; kind: "demand" | "resource" }[];
  } | null;
};

const globalForDb = globalThis as unknown as {
  __spillspaceDb?: DatabaseSync;
};

function getDbFilePath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "spillspace.sqlite");
}

export function getDb(): DatabaseSync {
  if (!globalForDb.__spillspaceDb) {
    const db = new DatabaseSync(getDbFilePath());
    db.exec("PRAGMA journal_mode = WAL;");
    initializeSchema(db);
    seedIfEmpty(db);
    globalForDb.__spillspaceDb = db;
  }
  return globalForDb.__spillspaceDb;
}

function initializeSchema(db: DatabaseSync): void {
  db.exec(`
    -- LAPISAN 1: Data Identitas, Akun, Persetujuan & Absensi
    CREATE TABLE IF NOT EXISTS employees (
      employee_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      password_hash TEXT,
      account_status TEXT NOT NULL DEFAULT 'pending_activation',
      general_consent INTEGER NOT NULL DEFAULT 0,
      psych_consent INTEGER NOT NULL DEFAULT 0,
      consent_version TEXT,
      consented_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      action TEXT NOT NULL,
      general_consent INTEGER NOT NULL,
      psych_consent INTEGER NOT NULL,
      document_version TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      recorded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      work_date TEXT NOT NULL,
      clock_in_at TEXT NOT NULL,
      clock_out_at TEXT,
      work_mode TEXT NOT NULL DEFAULT 'WFO',
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      UNIQUE(employee_id, work_date)
    );

    -- LAPISAN 2: Data Psikologis (Dipisahkan dari identitas via subject_token HMAC-SHA256)
    CREATE TABLE IF NOT EXISTS psych_vibe_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_token TEXT NOT NULL,
      anon_code TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      mood_id TEXT NOT NULL,
      workload_score INTEGER NOT NULL,
      tags_json TEXT NOT NULL,
      reflection_cipher TEXT NOT NULL DEFAULT '',
      capacity_score INTEGER NOT NULL,
      color_level TEXT NOT NULL,
      trigger_source TEXT NOT NULL DEFAULT 'daily',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS psych_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_token TEXT NOT NULL,
      anon_code TEXT NOT NULL,
      psychologist_id TEXT NOT NULL,
      psychologist_name TEXT NOT NULL,
      slot_label TEXT NOT NULL,
      is_priority INTEGER NOT NULL DEFAULT 0,
      pre_counseling_shared INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);
}

export function todayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function currentTimeString(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

function seedIfEmpty(db: DatabaseSync): void {
  const row = db.prepare("SELECT COUNT(*) as cnt FROM employees").get() as { cnt: number };
  if (row && Number(row.cnt) > 0) return;
  populateSeedData(db);
}

export function resetDatabaseToSeed(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM psych_bookings;
    DELETE FROM psych_vibe_logs;
    DELETE FROM attendance_logs;
    DELETE FROM consent_logs;
    DELETE FROM employees;
  `);
  populateSeedData(db);
}

function populateSeedData(db: DatabaseSync): void {
  const defaultPasswordHash = hashPassword("Password123!");
  const nowIso = new Date().toISOString();
  const today = todayDateString();

  const masterEmployees: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dept: string;
    pos: string;
    role: UserRole;
    active: boolean;
    vibeProfile?: {
      w1: [MoodId, number, string[], string];
      w2: [MoodId, number, string[], string];
      w3: [MoodId, number, string[], string];
      w4: [MoodId, number, string[], string];
    };
  }[] = [
    {
      id: "EMP-2026-001",
      name: "Budi Santoso",
      email: "budi.santoso@company.co.id",
      phone: "0812-8800-1001",
      dept: "Engineering",
      pos: "Frontend Engineer",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["charged", 3, ["ClearGoals", "GreatTeamSupport"], "Sprint goal jelas dan tim suportif"],
        w2: ["okay", 4, ["ClearGoals"], "Pekerjaan terkendali dengan baik"],
        w3: ["okay", 5, ["GreatTeamSupport"], "Rilis fitur berjalan lancar"],
        w4: ["charged", 3, ["ClearGoals", "GreatTeamSupport"], "Punya waktu olahraga sore"],
      },
    },
    {
      id: "EMP-2026-002",
      name: "Alya Rahmawati",
      email: "alya.rahmawati@company.co.id",
      phone: "0812-8800-1002",
      dept: "Marketing & Growth",
      pos: "Campaign Specialist",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["drained", 6, ["TooManyMeetings"], "Rapat kampanye cukup padat"],
        w2: ["drained", 7, ["TightDeadline", "TooManyMeetings"], "Deadline peluncuran kuartal"],
        w3: ["overwhelmed", 8, ["TightDeadline", "NeedSleep"], "Lembur revisi materi"],
        w4: ["burnout", 9, ["TightDeadline", "NeedSleep", "PersonalLifeIssue"], "Butuh waktu istirahat dan sesi konseling"],
      },
    },
    {
      id: "EMP-2026-003",
      name: "Rizky Pratama",
      email: "rizky.pratama@company.co.id",
      phone: "0812-8800-1003",
      dept: "Engineering",
      pos: "Backend Engineer",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["okay", 4, ["ClearGoals"], "Migrasi database sesuai jadwal"],
        w2: ["drained", 6, ["TightDeadline"], "On-call malam minggu ini"],
        w3: ["drained", 6, ["TooManyMeetings"], "Koordinasi lintas tim"],
        w4: ["okay", 5, ["GreatTeamSupport"], "Dibantu rekan tim saat deployment"],
      },
    },
    {
      id: "EMP-2026-004",
      name: "Siti Nurhaliza Putri",
      email: "siti.putri@company.co.id",
      phone: "0812-8800-1004",
      dept: "Product & Design",
      pos: "UI/UX Researcher",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["charged", 3, ["GreatTeamSupport"], "Sesi wawancara user menyenangkan"],
        w2: ["okay", 4, ["ClearGoals"], "Sintesis riset berjalan rapi"],
        w3: ["okay", 4, ["ClearGoals", "GreatTeamSupport"], "Presentasi temuan lancar"],
        w4: ["charged", 3, ["GreatTeamSupport"], "Work-life balance terjaga"],
      },
    },
    {
      id: "EMP-2026-005",
      name: "Kevin Wijaya",
      email: "kevin.wijaya@company.co.id",
      phone: "0812-8800-1005",
      dept: "Finance & Strategy",
      pos: "Financial Analyst",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["okay", 5, ["ClearGoals"], "Rekonsiliasi awal bulan"],
        w2: ["drained", 7, ["TightDeadline"], "Persiapan audit internal"],
        w3: ["overwhelmed", 8, ["TightDeadline", "NeedSleep"], "Closing laporan kuartalan"],
        w4: ["drained", 6, ["GreatTeamSupport"], "Mulai mereda setelah closing"],
      },
    },
    {
      id: "EMP-2026-006",
      name: "Nadira Kusuma",
      email: "nadira.kusuma@company.co.id",
      phone: "0812-8800-1006",
      dept: "Customer Success",
      pos: "Account Executive",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["okay", 5, ["GreatTeamSupport"], "Onboarding klien baru"],
        w2: ["okay", 5, ["ClearGoals"], "Target mingguan tercapai"],
        w3: ["drained", 7, ["TooManyMeetings"], "Banyak panggilan tindak lanjut"],
        w4: ["okay", 4, ["GreatTeamSupport", "ClearGoals"], "Jadwal kembali seimbang"],
      },
    },
    {
      id: "EMP-2026-007",
      name: "Fajar Nugroho",
      email: "fajar.nugroho@company.co.id",
      phone: "0812-8800-1007",
      dept: "Operations",
      pos: "Operations Coordinator",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["okay", 5, ["ClearGoals"], "Koordinasi vendor lancar"],
        w2: ["drained", 6, ["TooManyMeetings"], "Sinkronisasi jadwal gudang"],
        w3: ["drained", 7, ["TightDeadline", "NeedSleep"], "Pengiriman akhir bulan padat"],
        w4: ["drained", 6, ["GreatTeamSupport"], "Tim saling back-up"],
      },
    },
    {
      id: "EMP-2026-008",
      name: "Tiara Anindya",
      email: "tiara.anindya@company.co.id",
      phone: "0812-8800-1008",
      dept: "Marketing & Growth",
      pos: "Content Strategist",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["charged", 3, ["ClearGoals"], "Kalender konten sudah siap"],
        w2: ["okay", 4, ["GreatTeamSupport"], "Brainstorming tim kreatif"],
        w3: ["okay", 5, ["ClearGoals"], "Produksi video berjalan baik"],
        w4: ["okay", 4, ["GreatTeamSupport"], "Energi masih stabil"],
      },
    },
    {
      id: "EMP-2026-009",
      name: "Arif Rahman Hakim",
      email: "arif.hakim@company.co.id",
      phone: "0812-8800-1009",
      dept: "Engineering",
      pos: "QA Engineer",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["okay", 5, ["ClearGoals"], "Regression testing rutin"],
        w2: ["drained", 7, ["TightDeadline"], "Banyak tiket pengujian masuk"],
        w3: ["overwhelmed", 8, ["TightDeadline", "TooManyMeetings"], "Kejar rilis aplikasi"],
        w4: ["drained", 6, ["GreatTeamSupport"], "Bug kritis sudah tertangani"],
      },
    },
    {
      id: "EMP-2026-010",
      name: "Maya Kartika",
      email: "maya.kartika@company.co.id",
      phone: "0812-8800-1010",
      dept: "Data & Analytics",
      pos: "Business Intelligence Analyst",
      role: "employee",
      active: true,
      vibeProfile: {
        w1: ["okay", 4, ["ClearGoals"], "Dashboard metrik mingguan selesai"],
        w2: ["okay", 5, ["GreatTeamSupport"], "Kolaborasi dengan tim produk"],
        w3: ["drained", 6, ["TooManyMeetings"], "Permintaan ad-hoc meningkat"],
        w4: ["okay", 4, ["ClearGoals"], "Prioritas tugas sudah dirapikan"],
      },
    },
    // 2 Karyawan yang BELUM aktivasi akun (siap dipakai demo Buat Akun + Clickwrap T&C)
    {
      id: "EMP-2026-011",
      name: "Nabila Putri Maharani",
      email: "nabila.maharani@company.co.id",
      phone: "0812-8800-1011",
      dept: "Product & Design",
      pos: "Product Designer",
      role: "employee",
      active: false,
    },
    {
      id: "EMP-2026-012",
      name: "Dimas Arya Pratama",
      email: "dimas.pratama@company.co.id",
      phone: "0812-8800-1012",
      dept: "Data & Analytics",
      pos: "Junior Data Analyst",
      role: "employee",
      active: false,
    },
    // Akun HR / People Partner
    {
      id: "HR-2026-001",
      name: "Sinta Dewi",
      email: "sinta.dewi@company.co.id",
      phone: "0812-8800-2001",
      dept: "People & Culture (HR)",
      pos: "HR People Partner",
      role: "hr",
      active: true,
    },
  ];

  const insertEmp = db.prepare(`
    INSERT INTO employees (
      employee_id, full_name, email, phone, department, position, role,
      password_hash, account_status, general_consent, psych_consent,
      consent_version, consented_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertConsentLog = db.prepare(`
    INSERT INTO consent_logs (
      employee_id, action, general_consent, psych_consent,
      document_version, ip_address, user_agent, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAttendance = db.prepare(`
    INSERT OR IGNORE INTO attendance_logs (
      employee_id, work_date, clock_in_at, clock_out_at, work_mode, status, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVibe = db.prepare(`
    INSERT INTO psych_vibe_logs (
      subject_token, anon_code, entry_date, week_number, mood_id,
      workload_score, tags_json, reflection_cipher, capacity_score,
      color_level, trigger_source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const pastDates = [
    "2026-11-11",
    "2026-11-12",
    "2026-11-13",
    "2026-11-14",
  ];

  for (const emp of masterEmployees) {
    insertEmp.run(
      emp.id,
      emp.name,
      emp.email,
      emp.phone,
      emp.dept,
      emp.pos,
      emp.role,
      emp.active ? defaultPasswordHash : null,
      emp.active ? "active" : "pending_activation",
      emp.active ? 1 : 0,
      emp.active ? 1 : 0,
      emp.active ? CONSENT_DOCUMENT_VERSION : null,
      emp.active ? "2026-11-01T08:30:00.000Z" : null,
      nowIso,
    );

    if (emp.active) {
      insertConsentLog.run(
        emp.id,
        "grant_initial",
        1,
        1,
        CONSENT_DOCUMENT_VERSION,
        "10.10.24.15",
        "Mozilla/5.0 (SpillSpace Corporate Portal)",
        "2026-11-01T08:30:00.000Z",
      );

      // Seed 4 hari riwayat absensi sebelumnya
      pastDates.forEach((d, idx) => {
        const mode: WorkMode = idx % 2 === 0 ? "WFO" : "Hybrid";
        insertAttendance.run(
          emp.id,
          d,
          `08:${45 + (idx * 3) % 12}`,
          `17:${15 + (idx * 7) % 30}`,
          mode,
          "Selesai Kerja",
          idx === 3 ? "Sprint review & sinkronisasi mingguan" : "Operasional harian",
        );
      });

      // Seed beberapa karyawan sudah absen masuk hari ini untuk tampilan live HR
      if (["EMP-2026-003", "EMP-2026-004", "EMP-2026-006", "EMP-2026-008"].includes(emp.id)) {
        insertAttendance.run(
          emp.id,
          today,
          "08:52",
          null,
          "WFO",
          "Hadir Tepat Waktu",
          "Hadir di kantor pusat",
        );
      }
    }

    if (emp.active && emp.vibeProfile) {
      const subjectToken = derivePsychSubjectToken(emp.id);
      const anonCode = deriveAnonCode(emp.id);
      const weeks: [number, string, [MoodId, number, string[], string]][] = [
        [1, "2026-10-24", emp.vibeProfile.w1],
        [2, "2026-10-31", emp.vibeProfile.w2],
        [3, "2026-11-07", emp.vibeProfile.w3],
        [4, "2026-11-14", emp.vibeProfile.w4],
      ];

      for (const [weekNum, dateStr, [mood, load, tags, note]] of weeks) {
        const computed = computeVibe(mood, load, tags);
        insertVibe.run(
          subjectToken,
          anonCode,
          dateStr,
          weekNum,
          mood,
          load,
          JSON.stringify(tags),
          encryptReflection(note),
          computed.score,
          computed.level,
          "daily",
          `${dateStr}T09:15:00.000Z`,
        );
      }
    }
  }
}

export function getEmployeeById(employeeId: string): EmployeeProfile | null {
  const db = getDb();
  const normalized = employeeId.trim().toUpperCase();
  const row = db
    .prepare("SELECT * FROM employees WHERE UPPER(employee_id) = ?")
    .get(normalized) as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapEmployeeRow(row);
}

export function getRawEmployeeAuth(employeeId: string): {
  profile: EmployeeProfile;
  passwordHash: string | null;
} | null {
  const db = getDb();
  const normalized = employeeId.trim().toUpperCase();
  const row = db
    .prepare("SELECT * FROM employees WHERE UPPER(employee_id) = ?")
    .get(normalized) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    profile: mapEmployeeRow(row),
    passwordHash: (row.password_hash as string | null) ?? null,
  };
}

function mapEmployeeRow(row: Record<string, unknown>): EmployeeProfile {
  const id = String(row.employee_id);
  return {
    employeeId: id,
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone),
    department: String(row.department),
    position: String(row.position),
    role: (row.role as UserRole) ?? "employee",
    accountStatus: (row.account_status as AccountStatus) ?? "pending_activation",
    generalConsent: Number(row.general_consent) === 1,
    psychConsent: Number(row.psych_consent) === 1,
    consentVersion: row.consent_version ? String(row.consent_version) : null,
    consentedAt: row.consented_at ? String(row.consented_at) : null,
    anonCode: deriveAnonCode(id),
  };
}

export function activateEmployeeAccount(params: {
  employeeId: string;
  passwordPlain: string;
  generalConsent: boolean;
  psychConsent: boolean;
  ipAddress: string;
  userAgent: string;
}): EmployeeProfile {
  const db = getDb();
  const normalized = params.employeeId.trim().toUpperCase();
  const nowIso = new Date().toISOString();
  const pwdHash = hashPassword(params.passwordPlain);

  db.prepare(`
    UPDATE employees
    SET password_hash = ?,
        account_status = 'active',
        general_consent = ?,
        psych_consent = ?,
        consent_version = ?,
        consented_at = ?
    WHERE UPPER(employee_id) = ?
  `).run(
    pwdHash,
    params.generalConsent ? 1 : 0,
    params.psychConsent ? 1 : 0,
    CONSENT_DOCUMENT_VERSION,
    nowIso,
    normalized,
  );

  db.prepare(`
    INSERT INTO consent_logs (
      employee_id, action, general_consent, psych_consent,
      document_version, ip_address, user_agent, recorded_at
    ) VALUES (?, 'grant_initial', ?, ?, ?, ?, ?, ?)
  `).run(
    normalized,
    params.generalConsent ? 1 : 0,
    params.psychConsent ? 1 : 0,
    CONSENT_DOCUMENT_VERSION,
    params.ipAddress,
    params.userAgent,
    nowIso,
  );

  const updated = getEmployeeById(normalized);
  if (!updated) throw new Error("Karyawan tidak ditemukan setelah aktivasi.");
  return updated;
}

export function getEmployeeAttendance(employeeId: string): {
  todayRecord: AttendanceRecord | null;
  history: AttendanceRecord[];
} {
  const db = getDb();
  const normalized = employeeId.trim().toUpperCase();
  const rows = db
    .prepare(
      "SELECT * FROM attendance_logs WHERE UPPER(employee_id) = ? ORDER BY work_date DESC, id DESC LIMIT 14",
    )
    .all(normalized) as Record<string, unknown>[];

  const mapped: AttendanceRecord[] = rows.map((r) => ({
    id: Number(r.id),
    employeeId: String(r.employee_id),
    workDate: String(r.work_date),
    clockInAt: String(r.clock_in_at),
    clockOutAt: r.clock_out_at ? String(r.clock_out_at) : null,
    workMode: (r.work_mode as WorkMode) ?? "WFO",
    status: String(r.status),
    note: String(r.note ?? ""),
  }));

  const today = todayDateString();
  const todayRecord = mapped.find((m) => m.workDate === today) ?? null;
  return { todayRecord, history: mapped };
}

export function recordClockIn(params: {
  employeeId: string;
  workMode: WorkMode;
  note: string;
}): AttendanceRecord {
  const db = getDb();
  const normalized = params.employeeId.trim().toUpperCase();
  const today = todayDateString();
  const timeNow = currentTimeString();
  const isLate = timeNow > "09:15";
  const status = isLate ? "Hadir (Terlambat)" : "Hadir Tepat Waktu";

  const existing = db
    .prepare("SELECT * FROM attendance_logs WHERE UPPER(employee_id) = ? AND work_date = ?")
    .get(normalized, today) as Record<string, unknown> | undefined;

  if (!existing) {
    db.prepare(`
      INSERT INTO attendance_logs (
        employee_id, work_date, clock_in_at, clock_out_at, work_mode, status, note
      ) VALUES (?, ?, ?, NULL, ?, ?, ?)
    `).run(normalized, today, timeNow, params.workMode, status, params.note.trim());
  }

  const { todayRecord } = getEmployeeAttendance(normalized);
  if (!todayRecord) throw new Error("Gagal mencatat absen masuk.");
  return todayRecord;
}

export function recordClockOut(params: {
  employeeId: string;
  note?: string;
}): AttendanceRecord {
  const db = getDb();
  const normalized = params.employeeId.trim().toUpperCase();
  const today = todayDateString();
  const timeNow = currentTimeString();

  const existing = db
    .prepare("SELECT * FROM attendance_logs WHERE UPPER(employee_id) = ? AND work_date = ?")
    .get(normalized, today) as Record<string, unknown> | undefined;

  if (!existing) {
    throw new Error("Anda belum melakukan Absen Masuk hari ini.");
  }

  const updatedNote = params.note?.trim()
    ? `${String(existing.note ?? "") ? String(existing.note) + " · " : ""}${params.note.trim()}`
    : String(existing.note ?? "");

  db.prepare(`
    UPDATE attendance_logs
    SET clock_out_at = ?, status = 'Selesai Kerja', note = ?
    WHERE id = ?
  `).run(timeNow, updatedNote, Number(existing.id));

  const { todayRecord } = getEmployeeAttendance(normalized);
  if (!todayRecord) throw new Error("Gagal mencatat absen pulang.");
  return todayRecord;
}

export function getPersonalPsychologicalData(employeeId: string): {
  vibeLogs: PersonalVibeEntry[];
  bookings: PersonalBookingEntry[];
} {
  const db = getDb();
  const subjectToken = derivePsychSubjectToken(employeeId);

  const vibeRows = db
    .prepare(
      "SELECT * FROM psych_vibe_logs WHERE subject_token = ? ORDER BY entry_date DESC, id DESC LIMIT 20",
    )
    .all(subjectToken) as Record<string, unknown>[];

  const vibeLogs: PersonalVibeEntry[] = vibeRows.map((r) => {
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(String(r.tags_json ?? "[]"));
    } catch {
      parsedTags = [];
    }
    return {
      id: Number(r.id),
      entryDate: String(r.entry_date),
      weekNumber: Number(r.week_number),
      moodId: (r.mood_id as MoodId) ?? "okay",
      workloadScore: Number(r.workload_score),
      tags: parsedTags,
      reflection: decryptReflection(String(r.reflection_cipher ?? "")),
      capacityScore: Number(r.capacity_score),
      colorLevel: (r.color_level as Level) ?? "green",
      triggerSource: String(r.trigger_source ?? "daily"),
      createdAt: String(r.created_at),
    };
  });

  const bookingRows = db
    .prepare("SELECT * FROM psych_bookings WHERE subject_token = ? ORDER BY id DESC LIMIT 10")
    .all(subjectToken) as Record<string, unknown>[];

  const bookings: PersonalBookingEntry[] = bookingRows.map((b) => ({
    id: Number(b.id),
    anonCode: String(b.anon_code),
    psychologistId: String(b.psychologist_id),
    psychologistName: String(b.psychologist_name),
    slotLabel: String(b.slot_label),
    isPriority: Number(b.is_priority) === 1,
    preCounselingShared: Number(b.pre_counseling_shared) === 1,
    createdAt: String(b.created_at),
  }));

  return { vibeLogs, bookings };
}

export function savePersonalVibeEntry(params: {
  employeeId: string;
  moodId: MoodId;
  workloadScore: number;
  tags: string[];
  reflection: string;
  triggerSource?: string;
}): PersonalVibeEntry {
  const db = getDb();
  const emp = getEmployeeById(params.employeeId);
  if (!emp) throw new Error("Akun karyawan tidak ditemukan.");
  if (!emp.psychConsent) {
    throw new Error(
      "Persetujuan Eksplisit Data Psikologis belum diaktifkan. Aktifkan terlebih dahulu pada Pengaturan Privasi.",
    );
  }

  const subjectToken = derivePsychSubjectToken(emp.employeeId);
  const anonCode = deriveAnonCode(emp.employeeId);
  const computed = computeVibe(params.moodId, params.workloadScore, params.tags);
  const today = todayDateString();
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO psych_vibe_logs (
      subject_token, anon_code, entry_date, week_number, mood_id,
      workload_score, tags_json, reflection_cipher, capacity_score,
      color_level, trigger_source, created_at
    ) VALUES (?, ?, ?, 4, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    subjectToken,
    anonCode,
    today,
    params.moodId,
    params.workloadScore,
    JSON.stringify(params.tags),
    encryptReflection(params.reflection),
    computed.score,
    computed.level,
    params.triggerSource ?? "daily",
    nowIso,
  );

  const { vibeLogs } = getPersonalPsychologicalData(emp.employeeId);
  return vibeLogs[0];
}

export function saveAnonymousPsychBooking(params: {
  employeeId: string;
  psychologistId: string;
  psychologistName: string;
  slotLabel: string;
  isPriority: boolean;
}): PersonalBookingEntry {
  const db = getDb();
  const emp = getEmployeeById(params.employeeId);
  if (!emp) throw new Error("Akun karyawan tidak ditemukan.");
  if (!emp.psychConsent) {
    throw new Error("Persetujuan Eksplisit Data Psikologis diperlukan untuk menjadwalkan sesi.");
  }

  const subjectToken = derivePsychSubjectToken(emp.employeeId);
  const anonCode = deriveAnonCode(emp.employeeId);
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO psych_bookings (
      subject_token, anon_code, psychologist_id, psychologist_name,
      slot_label, is_priority, pre_counseling_shared, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    subjectToken,
    anonCode,
    params.psychologistId,
    params.psychologistName,
    params.slotLabel,
    params.isPriority ? 1 : 0,
    nowIso,
  );

  const { bookings } = getPersonalPsychologicalData(emp.employeeId);
  return bookings[0];
}

export function getConsentAuditHistory(employeeId: string): ConsentAuditRecord[] {
  const db = getDb();
  const normalized = employeeId.trim().toUpperCase();
  const rows = db
    .prepare("SELECT * FROM consent_logs WHERE UPPER(employee_id) = ? ORDER BY id DESC")
    .all(normalized) as Record<string, unknown>[];

  return rows.map((r) => ({
    id: Number(r.id),
    employeeId: String(r.employee_id),
    action: String(r.action),
    generalConsent: Number(r.general_consent) === 1,
    psychConsent: Number(r.psych_consent) === 1,
    documentVersion: String(r.document_version),
    ipAddress: String(r.ip_address),
    recordedAt: String(r.recorded_at),
  }));
}

export function updateEmployeeConsentAndData(params: {
  employeeId: string;
  mode: "grant_psych" | "withdraw_psych_only" | "withdraw_all_and_delete";
  ipAddress: string;
  userAgent: string;
}): {
  updatedProfile: EmployeeProfile;
  deletedVibeLogs: number;
  deletedBookings: number;
  confirmationNumber: string;
} {
  const db = getDb();
  const normalized = params.employeeId.trim().toUpperCase();
  const subjectToken = derivePsychSubjectToken(normalized);
  const nowIso = new Date().toISOString();

  let deletedVibeLogs = 0;
  let deletedBookings = 0;

  if (params.mode === "grant_psych") {
    db.prepare(`
      UPDATE employees
      SET psych_consent = 1, consent_version = ?, consented_at = ?
      WHERE UPPER(employee_id) = ?
    `).run(CONSENT_DOCUMENT_VERSION, nowIso, normalized);

    db.prepare(`
      INSERT INTO consent_logs (
        employee_id, action, general_consent, psych_consent,
        document_version, ip_address, user_agent, recorded_at
      ) VALUES (?, 'update_psych_consent', 1, 1, ?, ?, ?, ?)
    `).run(normalized, CONSENT_DOCUMENT_VERSION, params.ipAddress, params.userAgent, nowIso);
  } else if (params.mode === "withdraw_psych_only") {
    const resVibe = db
      .prepare("DELETE FROM psych_vibe_logs WHERE subject_token = ?")
      .run(subjectToken);
    const resBook = db
      .prepare("DELETE FROM psych_bookings WHERE subject_token = ?")
      .run(subjectToken);
    deletedVibeLogs = Number(resVibe.changes);
    deletedBookings = Number(resBook.changes);

    db.prepare(`
      UPDATE employees
      SET psych_consent = 0
      WHERE UPPER(employee_id) = ?
    `).run(normalized);

    db.prepare(`
      INSERT INTO consent_logs (
        employee_id, action, general_consent, psych_consent,
        document_version, ip_address, user_agent, recorded_at
      ) VALUES (?, 'withdraw_psych_consent', 1, 0, ?, ?, ?, ?)
    `).run(normalized, CONSENT_DOCUMENT_VERSION, params.ipAddress, params.userAgent, nowIso);
  } else {
    const resVibe = db
      .prepare("DELETE FROM psych_vibe_logs WHERE subject_token = ?")
      .run(subjectToken);
    const resBook = db
      .prepare("DELETE FROM psych_bookings WHERE subject_token = ?")
      .run(subjectToken);
    deletedVibeLogs = Number(resVibe.changes);
    deletedBookings = Number(resBook.changes);

    db.prepare(`
      UPDATE employees
      SET password_hash = NULL,
          account_status = 'pending_activation',
          general_consent = 0,
          psych_consent = 0
      WHERE UPPER(employee_id) = ?
    `).run(normalized);

    db.prepare(`
      INSERT INTO consent_logs (
        employee_id, action, general_consent, psych_consent,
        document_version, ip_address, user_agent, recorded_at
      ) VALUES (?, 'withdraw_all_and_delete', 0, 0, ?, ?, ?, ?)
    `).run(normalized, CONSENT_DOCUMENT_VERSION, params.ipAddress, params.userAgent, nowIso);
  }

  const updatedProfile = getEmployeeById(normalized);
  if (!updatedProfile) throw new Error("Profil karyawan tidak ditemukan.");

  const confirmationNumber = `DEL-${Date.now().toString(36).toUpperCase()}`;
  return {
    updatedProfile,
    deletedVibeLogs,
    deletedBookings,
    confirmationNumber,
  };
}

/**
 * Dashboard HR — Rekap Absensi (Lapisan 1) + Laporan Agregat Anonim (Lapisan 3)
 * Mematuhi Pasal 6 Hak Akses ayat 2 & ayat 5 (Ambang minimum 10 orang responden aktif).
 */
export function getHrOverviewData(): {
  attendanceRows: HrAttendanceRow[];
  aggregateReport: AnonymousAggregateReport;
} {
  const db = getDb();
  const today = todayDateString();

  const empRows = db
    .prepare("SELECT * FROM employees ORDER BY employee_id ASC")
    .all() as Record<string, unknown>[];

  const attRows = db
    .prepare("SELECT * FROM attendance_logs")
    .all() as Record<string, unknown>[];

  const attendanceRows: HrAttendanceRow[] = empRows.map((e) => {
    const id = String(e.employee_id);
    const empAtt = attRows.filter((a) => String(a.employee_id) === id);
    const todayAtt = empAtt.find((a) => String(a.work_date) === today);
    return {
      employeeId: id,
      fullName: String(e.full_name),
      department: String(e.department),
      position: String(e.position),
      accountStatus: (e.account_status as AccountStatus) ?? "pending_activation",
      todayClockIn: todayAtt ? String(todayAtt.clock_in_at) : null,
      todayClockOut: todayAtt?.clock_out_at ? String(todayAtt.clock_out_at) : null,
      todayWorkMode: todayAtt ? String(todayAtt.work_mode) : null,
      todayStatus: todayAtt ? String(todayAtt.status) : "Belum Absen",
      totalDaysPresent: empAtt.length,
    };
  });

  // Hitung responden unik aktif pada Lapisan 2 (psych_vibe_logs)
  const respondentRow = db
    .prepare("SELECT COUNT(DISTINCT subject_token) as cnt FROM psych_vibe_logs")
    .get() as { cnt: number };
  const activeRespondents = Number(respondentRow?.cnt ?? 0);

  const allVibes = db
    .prepare(
      "SELECT week_number, workload_score, tags_json, capacity_score, color_level FROM psych_vibe_logs",
    )
    .all() as Record<string, unknown>[];

  const totalLogsCount = allVibes.length;

  // Pasal 6 Hak Akses ayat 5b: Ambang minimum 10 responden aktif
  if (activeRespondents < MIN_ANON_RESPONDENTS || totalLogsCount === 0) {
    return {
      attendanceRows,
      aggregateReport: {
        thresholdRequired: MIN_ANON_RESPONDENTS,
        activeRespondents,
        totalLogsCount,
        meetsThreshold: false,
        notice: `Sesuai Pasal 6 (Hak Akses ayat 5b) Perjanjian SpillSpace, Laporan Agregat Anonim hanya ditampilkan apabila kelompok memiliki minimal ${MIN_ANON_RESPONDENTS} responden aktif. Saat ini tercatat ${activeRespondents} responden aktif, sehingga data agregat disembunyikan otomatis demi mencegah penebakan identitas individu.`,
        metrics: null,
      },
    };
  }

  const sumCap = allVibes.reduce((acc, r) => acc + Number(r.capacity_score), 0);
  const sumLoad = allVibes.reduce((acc, r) => acc + Number(r.workload_score), 0);
  const avgCapacityScore = Math.round(sumCap / totalLogsCount);
  const avgWorkloadScore = Number((sumLoad / totalLogsCount).toFixed(1));

  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;
  const tagCounts: Record<string, number> = {};

  for (const r of allVibes) {
    const lvl = String(r.color_level) as Level;
    if (lvl === "green") greenCount++;
    else if (lvl === "yellow") yellowCount++;
    else redCount++;

    try {
      const parsed: string[] = JSON.parse(String(r.tags_json ?? "[]"));
      for (const t of parsed) {
        tagCounts[t] = (tagCounts[t] ?? 0) + 1;
      }
    } catch {
      // ignore malformed JSON
    }
  }

  const weeklyTrend = [1, 2, 3, 4].map((w) => {
    const weekItems = allVibes.filter((r) => Number(r.week_number) === w);
    const avgScore =
      weekItems.length > 0
        ? Math.round(
            weekItems.reduce((acc, r) => acc + Number(r.capacity_score), 0) /
              weekItems.length,
          )
        : avgCapacityScore;
    const level: Level = avgScore >= 70 ? "red" : avgScore >= 40 ? "yellow" : "green";
    return { week: w, avgScore, level };
  });

  const topContextTags = Object.entries(tagCounts)
    .map(([tag, count]) => {
      const kind = TAGS.find((x) => x.id === tag)?.kind ?? "demand";
      return { tag, count, kind };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    attendanceRows,
    aggregateReport: {
      thresholdRequired: MIN_ANON_RESPONDENTS,
      activeRespondents,
      totalLogsCount,
      meetsThreshold: true,
      notice: `Laporan Agregat Anonim dari ${activeRespondents} responden aktif (memenuhi ambang minimum ≥ ${MIN_ANON_RESPONDENTS} orang sesuai Pasal 6 ayat 5b). Tanpa pengenal individu, tanpa pembagian berlapis, dan tanpa kutipan isian bebas.`,
      metrics: {
        avgCapacityScore,
        avgWorkloadScore,
        zoneDistribution: {
          greenPct: Math.round((greenCount / totalLogsCount) * 100),
          yellowPct: Math.round((yellowCount / totalLogsCount) * 100),
          redPct: Math.round((redCount / totalLogsCount) * 100),
          greenCount,
          yellowCount,
          redCount,
        },
        weeklyTrend,
        topContextTags,
      },
    },
  };
}
