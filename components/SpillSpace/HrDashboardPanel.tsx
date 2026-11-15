"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  EyeOff,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LEVEL_STYLES, Reveal, SectionHeader, StatusDot, cn } from "./ui";
import type { WorkspaceBundle } from "./workspaceTypes";

export default function HrDashboardPanel({
  hrOverview,
  userRole,
}: {
  hrOverview: WorkspaceBundle["hrOverview"];
  userRole: "employee" | "hr";
}) {
  const { attendanceRows, aggregateReport, todayDate } = hrOverview;
  const metrics = aggregateReport.metrics;

  const presentTodayCount = attendanceRows.filter((r) => Boolean(r.todayClockIn)).length;
  const activeAccountsCount = attendanceRows.filter((r) => r.accountStatus === "active").length;

  return (
    <section id="hr-dashboard" className="scroll-mt-28 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Transparansi Lapisan 1 & Lapisan 3 (Simulasi Tampilan HR / Manajemen)"
          icon={<Building2 className="size-3.5" />}
          title="Apa yang bisa (dan tidak bisa)"
          accent="dilihat oleh Perusahaan."
          description={
            userRole === "hr"
              ? "Anda masuk sebagai HR People Partner. Sesuai Pasal 6 ayat 5 Perjanjian, Anda hanya memiliki akses ke Rekap Kehadiran (Lapisan 1) dan Laporan Agregat Anonim (Lapisan 3) jika responden aktif ≥ 10 orang."
              : "Panel transparansi ini menunjukkan secara langsung apa yang terlihat di layar HR perusahaan: jam absensi (Lapisan 1) dan statistik agregat anonim (Lapisan 3) tanpa nama atau kutipan curhatan."
          }
        />

        {/* Top KPI Summary Cards */}
        <Reveal className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="bento p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              Lapisan 1 · Kehadiran Hari Ini ({todayDate})
            </p>
            <p className="mt-2 text-3xl font-semibold text-ink tabular-nums">
              {presentTodayCount}
              <span className="text-base font-normal text-ink-mute">
                {" "}
                / {activeAccountsCount} pegawai aktif
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Data jam absen masuk &amp; pulang yang tercatat di sistem administrasi HR.
            </p>
          </div>

          <div className="bento p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              Lapisan 3 · Responden Psikologis Aktif
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-ink tabular-nums">
                {aggregateReport.activeRespondents}
              </p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  aggregateReport.meetsThreshold
                    ? "bg-sage-100 text-sage-700"
                    : "bg-coral-100 text-coral-700",
                )}
              >
                Ambang Min. {aggregateReport.thresholdRequired} Orang
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              {aggregateReport.meetsThreshold
                ? "Ambang k-anonymity terpenuhi — laporan agregat diizinkan tampil."
                : "Di bawah ambang 10 orang — laporan agregat dikunci otomatis."}
            </p>
          </div>

          <div className="bento border-sage-200 bg-sage-50/60 p-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage-700">
              <EyeOff className="size-3.5" /> Lapisan 2 · Akses Individual HR
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">0% · Diblokir Sistem</p>
            <p className="mt-1 text-xs text-ink-soft">
              Mood harian, warna indikator individu, catatan refleksi, dan sesi psikolog dienkripsi &amp; tidak dapat diakses HR.
            </p>
          </div>
        </Reveal>

        {/* Section A: Anonymous Aggregate Report (Layer 3) with >= 10 Respondents Threshold Guard */}
        <Reveal className="mt-6 bento p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/8 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">
                <BarChart3 className="size-3.5" /> Lapisan Data 3 · Laporan Agregat Anonim
              </span>
              <h3 className="mt-3 text-xl font-semibold text-ink">
                Statistik Kesejahteraan Psikologis Tingkat Organisasi
              </h3>
              <p className="mt-1 text-xs text-ink-soft">{aggregateReport.notice}</p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-cream px-4 py-2.5 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                Status Ambang Anonimitas (Pasal 6 Ayat 5b)
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-bold",
                  aggregateReport.meetsThreshold ? "text-sage-700" : "text-coral-600",
                )}
              >
                {aggregateReport.activeRespondents} / {aggregateReport.thresholdRequired} Responden Aktif
              </p>
            </div>
          </div>

          {!aggregateReport.meetsThreshold || !metrics ? (
            /* Locked State when Active Respondents < 10 */
            <div className="mt-6 rounded-2xl border-2 border-dashed border-coral-300 bg-coral-50/70 p-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-coral-500 text-white shadow-soft">
                <ShieldAlert className="size-7" />
              </span>
              <h4 className="mt-4 text-lg font-semibold text-ink">
                Laporan Agregat Anonim Dikunci Otomatis (Responden Aktif &lt; 10 Orang)
              </h4>
              <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-ink-soft">
                Saat ini hanya terdapat <b>{aggregateReport.activeRespondents} responden aktif</b> yang memberikan Persetujuan Eksplisit Data Psikologis (di bawah ambang batas minimum{" "}
                <b>{aggregateReport.thresholdRequired} orang</b>). Sesuai{" "}
                <b>Pasal 6 Hak Akses ayat 5 huruf b Perjanjian SpillSpace</b>, sistem secara otomatis menyembunyikan seluruh grafik agregat untuk mencegah identifikasi tidak langsung (<i>re-identification</i>) terhadap pegawai.
              </p>
            </div>
          ) : (
            /* Aggregate Metrics View when >= 10 Respondents */
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* 1. Zone Distribution */}
              <div className="rounded-2xl border border-ink/8 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Distribusi Zona Kesejahteraan ({aggregateReport.totalLogsCount} Log)
                </p>
                <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-cream-200">
                  <div
                    style={{ width: `${metrics.zoneDistribution.greenPct}%` }}
                    className="bg-sage-500 transition-all"
                    title={`Green Zone: ${metrics.zoneDistribution.greenPct}%`}
                  />
                  <div
                    style={{ width: `${metrics.zoneDistribution.yellowPct}%` }}
                    className="bg-honey-500 transition-all"
                    title={`Yellow Zone: ${metrics.zoneDistribution.yellowPct}%`}
                  />
                  <div
                    style={{ width: `${metrics.zoneDistribution.redPct}%` }}
                    className="bg-coral-500 transition-all"
                    title={`Red Zone: ${metrics.zoneDistribution.redPct}%`}
                  />
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <StatusDot level="green" /> Zona Hijau (Seimbang)
                    </span>
                    <span className="font-semibold text-sage-700">
                      {metrics.zoneDistribution.greenPct}% ({metrics.zoneDistribution.greenCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <StatusDot level="yellow" /> Zona Kuning (Kewalahan)
                    </span>
                    <span className="font-semibold text-honey-700">
                      {metrics.zoneDistribution.yellowPct}% ({metrics.zoneDistribution.yellowCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <StatusDot level="red" /> Zona Merah (Beban Tinggi)
                    </span>
                    <span className="font-semibold text-coral-600">
                      {metrics.zoneDistribution.redPct}% ({metrics.zoneDistribution.redCount})
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink/8 pt-4">
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-[11px] text-ink-mute">Rata-rata Beban Otak</p>
                    <p className="mt-0.5 text-lg font-bold text-ink">
                      {metrics.avgCapacityScore}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-[11px] text-ink-mute">Rata-rata Task Load</p>
                    <p className="mt-0.5 text-lg font-bold text-ink">
                      {metrics.avgWorkloadScore}/10
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 4-Week Aggregate Trend */}
              <div className="rounded-2xl border border-ink/8 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Tren Beban Kolektif 4 Minggu Terakhir
                </p>
                <div className="mt-5 flex h-36 items-end gap-4 px-2">
                  {metrics.weeklyTrend.map((w) => {
                    const style = LEVEL_STYLES[w.level];
                    return (
                      <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-ink">
                          {w.avgScore}%
                        </span>
                        <div className="flex h-24 w-full items-end rounded-xl bg-cream p-1">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(12, w.avgScore)}%` }}
                            className={cn("w-full rounded-lg", style.bar)}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-ink-soft">
                          Minggu {w.week}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] text-ink-mute">
                  Grafik ini merangkum rata-rata seluruh responden aktif tanpa menampilkan skor per individu.
                </p>
              </div>

              {/* 3. Top Context Tags (JD-R Demands & Resources) */}
              <div className="rounded-2xl border border-ink/8 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Faktor Konteks JD-R Terbanyak (Tanpa Kutipan Teks)
                </p>
                <div className="mt-4 space-y-2.5">
                  {metrics.topContextTags.map((t) => (
                    <div
                      key={t.tag}
                      className="flex items-center justify-between rounded-xl border border-ink/6 bg-cream/60 px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            t.kind === "demand" ? "bg-coral-500" : "bg-sage-500",
                          )}
                        />
                        <span className="font-semibold text-ink">#{t.tag}</span>
                      </div>
                      <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-ink-soft">
                        {t.count}× dipilih
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-sage-50 p-3 text-[11px] text-sage-700">
                  <Lock className="size-3.5 shrink-0" />
                  <span>
                    Kutipan kalimat refleksi bebas (curhatan) dienkripsi AES-256-GCM dan tidak pernah disertakan ke laporan HR.
                  </span>
                </div>
              </div>
            </div>
          )}
        </Reveal>

        {/* Section B: HR Attendance Recap Table (Layer 1) */}
        <Reveal className="mt-6 bento p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-ink">
                <Users className="size-3.5 text-sage-600" /> Lapisan Data 1 · Rekap Kehadiran Pegawai
              </span>
              <h3 className="mt-2 text-xl font-semibold text-ink">
                Daftar Absensi Masuk &amp; Pulang Karyawan ({todayDate})
              </h3>
            </div>
            <span className="flex items-center gap-1.5 rounded-xl bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-700">
              <ShieldCheck className="size-4" /> Kolom Data Psikologis: Disembunyikan Permanen
            </span>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/8 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-200/80 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3.5">NIK / ID</th>
                  <th className="px-4 py-3.5">Nama Lengkap</th>
                  <th className="px-4 py-3.5">Divisi &amp; Jabatan</th>
                  <th className="px-4 py-3.5">Status Akun</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5">Absen Masuk</th>
                  <th className="px-4 py-3.5">Absen Pulang</th>
                  <th className="px-4 py-3.5">Total Hadir</th>
                  <th className="px-4 py-3.5">Data Psikologis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {attendanceRows.map((r) => (
                  <tr key={r.employeeId} className="hover:bg-cream/40">
                    <td className="px-4 py-3 font-mono font-semibold text-ink">{r.employeeId}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{r.fullName}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      <span className="font-medium text-ink">{r.department}</span> · {r.position}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          r.accountStatus === "active"
                            ? "bg-sage-100 text-sage-700"
                            : r.accountStatus === "pending_activation"
                              ? "bg-honey-100 text-honey-700"
                              : "bg-coral-100 text-coral-700",
                        )}
                      >
                        {r.accountStatus === "active"
                          ? "Aktif"
                          : r.accountStatus === "pending_activation"
                            ? "Belum Aktivasi"
                            : "Nonaktif / Ditarik"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.todayWorkMode ? (
                        <span className="rounded-md bg-cream-200 px-2 py-0.5 font-semibold text-ink-soft">
                          {r.todayWorkMode}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-sage-700">
                      {r.todayClockIn ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-soft">
                      {r.todayClockOut ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{r.totalDaysPresent} hari</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1 text-[11px] font-medium text-ink-mute">
                        <Lock className="size-3" /> Terenkripsi (Lapisan 2)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
