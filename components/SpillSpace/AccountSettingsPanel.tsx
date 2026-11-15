"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  Layers,
  LoaderCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { TERMS_METADATA } from "./termsData";
import { Reveal, SectionHeader, cn } from "./ui";
import type {
  ConsentAuditRecord,
  EmployeeProfile,
  WorkspaceBundle,
} from "./workspaceTypes";

export default function AccountSettingsPanel({
  employee,
  consentHistory,
  vibeLogsCount,
  bookingsCount,
  onOpenTermsModal,
  onConsentUpdated,
  onAccountDeactivated,
  onShowToast,
}: {
  employee: EmployeeProfile;
  consentHistory: ConsentAuditRecord[];
  vibeLogsCount: number;
  bookingsCount: number;
  onOpenTermsModal: () => void;
  onConsentUpdated: (payload: {
    employee: EmployeeProfile;
    psychData: WorkspaceBundle["psychData"];
    consentHistory: ConsentAuditRecord[];
    hrOverview: WorkspaceBundle["hrOverview"];
    confirmationNumber: string;
  }) => void;
  onAccountDeactivated: (message: string) => void;
  onShowToast: (msg: string) => void;
}) {
  const [processingMode, setProcessingMode] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [lastConfirmationCode, setLastConfirmationCode] = useState<string | null>(null);

  const handleConsentMode = async (
    mode: "grant_psych" | "withdraw_psych_only" | "withdraw_all_and_delete",
  ) => {
    setProcessingMode(mode);
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        onShowToast(data.error ?? "Gagal memperbarui status persetujuan.");
        return;
      }

      if (data.signedOut) {
        onAccountDeactivated(data.message);
        return;
      }

      setLastConfirmationCode(data.confirmationNumber);
      onConsentUpdated({
        employee: data.employee,
        psychData: data.psychData,
        consentHistory: data.consentHistory,
        hrOverview: data.hrOverview,
        confirmationNumber: data.confirmationNumber,
      });

      if (mode === "grant_psych") {
        onShowToast(
          `Persetujuan Eksplisit Data Psikologis diaktifkan (Bukti #${data.confirmationNumber}).`,
        );
      } else if (mode === "withdraw_psych_only") {
        onShowToast(
          `Persetujuan psikologis ditarik & ${data.deletedVibeLogs} rekam psikologis dihapus (Bukti #${data.confirmationNumber}).`,
        );
      }
    } catch {
      onShowToast("Terjadi gangguan jaringan saat memperbarui persetujuan.");
    } finally {
      setProcessingMode(null);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <section id="privacy-settings" className="scroll-mt-28 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Pengaturan Akun, Bukti Persetujuan & Hak Subjek Data (UU PDP)"
          icon={<FileCheck2 className="size-3.5" />}
          title="Kendali penuh atas"
          accent="persetujuan & data pribadimu."
          description="Sesuai Pasal 5, Pasal 8, dan Pasal 9 Perjanjian Penggunaan & Kebijakan Privasi SpillSpace, Anda berhak meninjau bukti persetujuan elektronik, menarik persetujuan psikologis kapan saja, atau meminta penghapusan data."
        />

        {lastConfirmationCode && (
          <Reveal className="mt-8 rounded-2xl border border-sage-300 bg-sage-50 p-4 text-xs text-sage-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-4" />
                Konfirmasi Tertulis Elektronik Terakhir: <b>#{lastConfirmationCode}</b>
              </span>
              <span className="text-[11px]">
                Tercatat pada log audit sesuai Pasal 9 ayat 4 Perjanjian
              </span>
            </div>
          </Reveal>
        )}

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: Electronic Consent Proof & Rights Actions */}
          <Reveal className="bento p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/8 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
                  <BadgeCheck className="size-3.5" /> Bukti Persetujuan Elektronik (Pasal 5 Ayat 4)
                </span>
                <h3 className="mt-2.5 text-xl font-semibold text-ink">
                  Status Persetujuan Clickwrap Anda
                </h3>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Versi Dokumen: <b>{employee.consentVersion ?? TERMS_METADATA.version}</b> · Disetujui pada:{" "}
                  <b>
                    {employee.consentedAt
                      ? new Date(employee.consentedAt).toLocaleString("id-ID")
                      : "—"}
                  </b>
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenTermsModal}
                className="flex items-center gap-1.5 rounded-xl border border-ink/12 bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-cream"
              >
                <BookOpen className="size-3.5 text-sage-600" />
                Baca Dokumen T&amp;C
              </button>
            </div>

            {/* Two-Tier Consent Status Cards */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sage-200 bg-sage-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">1. Persetujuan Umum</span>
                  <span className="rounded-full bg-sage-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Aktif
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-ink-soft">
                  Mengizinkan pemrosesan Data Identitas &amp; Data Teknis (Lapisan 1) untuk pengelolaan akun dan absensi masuk/pulang.
                </p>
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-4",
                  employee.psychConsent
                    ? "border-sage-200 bg-sage-50/60"
                    : "border-honey-300 bg-honey-50/60",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    2. Persetujuan Eksplisit Psikologis
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white",
                      employee.psychConsent ? "bg-sage-600" : "bg-honey-600",
                    )}
                  >
                    {employee.psychConsent ? "Aktif" : "Tidak Diaktifkan / Ditarik"}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-ink-soft">
                  {employee.psychConsent
                    ? `Mengizinkan pemrosesan Lapisan 2 (${vibeLogsCount} Vibe Check & ${bookingsCount} sesi konseling tersimpan secara terenkripsi).`
                    : "Fitur Daily Vibe Check, laporan bulanan, dan konseling psikolog saat ini dinonaktifkan."}
                </p>
              </div>
            </div>

            {/* 3-Layer Data Separation Architecture Card */}
            <div className="mt-6 rounded-2xl border border-ink/8 bg-cream/70 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
                <Layers className="size-3.5 text-sage-600" /> Pemisahan 3 Lapisan Data Anda di Server (Pasal 9 Ayat 1)
              </p>
              <div className="mt-3 grid gap-2.5 text-xs sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 ring-1 ring-ink/6">
                  <p className="font-semibold text-ink">Lapisan 1 · Identitas</p>
                  <p className="mt-1 font-mono text-[11px] text-sage-700">{employee.employeeId}</p>
                  <p className="mt-1 text-[11px] text-ink-mute">
                    Nama, Divisi, &amp; Jam Absensi. Hanya untuk administrasi kehadiran.
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-ink/6">
                  <p className="font-semibold text-ink">Lapisan 2 · Psikologis</p>
                  <p className="mt-1 font-mono text-[11px] text-honey-700">
                    Token: {employee.anonCode} (HMAC)
                  </p>
                  <p className="mt-1 text-[11px] text-ink-mute">
                    Tanpa kolom nama/NIK. Curhatan dienkripsi AES-256-GCM.
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-ink/6">
                  <p className="font-semibold text-ink">Lapisan 3 · Agregat</p>
                  <p className="mt-1 font-mono text-[11px] text-ink-soft">Min. 10 Responden</p>
                  <p className="mt-1 text-[11px] text-ink-mute">
                    Statistik kolektif untuk evaluasi beban kerja organisasi.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons for Consent Management & Deletion (Pasal 8 & 9) */}
            <div className="mt-6 space-y-3 border-t border-ink/8 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Tindakan Hak Subjek Data (Pasal 8 &amp; Pasal 9)
              </p>

              {employee.psychConsent ? (
                <button
                  type="button"
                  disabled={processingMode !== null}
                  onClick={() => handleConsentMode("withdraw_psych_only")}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-honey-300 bg-honey-50/80 px-4 py-3.5 text-left text-xs transition hover:bg-honey-100/80 disabled:opacity-60"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      Tarik Persetujuan Data Psikologis Saja &amp; Hapus Rekam Psikologis (Lapisan 2)
                    </p>
                    <p className="mt-0.5 text-ink-soft">
                      Menghapus seluruh catatan Vibe Check ({vibeLogsCount} entri) &amp; jadwal konseling Anda dari server, namun <b>akun absensi (Lapisan 1) tetap aktif</b>.
                    </p>
                  </div>
                  {processingMode === "withdraw_psych_only" ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-honey-700" />
                  ) : (
                    <span className="shrink-0 rounded-xl bg-honey-600 px-3 py-1.5 font-semibold text-white">
                      Tarik Persetujuan Psikologis
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processingMode !== null}
                  onClick={() => handleConsentMode("grant_psych")}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-sage-300 bg-sage-50 px-4 py-3.5 text-left text-xs transition hover:bg-sage-100 disabled:opacity-60"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      Berikan Persetujuan Eksplisit Data Psikologis
                    </p>
                    <p className="mt-0.5 text-ink-soft">
                      Aktifkan kembali fitur Daily Vibe Check, Laporan Bulanan, dan Konseling Psikolog Mitra.
                    </p>
                  </div>
                  {processingMode === "grant_psych" ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-sage-700" />
                  ) : (
                    <span className="shrink-0 rounded-xl bg-sage-600 px-3 py-1.5 font-semibold text-white">
                      Aktifkan Sekarang
                    </span>
                  )}
                </button>
              )}

              {/* Full Account Withdrawal & Deletion */}
              {!confirmDeleteOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-coral-200 bg-coral-50/50 px-4 py-3.5 text-left text-xs transition hover:border-coral-300 hover:bg-coral-50"
                >
                  <div>
                    <p className="font-semibold text-coral-700">
                      Tarik Seluruh Persetujuan, Hapus Data &amp; Nonaktifkan Akun (Pasal 9 Ayat 3–4)
                    </p>
                    <p className="mt-0.5 text-ink-soft">
                      Menghentikan seluruh pemrosesan data, menghapus permanen Data Psikologis, dan menonaktifkan akun beserta konfirmasi tertulis elektronik.
                    </p>
                  </div>
                  <Trash2 className="size-4 shrink-0 text-coral-600" />
                </button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border-2 border-coral-400 bg-coral-50 p-4 text-xs"
                  >
                    <div className="flex items-start gap-2.5 text-coral-700">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Konfirmasi Konsekuensi Penarikan Seluruh Persetujuan (Pasal 9 Ayat 3)
                        </p>
                        <p className="mt-1 text-ink-soft">
                          Sesuai Pasal 9 ayat 3 &amp; 4 Perjanjian, penarikan persetujuan penuh akan: (1) menghentikan penyediaan Layanan bagi Anda, (2) menghapus atau menganonimkan Data Psikologis secara permanen sehingga tidak dapat dipulihkan, dan (3) mengeluarkan Anda dari sesi saat ini.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={processingMode !== null}
                            onClick={() => handleConsentMode("withdraw_all_and_delete")}
                            className="flex items-center gap-1.5 rounded-xl bg-coral-600 px-3.5 py-2 font-semibold text-white hover:bg-coral-700"
                          >
                            {processingMode === "withdraw_all_and_delete" && (
                              <LoaderCircle className="size-3.5 animate-spin" />
                            )}
                            Ya, Hapus Data &amp; Nonaktifkan Akun Saya
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteOpen(false)}
                            className="rounded-xl bg-white px-3.5 py-2 font-semibold text-ink hover:bg-cream"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </Reveal>

          {/* Right: Electronic Consent Audit Log Table */}
          <Reveal delay={0.08} className="bento p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Pasal 5 Ayat 4 · Rekam Jejak Audit
                </p>
                <h3 className="mt-1 text-lg font-semibold text-ink">
                  Riwayat Bukti Persetujuan Elektronik
                </h3>
              </div>
              <KeyRound className="size-4 text-sage-600" />
            </div>

            <p className="mt-2 text-xs text-ink-soft">
              Setiap tindakan pemberian atau penarikan persetujuan dicatat beserta waktu, versi dokumen, dan alamat IP sebagai bukti kepatuhan UU PDP.
            </p>

            <div className="mt-4 max-h-[380px] overflow-y-auto rounded-2xl border border-ink/8 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-cream-200/90 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-3.5 py-3">Waktu</th>
                    <th className="px-3.5 py-3">Aksi Tercatat</th>
                    <th className="px-3.5 py-3">Umum</th>
                    <th className="px-3.5 py-3">Psikologis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {consentHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/40">
                      <td className="px-3.5 py-3 font-mono text-[11px] text-ink-soft">
                        {new Date(item.recordedAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-3.5 py-3">
                        <p className="font-semibold text-ink">{item.action}</p>
                        <p className="text-[10px] text-ink-mute">
                          {item.documentVersion} · IP {item.ipAddress}
                        </p>
                      </td>
                      <td className="px-3.5 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold",
                            item.generalConsent
                              ? "bg-sage-100 text-sage-700"
                              : "bg-coral-100 text-coral-700",
                          )}
                        >
                          {item.generalConsent ? "Ya" : "Ditarik"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold",
                            item.psychConsent
                              ? "bg-sage-100 text-sage-700"
                              : "bg-honey-100 text-honey-700",
                          )}
                        >
                          {item.psychConsent ? "Eksplisit" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-cream p-3.5 text-xs text-ink-soft">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheck className="size-4 text-sage-600" />
                Pejabat Pelindung Data Pribadi (DPO):
              </p>
              <p className="mt-1">
                {TERMS_METADATA.dpoName} · Saluran Pengaduan: <b>{TERMS_METADATA.privacyEmail}</b> (Hotline Bebas Pulsa: {TERMS_METADATA.hotline}).
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
