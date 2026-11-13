"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, ChevronDown, HeartHandshake, Lock, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { cn } from "./ui";

const PROMISES = [
  {
    icon: Lock,
    title: "100% Encrypted & Confidential",
    body: "HR cannot see your individual daily answers. Ever. They only see anonymous team-level trends.",
    iconWrap: "bg-sage-100 text-sage-700",
    ring: "hover:border-sage-300",
  },
  {
    icon: BadgeCheck,
    title: "Monitored by Licensed Partner Psychologists",
    body: "Only external, licensed psychologists can access individual risk alerts — not your manager.",
    iconWrap: "bg-honey-100 text-honey-700",
    ring: "hover:border-honey-300",
  },
  {
    icon: HeartHandshake,
    title: "Honest Vibe Check",
    body: "Your data is used to balance workload — never for performance reviews, promotions or KPIs.",
    iconWrap: "bg-coral-100 text-coral-600",
    ring: "hover:border-coral-300",
  },
];

export default function ConsentModal({
  canDismiss,
  onAgree,
  onClose,
}: {
  canDismiss: boolean;
  onAgree: () => void;
  onClose: () => void;
}) {
  // Re-mounted every time it opens, so this resets naturally.
  const [checked, setChecked] = useState(canDismiss);
  const [showDetails, setShowDetails] = useState(false);
  const titleId = useId();
  const checkId = useId();

  // Lock page scroll while the agreement is open + Esc to close (only if already agreed).
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

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 bg-ink/30 backdrop-blur-md"
        onClick={() => canDismiss && onClose()}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-cream/95 shadow-lift"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
      >
        {/* Decorative glow */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-sage-200/60 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-10 size-64 rounded-full bg-honey-100/80 blur-3xl" />

        <div className="relative p-6 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid size-8 place-items-center rounded-xl bg-ink text-cream">
                <span className="font-serif text-lg italic leading-none">s</span>
              </span>
              SpillSpace
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-ink-mute ring-1 ring-ink/10">
                Informed Consent
              </span>
            </div>
            {canDismiss && (
              <button
                onClick={onClose}
                aria-label="Close agreement"
                className="grid size-9 place-items-center rounded-full text-ink-mute transition hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          <h2 id={titleId} className="mt-6 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your mind, your data.{" "}
            <span className="font-serif font-normal italic text-sage-600">Here&apos;s the deal.</span>
          </h2>
          <p className="mt-3 text-pretty text-ink-soft">
            No 40-page legal doc. Just 3 promises we actually keep before you step into your workspace. ✌️
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-3">
            {PROMISES.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className={cn(
                  "group flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-soft",
                  p.ring,
                )}
              >
                <span className={cn("grid size-10 place-items-center rounded-xl", p.iconWrap)}>
                  <p.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-snug text-ink">{p.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-mute">{p.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Optional fine print (for HR & the curious) */}
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            aria-expanded={showDetails}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            The fine print (for HR & the curious)
            <ChevronDown className={cn("size-4 transition-transform", showDetails && "rotate-180")} />
          </button>
          <motion.div
            initial={false}
            animate={{ height: showDetails ? "auto" : 0, opacity: showDetails ? 1 : 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-2 rounded-2xl bg-white/70 p-4 text-[13px] leading-relaxed text-ink-soft ring-1 ring-ink/5">
              <li>• <b>What we collect:</b> daily mood, a 1–10 workload score, optional context tags & a short note.</li>
              <li>• <b>Who sees it:</b> you (everything), partner psychologists (risk alerts & charts you choose to share), HR (anonymous aggregates of 5+ people only).</li>
              <li>• <b>Retention:</b> 12 months, then auto-deleted. Download or delete anytime.</li>
              <li>• <b>Ethics:</b> handled under the professional psychology code of ethics (HIMPSI) & data-protection law (UU PDP).</li>
              <li>• <b>Your right:</b> participation is voluntary — withdraw consent anytime in Settings → Privacy, no questions asked.</li>
            </ul>
          </motion.div>

          {/* Clickwrap checkbox */}
          <label
            htmlFor={checkId}
            className={cn(
              "mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
              checked ? "border-sage-300 bg-sage-50" : "border-ink/10 bg-white hover:border-ink/20",
            )}
          >
            <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
              <input
                id={checkId}
                type="checkbox"
                autoFocus
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="peer absolute inset-0 cursor-pointer appearance-none rounded-lg border-2 border-ink/25 bg-white transition checked:border-sage-600 checked:bg-sage-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
              />
              <Check className="pointer-events-none relative size-4 scale-50 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100" strokeWidth={3} />
            </span>
            <span className="text-sm font-medium leading-relaxed text-ink">
              I understand my mental health data is safe and shared only with partner psychologists.
            </span>
          </label>

          <motion.button
            type="button"
            disabled={!checked}
            onClick={onAgree}
            whileTap={checked ? { scale: 0.98 } : undefined}
            className={cn(
              "group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-all",
              checked
                ? "bg-ink text-cream shadow-lift hover:bg-ink/90"
                : "cursor-not-allowed bg-ink/10 text-ink/40",
            )}
          >
            Agree &amp; Enter Workspace
            <ArrowRight className={cn("size-5 transition-transform", checked && "group-hover:translate-x-1")} />
          </motion.button>

          <p className="mt-4 text-center text-xs text-ink-mute">
            🔒 You can re-open this agreement or withdraw consent anytime.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
