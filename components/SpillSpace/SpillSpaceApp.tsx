"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AccountSettingsPanel from "./AccountSettingsPanel";
import AttendancePanel from "./AttendancePanel";
import AuthGate from "./AuthGate";
import ConsentModal, { type ConsentSelection } from "./ConsentModal";
import type { Level, MoodId, VibeResult } from "./data";
import Footer from "./Footer";
import Hero from "./Hero";
import HrDashboardPanel from "./HrDashboardPanel";
import MonthlyDashboard from "./MonthlyDashboard";
import Navbar from "./Navbar";
import PsychologistConnect from "./PsychologistConnect";
import Science from "./Science";
import VibeCheck from "./VibeCheck";
import type { WorkspaceBundle } from "./workspaceTypes";

export default function SpillSpaceApp() {
  const [initializing, setInitializing] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceBundle | null>(null);

  // Pending consent selection during account activation in AuthGate
  const [pendingConsent, setPendingConsent] = useState<ConsentSelection>({
    generalConsent: false,
    psychConsent: false,
  });

  // Layered Clickwrap Agreement Modal state
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  // Interactive Vibe & Report state
  const [todayCheckIn, setTodayCheckIn] = useState<VibeResult | null>(null);
  const [previewLevel, setPreviewLevel] = useState<Level>("red");
  const [priorityRequested, setPriorityRequested] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  // Load existing session on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth", { method: "GET" });
        const data = await res.json();
        if (active && data.authenticated && data.workspace) {
          setWorkspace(data.workspace);
          const latestVibe = data.workspace.psychData.vibeLogs[0];
          if (latestVibe) {
            setPreviewLevel(latestVibe.colorLevel);
          }
        }
      } catch {
        // Ignore initial session check error
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openConsentModal = useCallback(() => setConsentModalOpen(true), []);
  const closeConsentModal = useCallback(() => setConsentModalOpen(false), []);

  const handleAuthenticated = useCallback(
    (bundle: WorkspaceBundle, welcomeMessage: string) => {
      setWorkspace(bundle);
      const latestVibe = bundle.psychData.vibeLogs[0];
      if (latestVibe) {
        setPreviewLevel(latestVibe.colorLevel);
      }
      showToast(welcomeMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [showToast],
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setWorkspace(null);
      setTodayCheckIn(null);
      setPriorityRequested(false);
      showToast("Anda telah keluar dari sesi portal pegawai.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showToast]);

  const handleAttendanceUpdated = useCallback(
    (
      nextAttendance: WorkspaceBundle["attendance"],
      nextHrOverview: WorkspaceBundle["hrOverview"],
    ) => {
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              attendance: nextAttendance,
              hrOverview: nextHrOverview,
            }
          : null,
      );
    },
    [],
  );

  const handleSaveVibeToDb = useCallback(
    async (payload: {
      moodId: MoodId;
      workloadScore: number;
      tags: string[];
      reflection: string;
    }) => {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_vibe",
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error ?? "Gagal menyimpan Daily Vibe Check.");
        throw new Error(data.error ?? "Save failed");
      }
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              psychData: data.psychData,
              hrOverview: data.hrOverview,
            }
          : null,
      );
      if (data.entry?.colorLevel) {
        setPreviewLevel(data.entry.colorLevel);
      }
    },
    [showToast],
  );

  const handleBookPsychologistToDb = useCallback(
    async (payload: {
      psychologistId: string;
      psychologistName: string;
      slotLabel: string;
      isPriority: boolean;
    }) => {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book_psychologist",
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error ?? "Gagal menjadwalkan sesi konseling.");
        throw new Error(data.error ?? "Booking failed");
      }
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              psychData: data.psychData,
            }
          : null,
      );
    },
    [showToast],
  );

  const handleGrantPsychConsentQuick = useCallback(async () => {
    const res = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "grant_psych" }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      showToast(data.error ?? "Gagal mengaktifkan persetujuan psikologis.");
      return;
    }
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            employee: data.employee,
            psychData: data.psychData,
            consentHistory: data.consentHistory,
            hrOverview: data.hrOverview,
          }
        : null,
    );
    showToast(
      `Persetujuan Eksplisit Data Psikologis berhasil diaktifkan (Bukti #${data.confirmationNumber})!`,
    );
  }, [showToast]);

  const handleVibeSubmit = useCallback(
    (r: VibeResult) => {
      setTodayCheckIn(r);
      showToast(
        r.level === "red"
          ? "Tersimpan secara terenkripsi. Psikolog mitra siap membantu Anda 💛"
          : r.level === "yellow"
            ? "Tersimpan di Lapisan 2. Jangan lupa ambil jeda istirahat hari ini 🌤️"
            : "Tersimpan di Lapisan 2. Ritme kerja-hidupmu terjaga baik 🌿",
      );
    },
    [showToast],
  );

  const requestPriority = useCallback(() => {
    setPriorityRequested(true);
    showToast("Permintaan sesi prioritas dikirim secara anonim ke Psikolog Mitra 💛");
    window.setTimeout(() => scrollTo("psychologists"), 450);
  }, [scrollTo, showToast]);

  const handleReportCta = useCallback(
    (level: Level) => {
      if (level === "red") setPriorityRequested(true);
      scrollTo("psychologists");
    },
    [scrollTo],
  );

  if (initializing) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white px-5 py-4 text-sm font-medium text-ink shadow-soft">
          <LoaderCircle className="size-4.5 animate-spin text-sage-600" />
          Memuat Portal Pegawai SpillSpace…
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      {!workspace ? (
        <>
          <AuthGate
            generalConsent={pendingConsent.generalConsent}
            psychConsent={pendingConsent.psychConsent}
            onConsentChange={setPendingConsent}
            onOpenFullTermsModal={openConsentModal}
            onAuthenticated={handleAuthenticated}
            onShowToast={showToast}
          />

          <AnimatePresence>
            {consentModalOpen && (
              <ConsentModal
                canDismiss
                initialGeneralConsent={pendingConsent.generalConsent}
                initialPsychConsent={pendingConsent.psychConsent}
                onAgree={(selection) => {
                  setPendingConsent(selection);
                  setConsentModalOpen(false);
                  showToast(
                    selection.psychConsent
                      ? "Persetujuan Umum & Eksplisit Psikologis dipilih. Klik 'Saya Setuju dan Melanjutkan' untuk mengaktifkan akun."
                      : "Persetujuan Umum dipilih. Klik 'Saya Setuju dan Melanjutkan' untuk mengaktifkan akun.",
                  );
                }}
                onClose={closeConsentModal}
              />
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <Navbar
            hasConsented={workspace.employee.psychConsent}
            employee={workspace.employee}
            onOpenConsent={openConsentModal}
            onNavigate={scrollTo}
            onLogout={handleLogout}
          />

          <main inert={consentModalOpen} className="relative z-10 flex-1">
            {/* 1. Employee Clock-In / Clock-Out & Personal Attendance History (Layer 1) */}
            <AttendancePanel
              employee={workspace.employee}
              attendance={workspace.attendance}
              onAttendanceUpdated={handleAttendanceUpdated}
              onScrollToVibe={() => scrollTo("vibe-check")}
              onShowToast={showToast}
            />

            {/* 2. Hero & I/O Psychology JD-R Science Overview */}
            <Hero
              onTryVibeCheck={() => scrollTo("vibe-check")}
              onOpenConsent={openConsentModal}
            />
            <Science />

            {/* 3. Encrypted 10-Second Daily Vibe Check (Layer 2) */}
            <VibeCheck
              onSubmit={handleVibeSubmit}
              onPriorityBook={requestPriority}
              priorityRequested={priorityRequested}
              psychConsent={workspace.employee.psychConsent}
              anonCode={workspace.employee.anonCode}
              personalVibeLogs={workspace.psychData.vibeLogs}
              onSaveToDb={handleSaveVibeToDb}
              onGrantPsychConsent={handleGrantPsychConsentQuick}
            />

            {/* 4. Monthly Stress Record & Work-Life Balance Dashboard */}
            <MonthlyDashboard
              level={previewLevel}
              onLevelChange={setPreviewLevel}
              todayCheckIn={todayCheckIn}
              onCta={handleReportCta}
            />

            {/* 5. Partner Psychologist Connect (1-Click Anonymous Booking) */}
            <PsychologistConnect
              priorityRequested={priorityRequested}
              previewLevel={previewLevel}
              todayCheckIn={todayCheckIn}
              onBooked={showToast}
              anonCode={workspace.employee.anonCode}
              psychConsent={workspace.employee.psychConsent}
              savedBookings={workspace.psychData.bookings}
              onBookPsychologist={handleBookPsychologistToDb}
            />

            {/* 6. HR Attendance Recap & Anonymous Aggregate Report (>= 10 Respondents Threshold) */}
            <HrDashboardPanel
              hrOverview={workspace.hrOverview}
              userRole={workspace.employee.role}
            />

            {/* 7. Account, Electronic Consent Proof & Data Subject Rights Settings */}
            <AccountSettingsPanel
              employee={workspace.employee}
              consentHistory={workspace.consentHistory}
              vibeLogsCount={workspace.psychData.vibeLogs.length}
              bookingsCount={workspace.psychData.bookings.length}
              onOpenTermsModal={openConsentModal}
              onConsentUpdated={(payload) => {
                setWorkspace((prev) =>
                  prev
                    ? {
                        ...prev,
                        employee: payload.employee,
                        psychData: payload.psychData,
                        consentHistory: payload.consentHistory,
                        hrOverview: payload.hrOverview,
                      }
                    : null,
                );
              }}
              onAccountDeactivated={(message) => {
                setWorkspace(null);
                setTodayCheckIn(null);
                showToast(message);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onShowToast={showToast}
            />

            <Footer onTryVibeCheck={() => scrollTo("vibe-check")} />
          </main>

          <AnimatePresence>
            {consentModalOpen && (
              <ConsentModal
                canDismiss
                readOnly
                initialGeneralConsent={workspace.employee.generalConsent}
                initialPsychConsent={workspace.employee.psychConsent}
                onClose={closeConsentModal}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Toast Notification */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[110] flex justify-center px-4"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="flex max-w-xl items-center gap-2.5 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-cream shadow-lift"
            >
              <CircleCheck className="size-4.5 shrink-0 text-sage-300" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
