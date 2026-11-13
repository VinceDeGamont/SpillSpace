"use client";

import { motion } from "framer-motion";
import { ArrowDown, Brain, EyeOff, FlaskConical, Lock, ShieldCheck, Timer, TrendingDown } from "lucide-react";
import { MOODS } from "./data";
import { cn } from "./ui";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero({
  onTryVibeCheck,
  onOpenConsent,
}: {
  onTryVibeCheck: () => void;
  onOpenConsent: () => void;
}) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 sm:pt-40 lg:pb-28">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-16 -left-24 size-[28rem] rounded-full bg-sage-200/50 blur-3xl" />
        <div className="absolute top-40 right-[-6rem] size-[26rem] rounded-full bg-honey-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-coral-100/50 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* Copy */}
        <motion.div initial="hidden" animate="show" className="flex flex-col items-start">
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/80 py-1.5 pr-3.5 pl-1.5 text-xs font-semibold text-sage-700 shadow-soft sm:text-sm"
          >
            <span className="grid size-6 place-items-center rounded-full bg-sage-100">
              <FlaskConical className="size-3.5" />
            </span>
            Backed by Industrial &amp; Organizational Psychology (JD-R Model)
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-6 text-balance text-5xl leading-[1.02] font-semibold tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]"
          >
            Work hard, without losing your mind.{" "}
            <span className="font-serif font-normal italic text-sage-600">
              Your daily 10-second mental check-in.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
            Your company partners with <b className="font-semibold text-ink">certified, licensed psychologists</b> to
            keep your work-life balance in check. Tap your vibe, slide your workload, done. Everything you share stays{" "}
            <b className="font-semibold text-ink">100% anonymous from management</b> — no names, no performance
            reviews, just real support when your brain capacity runs low.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={onTryVibeCheck}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-base font-semibold text-cream shadow-lift transition hover:-translate-y-0.5 hover:bg-ink/90"
            >
              Try Daily Vibe Check
              <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" />
            </button>
            <button
              onClick={onOpenConsent}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white/80 px-6 py-4 text-base font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white"
            >
              <ShieldCheck className="size-5 text-sage-600" />
              Re-open Privacy Agreement
            </button>
          </motion.div>

          <motion.ul variants={fadeUp} custom={4} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
            {[
              { icon: Lock, text: "End-to-end encrypted" },
              { icon: Brain, text: "Licensed psychologists" },
              { icon: Timer, text: "10 seconds a day" },
            ].map((t) => (
              <li key={t.text} className="flex items-center gap-2">
                <t.icon className="size-4 text-sage-600" />
                {t.text}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Product mockup */}
        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      {/* Main card */}
      <div className="glass relative rounded-[2rem] p-6 shadow-lift sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-mute">Thursday · 09:12</p>
            <p className="mt-0.5 text-lg font-semibold text-ink">Morning vibe check ☀️</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink-soft">
            <Timer className="size-3.5" /> 0:07
          </span>
        </div>

        <p className="mt-6 text-sm font-medium text-ink-soft">How&apos;s your brain battery?</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {MOODS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              className={cn(
                "grid aspect-square place-items-center rounded-2xl text-2xl transition",
                i === 1 ? "bg-sage-100 ring-2 ring-sage-400" : "bg-white/70 ring-1 ring-ink/5",
              )}
            >
              {m.emoji}
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink-soft">Task load vs. personal time</span>
            <span className="font-semibold text-ink">4/10</span>
          </div>
          <div className="mt-2.5 h-2.5 rounded-full bg-ink/8">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-sage-300 to-sage-500"
              initial={{ width: 0 }}
              animate={{ width: "36%" }}
              transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["#ClearGoals", "#GreatTeamSupport"].map((t) => (
            <span key={t} className="rounded-full bg-sage-50 px-3 py-1 text-xs font-medium text-sage-700 ring-1 ring-sage-200">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-sage-50 p-4 ring-1 ring-sage-200">
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage-400 opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-sage-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-sage-700">Balanced · Green Zone</p>
              <p className="text-xs text-sage-700/80">Keep pacing yourself 🌿</p>
            </div>
          </div>
          <span className="text-2xl font-semibold text-sage-700">28%</span>
        </div>
      </div>

      {/* Floating: HR view */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -top-6 -right-3 hidden items-center gap-3 rounded-2xl px-4 py-3 shadow-lift sm:flex lg:-right-8"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-ink text-cream">
          <EyeOff className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink">HR sees: team avg only</p>
          <p className="text-[11px] text-ink-mute">Your answers stay yours 👀</p>
        </div>
      </motion.div>

      {/* Floating: trend */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass absolute -bottom-8 -left-4 hidden rounded-2xl px-4 py-3 shadow-lift sm:block lg:-left-10"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
          <TrendingDown className="size-4 text-sage-600" /> Stress ↓ 12% this week
        </div>
        <div className="mt-2.5 flex h-10 items-end gap-1.5">
          {[60, 72, 48, 40, 34].map((h, i) => (
            <motion.span
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 1 + i * 0.08, duration: 0.6 }}
              className={cn("w-4 rounded-md", h >= 70 ? "bg-coral-400" : h >= 45 ? "bg-honey-300" : "bg-sage-400")}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
