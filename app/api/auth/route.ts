import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/crypto";
import {
  activateEmployeeAccount,
  getConsentAuditHistory,
  getEmployeeAttendance,
  getEmployeeById,
  getHrOverviewData,
  getPersonalPsychologicalData,
  getRawEmployeeAuth,
  resetDatabaseToSeed,
} from "@/lib/db";
import {
  clearSessionCookie,
  getAuthenticatedEmployee,
  getRequestClientMetadata,
  setSessionCookie,
} from "@/lib/session";

function buildWorkspaceBundle(employeeId: string) {
  const employee = getEmployeeById(employeeId);
  if (!employee) return null;
  const attendance = getEmployeeAttendance(employee.employeeId);
  const psychData = employee.psychConsent
    ? getPersonalPsychologicalData(employee.employeeId)
    : { vibeLogs: [], bookings: [] };
  const consentHistory = getConsentAuditHistory(employee.employeeId);
  const hrOverview = getHrOverviewData();

  return {
    employee,
    attendance,
    psychData,
    consentHistory,
    hrOverview,
  };
}

export async function GET() {
  const employee = await getAuthenticatedEmployee();
  if (!employee) {
    return NextResponse.json({ authenticated: false, workspace: null });
  }
  const workspace = buildWorkspaceBundle(employee.employeeId);
  return NextResponse.json({
    authenticated: true,
    workspace,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "lookup") {
      const employeeId = String(body.employeeId ?? "").trim().toUpperCase();
      if (!employeeId) {
        return NextResponse.json(
          { ok: false, error: "Masukkan Nomor Induk Karyawan (NIK) terlebih dahulu." },
          { status: 400 },
        );
      }
      const emp = getEmployeeById(employeeId);
      if (!emp) {
        return NextResponse.json(
          {
            ok: false,
            error: `ID Karyawan "${employeeId}" tidak ditemukan pada Data Master HR. Pastikan ID sesuai (contoh: EMP-2026-011).`,
          },
          { status: 404 },
        );
      }
      return NextResponse.json({
        ok: true,
        employee: {
          employeeId: emp.employeeId,
          fullName: emp.fullName,
          email: emp.email,
          department: emp.department,
          position: emp.position,
          role: emp.role,
          accountStatus: emp.accountStatus,
        },
      });
    }

    if (action === "activate") {
      const employeeId = String(body.employeeId ?? "").trim().toUpperCase();
      const password = String(body.password ?? "");
      const generalConsent = Boolean(body.generalConsent);
      const psychConsent = Boolean(body.psychConsent);

      if (!employeeId) {
        return NextResponse.json(
          { ok: false, error: "ID Karyawan wajib diisi." },
          { status: 400 },
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { ok: false, error: "Kata sandi minimal terdiri dari 6 karakter." },
          { status: 400 },
        );
      }
      if (!generalConsent) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Sesuai Pasal 5 ayat 2 Perjanjian, Anda wajib menyetujui Persetujuan Umum melalui tombol 'Saya Setuju dan Melanjutkan' sebelum akun dapat dibuat.",
          },
          { status: 400 },
        );
      }

      const existing = getEmployeeById(employeeId);
      if (!existing) {
        return NextResponse.json(
          { ok: false, error: "ID Karyawan tidak terdaftar pada Data Master HR." },
          { status: 404 },
        );
      }
      if (existing.accountStatus === "active") {
        return NextResponse.json(
          {
            ok: false,
            error: `Akun ${employeeId} sudah aktif. Silakan masuk melalui tab Login Karyawan.`,
          },
          { status: 400 },
        );
      }

      const { ipAddress, userAgent } = await getRequestClientMetadata();
      const updated = activateEmployeeAccount({
        employeeId,
        passwordPlain: password,
        generalConsent,
        psychConsent,
        ipAddress,
        userAgent,
      });

      await setSessionCookie(updated);
      const workspace = buildWorkspaceBundle(updated.employeeId);
      return NextResponse.json({
        ok: true,
        message: "Akun berhasil diaktifkan dan bukti persetujuan elektronik telah disimpan.",
        workspace,
      });
    }

    if (action === "login") {
      const employeeId = String(body.employeeId ?? "").trim().toUpperCase();
      const password = String(body.password ?? "");

      if (!employeeId || !password) {
        return NextResponse.json(
          { ok: false, error: "ID Karyawan dan Kata Sandi wajib diisi." },
          { status: 400 },
        );
      }

      const raw = getRawEmployeeAuth(employeeId);
      if (!raw) {
        return NextResponse.json(
          { ok: false, error: `ID Karyawan "${employeeId}" tidak terdaftar di sistem perusahaan.` },
          { status: 404 },
        );
      }

      if (raw.profile.accountStatus !== "active" || !raw.passwordHash) {
        return NextResponse.json(
          {
            ok: false,
            needsActivation: true,
            employeeId: raw.profile.employeeId,
            error: `Akun ${raw.profile.employeeId} (${raw.profile.fullName}) belum diaktifkan. Silakan lakukan Aktivasi Akun & Persetujuan Terms & Conditions terlebih dahulu.`,
          },
          { status: 403 },
        );
      }

      const valid = verifyPassword(password, raw.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { ok: false, error: "Kata sandi yang Anda masukkan tidak sesuai." },
          { status: 401 },
        );
      }

      await setSessionCookie(raw.profile);
      const workspace = buildWorkspaceBundle(raw.profile.employeeId);
      return NextResponse.json({
        ok: true,
        workspace,
      });
    }

    if (action === "logout") {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }

    if (action === "reset_demo") {
      resetDatabaseToSeed();
      await clearSessionCookie();
      return NextResponse.json({
        ok: true,
        message: "Data demo SQLite berhasil di-reset ke kondisi awal.",
      });
    }

    return NextResponse.json({ ok: false, error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan pada server.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
