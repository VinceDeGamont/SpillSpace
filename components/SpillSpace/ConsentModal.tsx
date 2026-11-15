"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  FileCheck2,
  HeartHandshake,
  Layers,
  Lock,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  FULL_TERMS_SECTIONS,
  LAYERED_SUMMARY_QA,
  TERMS_METADATA,
} from "./termsData";
import { cn } from "./ui";

export type ConsentSelection = {
  generalConsent: boolean;
  psychConsent: boolean;
};

export default function ConsentModal({
  canDismiss,
  initialGeneralConsent = false,
  initialPsychConsent = false,
  readOnly = false,
  onAgree,
  onClose,
}: {
  canDismiss: boolean;
  initialGeneralConsent?: boolean;
  initialPsychConsent?: boolean;
  readOnly?: boolean;
  onAgree?: (selection: ConsentSelection) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"summary" | "full">("summary");
  const [openSectionId, setOpenSectionId] = useState<string>("pengantar");
  const [generalChecked, setGeneralChecked] = useState(initialGeneralConsent);
  const [psychChecked, setPsychChecked] = useState(initialPsychConsent);

  const titleId = useId();
  const generalId = useId();
  const psychId = useId();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canDismiss) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [canDismiss, onClose]);

  const expandAllAndSwitch = () => {
    setActiveTab("full");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        aria-hidden
        className="fixed inset-0 bg-ink/40 backdrop-blur-md"
        onClick={() => canDismiss && onClose()}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-cream shadow-lift"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
      >
        {/* Header */}
        <div className="border-b border-ink/8 bg-white/85 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-ink text-cream">
                <span className="font-serif text-lg italic leading-none">s</span>
              </span>
              <span className="text-sm font-semibold text-ink">SpillSpace</span>
              <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-[11px] font-semibold text-sage-700">
                Clickwrap Agreement &amp; Kebijakan Privasi Berlapis
              </span>
              <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-ink-mute">
                Terakhir Diperbarui: {TERMS_METADATA.lastUpdated}
              </span>
            </div>
            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dokumen perjanjian"
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink-mute transition hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          <h2
            id={titleId}
            className="mt-3 text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Clickwrap Agreement dan Kebijakan Privasi Platform{" "}
            <span className="font-serif font-normal italic text-sage-600">SpillSpace</span>
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Disusun dalam <b>format berlapis</b> (Ringkasan &amp; 11 Bab Ketentuan Lengkap) sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) dan Kode Etik Psikologi Indonesia.
          </p>

          {/* Layered switcher */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl bg-cream-200 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition",
                  activeTab === "summary"
                    ? "bg-white text-ink shadow-soft"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                <Layers className="size-3.5 text-sage-600" />
                Lapisan 1: Ringkasan Cepat (6 Tanya-Jawab)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("full")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition",
                  activeTab === "full"
                    ? "bg-white text-ink shadow-soft"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                <BookOpen className="size-3.5 text-sage-600" />
                Lapisan 2: Ketentuan Lengkap (Pasal 1–11)
              </button>
            </div>
            <span className="text-xs text-ink-mute">
              Pengelola: <b>PT Wellmind Karya Digital</b> · PSE {TERMS_METADATA.pseNumber}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <AnimatePresence mode="wait">
            {activeTab === "summary" ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 3 Core Promises Banner */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-sage-200 bg-sage-50/70 p-4">
                    <span className="inline-grid size-9 place-items-center rounded-xl bg-sage-100 text-sage-700">
                      <Lock className="size-4.5" />
                    </span>
                    <p className="mt-2.5 text-sm font-semibold text-ink">
                      Pemisahan 3 Lapisan Data
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      Data Identitas, Data Psikologis, dan Laporan Agregat Anonim disimpan terpisah dengan enkripsi penuh.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-honey-200 bg-honey-50/70 p-4">
                    <span className="inline-grid size-9 place-items-center rounded-xl bg-honey-100 text-honey-700">
                      <BadgeCheck className="size-4.5" />
                    </span>
                    <p className="mt-2.5 text-sm font-semibold text-ink">
                      Ambang Anonimitas ≥ 10 Orang
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      Perusahaan hanya menerima Laporan Agregat Anonim jika responden aktif minimal 10 orang. Tanpa kutipan curhatan.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-coral-200 bg-coral-50/70 p-4">
                    <span className="inline-grid size-9 place-items-center rounded-xl bg-coral-100 text-coral-600">
                      <HeartHandshake className="size-4.5" />
                    </span>
                    <p className="mt-2.5 text-sm font-semibold text-ink">
                      Dilarang untuk KPI &amp; PHK
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      Perusahaan dilarang keras memakai hasil Layanan untuk penilaian performa, sanksi, mutasi, atau PHK.
                    </p>
                  </div>
                </div>

                {/* 6 Q&A Ringkasan dari Halaman 2 PDF */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-mute">
                      Ringkasan Utama (Pasal 1 &amp; Ringkasan Berlapis)
                    </h3>
                    <button
                      type="button"
                      onClick={expandAllAndSwitch}
                      className="text-xs font-semibold text-sage-700 underline-offset-4 hover:underline"
                    >
                      Baca 11 Bab Ketentuan Lengkap →
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {LAYERED_SUMMARY_QA.map((item) => (
                      <div
                        key={item.question}
                        className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft"
                      >
                        <p className="text-sm font-semibold text-ink">{item.question}</p>
                        <p className="mt-1 text-xs font-semibold text-sage-700">
                          {item.shortAnswer}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                <div className="mb-3 flex items-center justify-between rounded-2xl bg-sage-50 px-4 py-3 text-xs text-sage-700 ring-1 ring-sage-200">
                  <span className="flex items-center gap-2 font-medium">
                    <Scale className="size-4 shrink-0" />
                    Ketentuan Lengkap Berlapis (Pasal 1 s.d. Pasal 11). Klik setiap judul bab untuk membuka rincian pasal.
                  </span>
                  <span className="font-mono text-[11px]">{TERMS_METADATA.version}</span>
                </div>

                {FULL_TERMS_SECTIONS.map((sec) => {
                  const isOpen = openSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      className="overflow-hidden rounded-2xl border border-ink/8 bg-white transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenSectionId(isOpen ? "" : sec.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-cream/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-xs font-bold text-cream">
                            {sec.number}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">{sec.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="hidden rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-ink-soft sm:inline">
                            {sec.tag}
                          </span>
                          <ChevronDown
                            className={cn(
                              "size-4 text-ink-mute transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 border-t border-ink/6 bg-cream/40 px-5 py-4 text-xs leading-relaxed text-ink-soft">
                              {sec.paragraphs?.map((p, idx) => (
                                <p key={idx}>{p}</p>
                              ))}
                              {sec.bullets && (
                                <ul className="space-y-2.5">
                                  {sec.bullets.map((b, idx) => (
                                    <li key={idx} className="rounded-xl bg-white p-3 ring-1 ring-ink/5">
                                      {b.label && (
                                        <p className="font-semibold text-ink">{b.label}</p>
                                      )}
                                      <p className={cn(b.label && "mt-1")}>{b.text}</p>
                                      {b.subBullets && (
                                        <ul className="mt-2 space-y-1 border-l-2 border-sage-300 pl-3 text-[11.5px] text-ink-soft">
                                          {b.subBullets.map((sub, sIdx) => (
                                            <li key={sIdx}>{sub}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {sec.highlightBox && (
                                <div className="rounded-xl bg-honey-50 p-3 font-medium text-honey-700 ring-1 ring-honey-200">
                                  {sec.highlightBox}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — Two-tier Consent Checkboxes (Pasal 5 / Halaman 4 PDF) */}
        <div className="border-t border-ink/8 bg-white/95 px-6 py-5 sm:px-8">
          {readOnly ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <ShieldCheck className="size-4 text-sage-600" />
                <span>
                  Dokumen referensi: <b>{TERMS_METADATA.version}</b> · DPO:{" "}
                  <b>{TERMS_METADATA.dpoName}</b> ({TERMS_METADATA.dpoEmail})
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-cream transition hover:bg-ink/90"
              >
                Tutup Dokumen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mute">
                <FileCheck2 className="size-3.5 text-sage-600" />
                Persetujuan Pemrosesan Data Pribadi (Dua Tingkat Terpisah — Pasal 5)
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {/* Tingkat 1: Persetujuan Umum */}
                <label
                  htmlFor={generalId}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition",
                    generalChecked
                      ? "border-sage-400 bg-sage-50/80"
                      : "border-ink/12 bg-cream/60 hover:border-ink/25",
                  )}
                >
                  <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                    <input
                      id={generalId}
                      type="checkbox"
                      checked={generalChecked}
                      onChange={(e) => setGeneralChecked(e.target.checked)}
                      className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border-2 border-ink/30 bg-white transition checked:border-sage-600 checked:bg-sage-600"
                    />
                    <Check
                      className="pointer-events-none relative size-3.5 scale-50 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-xs leading-relaxed text-ink">
                    <b className="block text-ink">
                      1. Persetujuan Umum <span className="text-coral-600">(Wajib Akun &amp; Absensi)</span>
                    </b>
                    Saya telah membaca dan memahami Perjanjian ini, serta menyetujui Syarat Penggunaan Layanan dan Pemrosesan Data Identitas serta Data Teknis untuk pengelolaan akun dan presensi.
                  </span>
                </label>

                {/* Tingkat 2: Persetujuan Eksplisit Data Psikologis */}
                <label
                  htmlFor={psychId}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition",
                    psychChecked
                      ? "border-sage-400 bg-sage-50/80"
                      : "border-ink/12 bg-cream/60 hover:border-ink/25",
                  )}
                >
                  <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                    <input
                      id={psychId}
                      type="checkbox"
                      checked={psychChecked}
                      onChange={(e) => setPsychChecked(e.target.checked)}
                      className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border-2 border-ink/30 bg-white transition checked:border-sage-600 checked:bg-sage-600"
                    />
                    <Check
                      className="pointer-events-none relative size-3.5 scale-50 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-xs leading-relaxed text-ink">
                    <b className="block text-ink">
                      2. Persetujuan Eksplisit Data Psikologis{" "}
                      <span className="text-sage-700">(Kotak Terpisah)</span>
                    </b>
                    Saya secara eksplisit menyetujui Pemrosesan Data Psikologis (formulir harian, Indikator Warna, laporan bulanan, evaluasi Psikolog, &amp; Laporan Agregat Anonim).
                  </span>
                </label>
              </div>

              <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
                <p className="text-[11.5px] text-ink-mute">
                  🔒 Bukti persetujuan disimpan bersama waktu persetujuan, versi dokumen (<b>{TERMS_METADATA.version}</b>), dan identitas akun Anda.
                </p>
                <button
                  type="button"
                  disabled={!generalChecked}
                  onClick={() =>
                    onAgree?.({
                      generalConsent: generalChecked,
                      psychConsent: psychChecked,
                    })
                  }
                  className={cn(
                    "group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition",
                    generalChecked
                      ? "bg-ink text-cream shadow-lift hover:bg-ink/90"
                      : "cursor-not-allowed bg-ink/10 text-ink/40",
                  )}
                >
                  Saya Setuju dan Melanjutkan
                  <ArrowRight
                    className={cn(
                      "size-4 transition-transform",
                      generalChecked && "group-hover:translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
