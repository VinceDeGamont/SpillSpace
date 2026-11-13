"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ConsentModal from "./ConsentModal";
import type { Level, VibeResult } from "./data";
import Footer from "./Footer";
import Hero from "./Hero";
import MonthlyDashboard from "./MonthlyDashboard";
import Navbar from "./Navbar";
import PsychologistConnect from "./PsychologistConnect";
import Science from "./Science";
import VibeCheck from "./VibeCheck";

/**
 * SpillSpace landing page — single client island that owns all demo state:
 *  - Clickwrap consent (opens on first load)
 *  - Today's vibe-check result (feeds the dashboard & pre-counseling summary)
 *  - Monthly report preview level (Green / Yellow / Red)
 *  - Priority (Red alert) booking request
 */
export default function SpillSpaceApp() {
  const [consentOpen, setConsentOpen] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<VibeResult | null>(null);
  const [previewLevel, setPreviewLevel] = useState<Level>("red");
  const [priorityRequested, setPriorityRequested] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const scrollTo = useCallback((id: string) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openConsent = useCallback(() => setConsentOpen(true), []);
  const closeConsent = useCallback(() => setConsentOpen(false), []);
  const agree = useCallback(() => {
    const first = !hasConsented;
    setHasConsented(true);
    setConsentOpen(false);
    showToast(first ? "Welcome in ✌️ Your space is private & encrypted." : "Consent confirmed. You're all set 🔒");
  }, [hasConsented, showToast]);

  const handleVibeSubmit = useCallback(
    (r: VibeResult) => {
      setTodayCheckIn(r);
      showToast(
        r.level === "red"
          ? "Logged. A partner psychologist is here if you need them 💛"
          : r.level === "yellow"
            ? "Logged. Remember to take a breather today 🌤️"
            : "Logged. Love that for you 🌿",
      );
    },
    [showToast],
  );

  const requestPriority = useCallback(() => {
    setPriorityRequested(true);
    showToast("Priority session requested — anonymously 💛");
    window.setTimeout(() => scrollTo("psychologists"), 450);
  }, [scrollTo, showToast]);

  const handleReportCta = useCallback(
    (level: Level) => {
      if (level === "red") setPriorityRequested(true);
      scrollTo("psychologists");
    },
    [scrollTo],
  );

  return (
    <MotionConfig reducedMotion="user">
      <Navbar hasConsented={hasConsented} onOpenConsent={openConsent} onNavigate={scrollTo} />

      <main inert={consentOpen} className="relative z-10 flex-1">
        <Hero onTryVibeCheck={() => scrollTo("vibe-check")} onOpenConsent={openConsent} />
        <Science />
        <VibeCheck
          onSubmit={handleVibeSubmit}
          onPriorityBook={requestPriority}
          priorityRequested={priorityRequested}
        />
        <MonthlyDashboard
          level={previewLevel}
          onLevelChange={setPreviewLevel}
          todayCheckIn={todayCheckIn}
          onCta={handleReportCta}
        />
        <PsychologistConnect
          priorityRequested={priorityRequested}
          previewLevel={previewLevel}
          todayCheckIn={todayCheckIn}
          onBooked={showToast}
        />
        <Footer onTryVibeCheck={() => scrollTo("vibe-check")} />
      </main>

      <AnimatePresence>
        {consentOpen && <ConsentModal canDismiss={hasConsented} onAgree={agree} onClose={closeConsent} />}
      </AnimatePresence>

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[110] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="flex items-center gap-2.5 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-cream shadow-lift"
            >
              <CircleCheck className="size-4.5 text-sage-300" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
