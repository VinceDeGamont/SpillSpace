"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  Eye,
  EyeOff,
  FileCheck2,
  KeyRound,
  Layers,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import type { ConsentSelection } from "./ConsentModal";
import { Logo } from "./Navbar";
import { LAYERED_SUMMARY_QA, TERMS_METADATA } from "./termsData";
import { cn } from "./ui";
import type { AccountStatus, UserRole, WorkspaceBundle } from "./workspaceTypes";

type LookedUpEmployee = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  accountStatus: AccountStatus;
};

const DEMO_ACCOUNTS = [
  {
    id: "EMP-2026-011",
    name: "Nabila Putri",
    badge: "Belum Aktivasi (Demo Buat Akun & T&C)",
    mode: "activate" as const,
    tone: "bg-honey-100 text-honey-700 border-honey-300",
  },
  {
    id: "EMP-2026-012",
    name: "Dimas Arya",
    badge: "Belum Aktivasi #2",
    mode: "activate" as const,
    tone: "bg-honey-50 text-honey-700 border-honey-200",
  },
  {
    id: "EMP-2026-001",
    name: "Budi Santoso",
    badge: "Karyawan Aktif (Green Zone)",
    mode: "login" as const,
    tone: "bg-sage-100 text-sage-700 border-sage-300",
  },
  {
    id: "EMP-2026-002",
    name: "Alya Rahmawati",
    badge: "Karyawan Aktif (Red Alert)",
    mode: "login" as const,
    tone: "bg-coral-100 text-coral-700 border-coral-300",
  },
  {
    id: "HR-2026-001",
    name: "Sinta Dewi (HR)",
    badge: "HR People Partner",
    mode: "login" as const,
    tone: "bg-cream-200 text-ink border-ink/15",
  },
];

export default function AuthGate({
  generalConsent,
  psychConsent,
  onConsentChange,
  onOpenFullTermsModal,
  onAuthenticated,
  onShowToast,
}: {
  generalConsent: boolean;
  psychConsent: boolean;
  onConsentChange: (next: ConsentSelection) => void;
  onOpenFullTermsModal: () => void;
  onAuthenticated: (workspace: WorkspaceBundle, welcomeMessage: string) => void;
  onShowToast: (msg: string) => void;
}) {
  const [tab, setTab] = useState<"login" | "activate">("login");

  // Login state
  const [loginId, setLoginId] = useState("EMP-2026-001");
  const [loginPassword, setLoginPassword] = useState("Password123!");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Activation state
  const [activateId, setActivateId] = useState("EMP-2026-011");
  const [lookedUp, setLookedUp] = useState<LookedUpEmployee | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  // Shared UI status
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const performLookup = async (targetId: string) => {
    const cleanId = targetId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMsg("Masukkan Nomor Induk Karyawan (NIK) terlebih dahulu.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookup", employeeId: cleanId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLookedUp(null);
        setErrorMsg(data.error ?? "Gagal memeriksa ID Karyawan.");
        return;
      }
      setLookedUp(data.employee);
      if (data.employee.accountStatus === "active") {
        setInfoBanner(
          `Akun ${data.employee.employeeId} (${data.employee.fullName}) sudah aktif. Anda dapat langsung masuk melalui tab Login Karyawan.`,
        );
      } else {
        setInfoBanner(null);
      }
    } catch {
      setErrorMsg("Gagal menghubungi server autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoBanner(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          employeeId: loginId.trim().toUpperCase(),
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.needsActivation) {
          const targetId = data.employeeId ?? loginId.trim().toUpperCase();
          setTab("activate");
          setActivateId(targetId);
          setInfoBanner(data.error);
          await performLookup(targetId);
          return;
        }
        setErrorMsg(data.error ?? "Login gagal.");
        return;
      }

      onAuthenticated(
        data.workspace,
        `Selamat datang kembali, ${data.workspace.employee.fullName}! Sesi terenkripsi aktif 🔒`,
      );
    } catch {
      setErrorMsg("Terjadi gangguan jaringan saat memproses login.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoBanner(null);

    if (!lookedUp) {
      setErrorMsg("Silakan klik 'Cek Data Master HR' terlebih dahulu untuk memverifikasi NIK Anda.");
      return;
    }
    if (lookedUp.accountStatus === "active") {
      setErrorMsg("Akun ini sudah aktif. Silakan gunakan tab Login Karyawan.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Kata sandi baru minimal terdiri dari 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!generalConsent) {
      setErrorMsg(
        "Sesuai Pasal 5 ayat 2 Perjanjian, Anda wajib mencentang Persetujuan Umum sebelum mengklik 'Saya Setuju dan Melanjutkan'.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "activate",
          employeeId: lookedUp.employeeId,
          password: newPassword,
          generalConsent,
          psychConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Gagal mengaktifkan akun.");
        return;
      }
      onAuthenticated(
        data.workspace,
        `Akun ${data.workspace.employee.employeeId} berhasil diaktifkan! Bukti persetujuan elektronik tercatat ✓`,
      );
    } catch {
      setErrorMsg("Terjadi kesalahan saat mengaktifkan akun.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = async (item: (typeof DEMO_ACCOUNTS)[number]) => {
    setErrorMsg(null);
    setInfoBanner(null);
    if (item.mode === "login") {
      setTab("login");
      setLoginId(item.id);
      setLoginPassword("Password123!");
      onShowToast(`Akun demo ${item.id} (${item.name}) siap digunakan — klik Masuk.`);
    } else {
      setTab("activate");
      setActivateId(item.id);
      setNewPassword("Password123!");
      setConfirmPassword("Password123!");
      onConsentChange({ generalConsent: false, psychConsent: false });
      await performLookup(item.id);
      onShowToast(`Data Master HR ${item.id} (${item.name}) dimuat. Silakan tinjau Clickwrap T&C.`);
    }
  };

  const handleResetDemoDb = async () => {
    setResetting(true);
    setErrorMsg(null);
    setInfoBanner(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_demo" }),
      });
      const data = await res.json();
      if (data.ok) {
        setLookedUp(null);
        onConsentChange({ generalConsent: false, psychConsent: false });
        onShowToast("Database SQLite berhasil di-reset ke kondisi awal presentasi.");
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-white/80 px-5 py-3.5 shadow-soft backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden h-4 w-px bg-ink/15 sm:inline-block" />
            <span className="hidden text-xs font-medium text-ink-soft sm:inline">
              Portal Absensi Karyawan &amp; Kesejahteraan Psikologis Kerja (JD-R Model)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenFullTermsModal}
              className="flex items-center gap-1.5 rounded-xl border border-ink/10 bg-cream px-3 py-2 text-xs font-semibold text-ink transition hover:bg-cream-200"
            >
              <BookOpen className="size-3.5 text-sage-600" />
              Baca Dokumen T&amp;C Lengkap (11 Bab)
            </button>
            <button
              type="button"
              onClick={handleResetDemoDb}
              disabled={resetting}
              className="flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-ink/25 hover:text-ink disabled:opacity-50"
              title="Reset seluruh akun dan data SQLite ke kondisi awal demo"
            >
              <RotateCcw className={cn("size-3.5", resetting && "animate-spin")} />
              Reset Data Demo
            </button>
          </div>
        </div>

        {/* Quick Demo Selector Bar for Class Presentation */}
        <div className="mt-4 rounded-2xl border border-ink/8 bg-white/75 p-3.5 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-ink-mute">
              <Sparkles className="size-3.5 text-sage-600" /> Pintasan Demo Presentasi:
            </span>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectDemoAccount(acc)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-soft",
                  acc.tone,
                )}
              >
                <span>{acc.id}</span>
                <span className="opacity-75">· {acc.name}</span>
                <span className="rounded-md bg-white/75 px-1.5 py-0.5 text-[10px] font-bold">
                  {acc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.05fr_1.25fr]">
          {/* Left Column: Corporate Context & 3-Layer Data Protection Guarantee */}
          <div className="space-y-5">
            <div className="bento p-7 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-sage-100 px-3.5 py-1.5 text-xs font-semibold text-sage-700">
                <Building2 className="size-3.5" /> Portal Internal Karyawan · PT Wellmind Karya Digital
              </span>
              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Absen masuk &amp; pulang dalam satu pintu,{" "}
                <span className="font-serif font-normal italic text-sage-600">
                  ruang aman psikologis
                </span>{" "}
                di lapisan terpisah.
              </h1>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
                Sesuai kebijakan perusahaan dan <b>UU No. 27 Tahun 2022 (UU PDP)</b>, setiap pegawai wajib masuk menggunakan <b>Nomor Induk Karyawan (NIK)</b> dan kata sandi untuk melakukan absensi kehadiran harian maupun mengakses fitur pemantauan kesejahteraan kerja.
              </p>

              {/* 3 Architectural Guarantees from the PDF */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3.5 rounded-2xl border border-sage-200/80 bg-sage-50/60 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-600 text-white">
                    <Layers className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Arsitektur Pemisahan 3 Lapisan Data (Pasal 9 ayat 1)
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                      <b>Lapisan 1 (Identitas &amp; Absensi)</b> terhubung dengan sistem kehadiran HR.{" "}
                      <b>Lapisan 2 (Data Psikologis)</b> dipisahkan dengan token pseudonim HMAC-SHA256 dan enkripsi AES-256-GCM sehingga HR/Manajemen tidak dapat membaca mood atau curhatan individu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl border border-honey-200/80 bg-honey-50/60 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-honey-500 text-white">
                    <FileCheck2 className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Clickwrap Agreement Dua Tingkat Persetujuan (Pasal 5 ayat 2)
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                      Saat membuat akun pertama kali, pegawai menyetujui <b>Persetujuan Umum</b> (untuk akun &amp; absensi) dan secara terpisah memilih <b>Persetujuan Eksplisit Data Psikologis</b> (tidak dicentang otomatis).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl border border-ink/10 bg-white p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-cream">
                    <ShieldCheck className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Ambang Minimum Anonimitas ≥ 10 Responden (Pasal 6 ayat 5b)
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                      Divisi HR hanya dapat melihat <b>Laporan Agregat Anonim (Lapisan 3)</b> apabila jumlah pegawai aktif yang menyetujui pemrosesan psikologis mencapai minimal 10 orang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-cream-200/70 p-4 text-xs text-ink-soft">
                <p className="font-semibold text-ink">Informasi Kredensial Demo:</p>
                <ul className="mt-1.5 space-y-1">
                  <li>
                    • <b>Akun Karyawan Aktif:</b> <code>EMP-2026-001</code> s/d <code>EMP-2026-010</code> (Sandi: <code>Password123!</code>)
                  </li>
                  <li>
                    • <b>Akun Baru (Belum Aktivasi):</b> <code>EMP-2026-011</code> (Nabila) &amp; <code>EMP-2026-012</code> (Dimas)
                  </li>
                  <li>
                    • <b>Akun HR People Partner:</b> <code>HR-2026-001</code> (Sandi: <code>Password123!</code>)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Login & Account Activation Card */}
          <div className="bento overflow-hidden p-6 sm:p-8">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 rounded-2xl bg-cream-200 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrorMsg(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
                  tab === "login"
                    ? "bg-white text-ink shadow-soft"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                <KeyRound className="size-4 text-sage-600" />
                Masuk &amp; Absensi
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("activate");
                  setErrorMsg(null);
                  if (!lookedUp && activateId) {
                    void performLookup(activateId);
                  }
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
                  tab === "activate"
                    ? "bg-white text-ink shadow-soft"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                <UserPlus className="size-4 text-sage-600" />
                Buat / Aktivasi Akun Baru
              </button>
            </div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-5 flex items-start gap-3 rounded-2xl border border-coral-300 bg-coral-50 p-4 text-xs leading-relaxed text-coral-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
              {infoBanner && !errorMsg && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-5 flex items-start gap-3 rounded-2xl border border-honey-300 bg-honey-50 p-4 text-xs leading-relaxed text-honey-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{infoBanner}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-ink">
                      Masuk Portal Pegawai SpillSpace
                    </h2>
                    <p className="mt-1 text-xs text-ink-soft">
                      Gunakan ID Karyawan (NIK) dan kata sandi Anda untuk melakukan Absen Masuk, Absen Pulang, atau mengisi Daily Vibe Check.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      ID Karyawan / Nomor Induk Karyawan (NIK)
                    </label>
                    <input
                      type="text"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                      placeholder="Contoh: EMP-2026-001 atau HR-2026-001"
                      className="mt-2 w-full rounded-2xl border border-ink/12 bg-white px-4 py-3.5 text-sm font-semibold uppercase text-ink outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Kata Sandi
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showLoginPw ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun Anda"
                        className="w-full rounded-2xl border border-ink/12 bg-white px-4 py-3.5 pr-12 text-sm text-ink outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw((v) => !v)}
                        className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-lg p-1.5 text-ink-mute hover:bg-ink/5 hover:text-ink"
                        aria-label="Tampilkan kata sandi"
                      >
                        {showLoginPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-cream shadow-lift transition hover:bg-ink/90 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" /> Memverifikasi kredensial…
                      </>
                    ) : (
                      <>
                        Masuk ke Portal Absensi &amp; Workspace
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between border-t border-ink/8 pt-4 text-xs text-ink-mute">
                    <span>Pegawai baru &amp; belum pernah aktivasi akun?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("activate");
                        void performLookup(activateId);
                      }}
                      className="font-semibold text-sage-700 underline-offset-4 hover:underline"
                    >
                      Aktivasi Akun &amp; Setujui T&amp;C →
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="activate-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleActivateSubmit}
                  className="mt-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-ink">
                      Aktivasi Akun Pegawai &amp; Persetujuan Clickwrap T&amp;C
                    </h2>
                    <p className="mt-1 text-xs text-ink-soft">
                      Verifikasi Nomor Induk Karyawan (NIK) Anda pada Data Master HR, buat kata sandi, lalu berikan persetujuan elektronik berlapis.
                    </p>
                  </div>

                  {/* Step 1: Lookup Employee ID */}
                  <div className="rounded-2xl border border-ink/10 bg-cream/60 p-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Langkah 1 · Verifikasi ID Karyawan (NIK) di Data Master HR
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={activateId}
                        onChange={(e) => setActivateId(e.target.value.toUpperCase())}
                        placeholder="Contoh: EMP-2026-011"
                        className="flex-1 rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm font-semibold uppercase text-ink outline-none focus:border-sage-500"
                      />
                      <button
                        type="button"
                        onClick={() => performLookup(activateId)}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-cream transition hover:bg-ink/90"
                      >
                        <Search className="size-3.5" />
                        Cek Data HR
                      </button>
                    </div>

                    {lookedUp && (
                      <div className="mt-3 rounded-xl border border-sage-200 bg-white p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <UserCheck className="size-4 text-sage-600" />
                            <span className="text-sm font-semibold text-ink">
                              {lookedUp.fullName}
                            </span>
                            <span className="rounded-md bg-cream-200 px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                              {lookedUp.employeeId}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              lookedUp.accountStatus === "active"
                                ? "bg-sage-100 text-sage-700"
                                : "bg-honey-100 text-honey-700",
                            )}
                          >
                            {lookedUp.accountStatus === "active"
                              ? "Sudah Aktif"
                              : "Menunggu Aktivasi & Clickwrap T&C"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-mute">
                          {lookedUp.position} · Divisi {lookedUp.department} · {lookedUp.email}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Create Password */}
                  <div className="rounded-2xl border border-ink/10 bg-cream/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Langkah 2 · Buat Kata Sandi Akun Pegawai
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Kata sandi baru (min. 6 karakter)"
                          className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 pr-9 text-sm text-ink outline-none focus:border-sage-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-mute hover:text-ink"
                        >
                          {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <div>
                        <input
                          type={showNewPw ? "text" : "password"}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-sage-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Layered Clickwrap Agreement Preview + Dual Checkboxes */}
                  <div className="rounded-2xl border border-ink/12 bg-white p-4 shadow-soft">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 pb-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-sage-700">
                          Langkah 3 · Clickwrap Agreement &amp; Kebijakan Privasi Berlapis
                        </p>
                        <p className="text-xs text-ink-mute">
                          Versi Dokumen: {TERMS_METADATA.version} · Pengelola: {TERMS_METADATA.operatorEntity}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenFullTermsModal}
                        className="flex items-center gap-1.5 rounded-xl bg-sage-100 px-3 py-1.5 text-xs font-semibold text-sage-700 transition hover:bg-sage-200"
                      >
                        <BookOpen className="size-3.5" />
                        Buka Layar Penuh (Ringkasan &amp; 11 Bab)
                      </button>
                    </div>

                    {/* Inline scrollable summary of the PDF */}
                    <div className="mt-3 max-h-48 space-y-2.5 overflow-y-auto rounded-xl bg-cream p-3 text-xs">
                      <p className="font-semibold text-ink">
                        Ringkasan Cepat Perjanjian Penggunaan &amp; Kebijakan Privasi SpillSpace:
                      </p>
                      {LAYERED_SUMMARY_QA.map((item) => (
                        <div key={item.question} className="rounded-lg bg-white p-2.5 ring-1 ring-ink/6">
                          <p className="font-semibold text-ink">{item.question}</p>
                          <p className="mt-0.5 font-medium text-sage-700">{item.shortAnswer}</p>
                          <p className="mt-0.5 text-ink-soft">{item.detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Two-Tier Checkboxes per Pasal 5 ayat 2 */}
                    <div className="mt-4 space-y-2.5">
                      {/* Checkbox 1: Persetujuan Umum */}
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                          generalConsent
                            ? "border-sage-400 bg-sage-50/70"
                            : "border-ink/12 bg-cream/40 hover:border-ink/25",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={generalConsent}
                          onChange={(e) =>
                            onConsentChange({
                              generalConsent: e.target.checked,
                              psychConsent,
                            })
                          }
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
                            generalConsent
                              ? "border-sage-600 bg-sage-600 text-white"
                              : "border-ink/25 bg-white",
                          )}
                        >
                          {generalConsent && <Check className="size-3.5" strokeWidth={3} />}
                        </span>
                        <span className="text-xs leading-relaxed text-ink">
                          <span className="font-semibold">
                            1. Persetujuan Umum (Wajib untuk Pembuatan Akun &amp; Absensi):
                          </span>{" "}
                          Saya telah membaca, memahami, dan menyetujui Perjanjian Penggunaan dan Kebijakan Privasi Platform SpillSpace untuk pemrosesan Data Identitas dan Data Teknis guna pengelolaan akun serta pencatatan kehadiran kerja.
                        </span>
                      </label>

                      {/* Checkbox 2: Persetujuan Eksplisit Data Psikologis */}
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                          psychConsent
                            ? "border-sage-400 bg-sage-50/70"
                            : "border-honey-300/80 bg-honey-50/40 hover:border-honey-400",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={psychConsent}
                          onChange={(e) =>
                            onConsentChange({
                              generalConsent,
                              psychConsent: e.target.checked,
                            })
                          }
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
                            psychConsent
                              ? "border-sage-600 bg-sage-600 text-white"
                              : "border-ink/25 bg-white",
                          )}
                        >
                          {psychConsent && <Check className="size-3.5" strokeWidth={3} />}
                        </span>
                        <span className="text-xs leading-relaxed text-ink">
                          <span className="font-semibold">
                            2. Persetujuan Eksplisit Data Psikologis (Terpisah &amp; Tidak Dicentang Otomatis):
                          </span>{" "}
                          Saya secara sadar dan tanpa paksaan memberikan persetujuan eksplisit atas pengumpulan serta pemrosesan Data Psikologis saya (Daily Vibe Check, refleksi terenkripsi, laporan bulanan, dan konseling psikolog mitra).{" "}
                          <span className="text-ink-mute">
                            (Jika tidak dicentang, akun absensi tetap aktif namun fitur psikologis dinonaktifkan).
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !generalConsent}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold transition",
                      generalConsent
                        ? "bg-ink text-cream shadow-lift hover:bg-ink/90"
                        : "cursor-not-allowed bg-ink/10 text-ink-mute",
                    )}
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" /> Menyimpan Bukti Persetujuan Elektronik…
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="size-4.5" />
                        Saya Setuju dan Melanjutkan
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-ink-mute">
                    Dengan mengklik tombol <b>&ldquo;Saya Setuju dan Melanjutkan&rdquo;</b>, sistem mencatat waktu persetujuan, alamat IP, versi dokumen, dan pilihan persetujuan Anda sebagai alat bukti elektronik yang sah (Pasal 5 ayat 1 UU ITE &amp; UU PDP).
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
