"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  Laptop,
  LoaderCircle,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal, SectionHeader, cn } from "./ui";
import type {
  AttendanceRecord,
  EmployeeProfile,
  WorkMode,
  WorkspaceBundle,
} from "./workspaceTypes";

const WORK_MODES: { id: WorkMode; label: string; desc: string; icon: typeof Building2 }[] = [
  { id: "WFO", label: "WFO (Kantor)", desc: "Sudirman Kav. 52", icon: Building2 },
  { id: "Hybrid", label: "Hybrid", desc: "Fleksibel", icon: Laptop },
  { id: "WFH", label: "WFH (Rumah)", desc: "Remote kerja", icon: Home },
];

export default function AttendancePanel({
  employee,
  attendance,
  onAttendanceUpdated,
  onScrollToVibe,
  onShowToast,
}: {
  employee: EmployeeProfile;
  attendance: WorkspaceBundle["attendance"];
  onAttendanceUpdated: (
    nextAttendance: WorkspaceBundle["attendance"],
    nextHrOverview: WorkspaceBundle["hrOverview"],
  ) => void;
  onScrollToVibe: () => void;
  onShowToast: (msg: string) => void;
}) {
  const [workMode, setWorkMode] = useState<WorkMode>(
    attendance.todayRecord?.workMode ?? "WFO",
  );
  const [note, setNote] = useState(attendance.todayRecord?.note ?? "");
  const [submitting, setSubmitting] = useState<"clock_in" | "clock_out" | null>(null);
  const [liveTime, setLiveTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayRecord = attendance.todayRecord;
  const hasClockedIn = Boolean(todayRecord?.clockInAt);
  const hasClockedOut = Boolean(todayRecord?.clockOutAt);

  const handleClockAction = async (action: "clock_in" | "clock_out") => {
    setSubmitting(action);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          workMode,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        onShowToast(data.error ?? "Gagal memproses absensi.");
        return;
      }
      onAttendanceUpdated(data.attendance, data.hrOverview);
      onShowToast(data.message);
    } catch {
      onShowToast("Terjadi gangguan jaringan saat mencatat absensi.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <section id="attendance-hub" className="scroll-mt-28 px-4 pt-28 pb-12 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Portal Kehadiran & Identitas Pegawai (Lapisan Data 1)"
          icon={<Clock className="size-3.5" />}
          title="Absen Masuk & Pulang,"
          accent="terpisah dari privasi mentalmu."
          description="Pencatatan kehadiran harian terhubung ke sistem administrasi HR (Lapisan 1), sedangkan pengisian Daily Vibe Check di bawahnya dienkripsi secara terpisah pada Lapisan 2."
        />

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* Left: Live Clock-In / Clock-Out Control Card */}
          <Reveal className="bento p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/8 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-ink px-2.5 py-1 text-xs font-bold text-cream">
                    {employee.employeeId}
                  </span>
                  <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
                    {employee.department}
                  </span>
                  <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-ink-soft">
                    ID Anonim Psikolog: <b>{employee.anonCode}</b>
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-ink">{employee.fullName}</h3>
                <p className="text-sm text-ink-soft">
                  {employee.position} · {employee.email}
                </p>
              </div>

              <div className="rounded-2xl border border-ink/8 bg-cream px-4 py-3 text-right">
                <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-ink-mute">
                  <CalendarDays className="size-3.5 text-sage-600" />
                  {attendance.todayDate}
                </p>
                <p className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {liveTime || "--:--:--"}
                </p>
                <p className="text-[11px] text-ink-mute">Waktu Server WIB</p>
              </div>
            </div>

            {/* Today's Status Banner */}
            <div
              className={cn(
                "mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4",
                hasClockedOut
                  ? "border-sage-300 bg-sage-50/80"
                  : hasClockedIn
                    ? "border-honey-300 bg-honey-50/80"
                    : "border-ink/10 bg-cream/60",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl text-white",
                    hasClockedOut
                      ? "bg-sage-600"
                      : hasClockedIn
                        ? "bg-honey-500"
                        : "bg-ink-soft",
                  )}
                >
                  {hasClockedOut ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Clock className="size-5" />
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Status Kehadiran Hari Ini
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    {hasClockedOut
                      ? `Selesai Bekerja · Masuk ${todayRecord?.clockInAt} — Pulang ${todayRecord?.clockOutAt} (${todayRecord?.workMode})`
                      : hasClockedIn
                        ? `Sedang Bekerja · Absen Masuk tercatat pukul ${todayRecord?.clockInAt} (${todayRecord?.workMode})`
                        : "Belum Absen Masuk Hari Ini"}
                  </p>
                </div>
              </div>
              {todayRecord && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-soft">
                  {todayRecord.status}
                </span>
              )}
            </div>

            {/* Work Mode Picker */}
            <div className="mt-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Pilih Mode Kerja Hari Ini
              </label>
              <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                {WORK_MODES.map((m) => {
                  const Icon = m.icon;
                  const active = workMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={hasClockedIn}
                      onClick={() => setWorkMode(m.id)}
                      className={cn(
                        "flex flex-col items-start rounded-2xl border p-3.5 text-left transition",
                        active
                          ? "border-sage-500 bg-sage-50/80 ring-2 ring-sage-400/40"
                          : "border-ink/10 bg-white hover:border-ink/25",
                        hasClockedIn && "cursor-not-allowed opacity-75",
                      )}
                    >
                      <Icon className={cn("size-4", active ? "text-sage-700" : "text-ink-mute")} />
                      <span className="mt-2 text-xs font-semibold text-ink">{m.label}</span>
                      <span className="text-[11px] text-ink-mute">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance Note */}
            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Catatan Kehadiran / Rencana Tugas Singkat (Opsional)
              </label>
              <input
                type="text"
                maxLength={100}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={hasClockedOut}
                placeholder="Contoh: Fokus sprint deployment / koordinasi lintas divisi..."
                className="mt-2 w-full rounded-2xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-sage-500 disabled:bg-cream"
              />
            </div>

            {/* Clock In & Clock Out CTA Buttons */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={hasClockedIn || submitting !== null}
                onClick={() => handleClockAction("clock_in")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition",
                  hasClockedIn
                    ? "cursor-not-allowed bg-sage-100 text-sage-700"
                    : "bg-ink text-cream shadow-lift hover:bg-ink/90",
                )}
              >
                {submitting === "clock_in" ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" /> Mencatat Absen Masuk…
                  </>
                ) : hasClockedIn ? (
                  <>
                    <CheckCircle2 className="size-4" /> Sudah Absen Masuk ({todayRecord?.clockInAt})
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" /> Absen Masuk Sekarang
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={!hasClockedIn || hasClockedOut || submitting !== null}
                onClick={() => handleClockAction("clock_out")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition",
                  hasClockedOut
                    ? "cursor-not-allowed bg-cream-200 text-ink-mute"
                    : hasClockedIn
                      ? "bg-coral-500 text-white shadow-lift hover:bg-coral-600"
                      : "cursor-not-allowed border border-ink/10 bg-white text-ink-mute",
                )}
              >
                {submitting === "clock_out" ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" /> Mencatat Absen Pulang…
                  </>
                ) : hasClockedOut ? (
                  <>
                    <CheckCircle2 className="size-4" /> Sudah Absen Pulang ({todayRecord?.clockOutAt})
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" /> Absen Pulang Sekarang
                  </>
                )}
              </motion.button>
            </div>

            {/* Prompt to fill Daily Vibe Check */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage-200 bg-sage-50/60 p-4">
              <div className="flex items-center gap-2.5 text-xs text-ink-soft">
                <Sparkles className="size-4 shrink-0 text-sage-600" />
                <span>
                  Setelah absen masuk/pulang, luangkan <b>10 detik</b> untuk mencatat kondisi mentalmu di{" "}
                  <b>Daily Vibe Check</b> (100% terpisah dari data absensi HR).
                </span>
              </div>
              <button
                type="button"
                onClick={onScrollToVibe}
                className="rounded-xl bg-sage-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-sage-700"
              >
                Isi Vibe Check ↓
              </button>
            </div>
          </Reveal>

          {/* Right: Personal Attendance History Table */}
          <Reveal delay={0.08} className="bento p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Lapisan Data 1 · Log Kehadiran
                </p>
                <h3 className="mt-1 text-lg font-semibold text-ink">
                  Riwayat Absensi Pribadi ({attendance.history.length} Hari Terakhir)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                <Briefcase className="size-3" /> Sinkron HR
              </span>
            </div>

            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-2xl border border-ink/8 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-cream-200/90 text-[11px] font-semibold uppercase tracking-wider text-ink-soft backdrop-blur-sm">
                  <tr>
                    <th className="px-3.5 py-3">Tanggal</th>
                    <th className="px-3.5 py-3">Mode</th>
                    <th className="px-3.5 py-3">Masuk</th>
                    <th className="px-3.5 py-3">Pulang</th>
                    <th className="px-3.5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {attendance.history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-ink-mute">
                        Belum ada riwayat absensi. Silakan klik &ldquo;Absen Masuk Sekarang&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    attendance.history.map((row: AttendanceRecord) => (
                      <tr key={row.id} className="hover:bg-cream/50">
                        <td className="px-3.5 py-3 font-medium text-ink">
                          {row.workDate}
                          {row.workDate === attendance.todayDate && (
                            <span className="ml-1.5 rounded bg-sage-100 px-1.5 py-0.5 text-[10px] font-bold text-sage-700">
                              Hari Ini
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="rounded-md bg-cream-200 px-2 py-0.5 font-semibold text-ink-soft">
                            {row.workMode}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 font-mono font-semibold text-sage-700">
                          {row.clockInAt}
                        </td>
                        <td className="px-3.5 py-3 font-mono font-semibold text-ink-soft">
                          {row.clockOutAt ?? "—"}
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="text-[11px] font-medium text-ink-soft">{row.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-cream p-3.5 text-xs text-ink-soft">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage-600" />
              <p>
                <b>Catatan Privasi (Pasal 6 ayat 5):</b> Divisi HR hanya dapat melihat jam kehadiran di atas dan{" "}
                <b>tidak memiliki akses teknis</b> ke skor beban mental, warna indikator, maupun catatan refleksi Anda.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
