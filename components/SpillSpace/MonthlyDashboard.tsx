"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CalendarCheck,
  ClipboardList,
  Flame,
  Gauge,
  Presentation,
  Scale,
  Stethoscope,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { MONTHLY, VIBE_COPY, levelFromScore, type Level, type VibeResult } from "./data";
import { LEVEL_STYLES, Reveal, SectionHeader, StatusDot, cn } from "./ui";

const LEVELS: Level[] = ["green", "yellow", "red"];
const PREVIEW_LABEL: Record<Level, string> = { green: "Stable", yellow: "Moderate", red: "High risk" };

export default function MonthlyDashboard({
  level,
  onLevelChange,
  todayCheckIn,
  onCta,
}: {
  level: Level;
  onLevelChange: (l: Level) => void;
  todayCheckIn: VibeResult | null;
  onCta: (level: Level) => void;
}) {
  const r = MONTHLY[level];

  return (
    <section id="monthly-report" className="scroll-mt-28 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Monthly Psychological Report"
          icon={<ClipboardList className="size-3.5" />}
          title="Your month,"
          accent="decoded."
          description="Every daily check-in rolls up into a private monthly stress record — so you (and only you) can see patterns before they become problems."
        />

        {/* Preview switcher */}
        <Reveal className="mt-10 flex flex-col items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-mute">
            <Presentation className="size-3.5" /> Preview state
          </span>
          <div role="tablist" aria-label="Preview monthly status" className="glass flex rounded-2xl p-1.5 shadow-soft">
            {LEVELS.map((l) => {
              const active = l === level;
              return (
                <button
                  key={l}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onLevelChange(l)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5",
                    active ? "text-ink" : "text-ink-mute hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="preview-pill"
                      className="absolute inset-0 rounded-xl bg-white shadow-soft ring-1 ring-ink/5"
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <StatusDot level={l} />
                    {LEVEL_STYLES[l].name}
                    <span className="hidden font-medium text-ink-mute sm:inline">· {PREVIEW_LABEL[l]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Bento grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <TrendCard weeks={r.weeks} month={r.month} />
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-2">
            <RatioCard demand={r.taskDemand} recovery={r.recovery} level={level} />
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-4">
            <ResultCard level={level} onCta={onCta} />
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-2">
            <SnapshotCard level={level} todayCheckIn={todayCheckIn} />
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-6">
            <TriggersCard level={level} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Stress trend chart */

function TrendCard({ weeks, month }: { weeks: number[]; month: string }) {
  const delta = weeks[weeks.length - 1] - weeks[0];
  const up = delta > 0;
  // Smooth curve through bar tops (viewBox 0–100)
  const pts = weeks.map((w, i) => [12.5 + i * 25, 100 - w] as const);
  const d = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");

  return (
    <div className="bento h-full p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Activity className="size-4 text-ink-mute" /> Stress Trend Visualizer
          </p>
          <p className="mt-1 text-sm text-ink-mute">{month} · weekly stress index</p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            up ? "bg-coral-50 text-coral-600" : "bg-sage-50 text-sage-700",
          )}
        >
          {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {up ? "+" : ""}
          {delta} pts since Week 1
        </span>
      </div>

      <div className="relative mt-8 h-60">
        {/* Zone bands */}
        <div aria-hidden className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
          <div className="h-[30%] bg-coral-50/70" />
          <div className="h-[30%] bg-honey-50/80" />
          <div className="h-[40%] bg-sage-50/70" />
        </div>
        <span className="absolute top-[30%] right-2 -translate-y-1/2 rounded-md bg-white/90 px-1.5 text-[10px] font-semibold text-coral-600">
          Red ≥70
        </span>
        <span className="absolute top-[60%] right-2 -translate-y-1/2 rounded-md bg-white/90 px-1.5 text-[10px] font-semibold text-honey-700">
          Yellow ≥40
        </span>
        <div aria-hidden className="absolute inset-x-0 top-[30%] border-t border-dashed border-coral-300" />
        <div aria-hidden className="absolute inset-x-0 top-[60%] border-t border-dashed border-honey-300" />

        {/* Bars */}
        <div className="absolute inset-0 grid grid-cols-4 items-end px-4 sm:px-8">
          {weeks.map((w, i) => {
            const l = levelFromScore(w);
            return (
              <div key={i} className="relative flex h-full items-end justify-center">
                <motion.div
                  className={cn("relative w-3/5 max-w-16 rounded-t-2xl rounded-b-md", LEVEL_STYLES[l].bar)}
                  initial={{ height: 0 }}
                  animate={{ height: `${w}%` }}
                  transition={{ type: "spring", damping: 18, stiffness: 90, delay: i * 0.06 }}
                >
                  <motion.span
                    key={w}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-cream"
                  >
                    {w}
                  </motion.span>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Wave overlay */}
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full px-4 sm:px-8">
          <motion.path
            d={d}
            animate={{ d }}
            fill="none"
            stroke="#1e293b"
            strokeOpacity={0.55}
            strokeWidth={2}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            transition={{ type: "spring", damping: 20, stiffness: 90 }}
          />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-4 px-4 text-center text-xs font-medium text-ink-mute sm:px-8">
        {weeks.map((w, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            Week {i + 1}
            <span className={cn("size-1.5 rounded-full", LEVEL_STYLES[levelFromScore(w)].dot)} />
          </span>
        ))}
      </div>
    </div>
  );
}

// Work vs. personal life ratio

function RatioCard({ demand, recovery, level }: { demand: number; recovery: number; level: Level }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const healthy = demand <= 60;

  return (
    <div className="bento flex h-full flex-col p-6 sm:p-7">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Scale className="size-4 text-ink-mute" /> Work vs. Personal Life
      </p>
      <p className="mt-1 text-sm text-ink-mute">Where your energy went</p>

      <div className="relative mx-auto mt-6 size-44">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#e3ede0" strokeWidth="14" />
          <motion.circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={LEVEL_STYLES[level].hex}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - demand / 100) }}
            transition={{ type: "spring", damping: 20, stiffness: 70 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <AnimatePresence mode="wait">
              <motion.p
                key={demand}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-3xl font-semibold tabular-nums text-ink"
              >
                {demand}
                <span className="text-ink-mute">:</span>
                {recovery}
              </motion.p>
            </AnimatePresence>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-mute">work : life</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink-soft">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: LEVEL_STYLES[level].hex }} /> Task Demands
          </span>
          <span className="font-semibold tabular-nums text-ink">{demand}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink-soft">
            <span className="size-2.5 rounded-full bg-sage-200" /> Personal Recovery Time
          </span>
          <span className="font-semibold tabular-nums text-ink">{recovery}%</span>
        </div>
      </div>
      <p
        className={cn(
          "mt-auto rounded-xl px-3 py-2 pt-2 text-xs font-medium",
          healthy ? "bg-sage-50 text-sage-700" : "bg-coral-50 text-coral-700",
        )}
      >
        {healthy ? "✓ Within the healthy zone (≤ 60:40)" : "⚠ Above the healthy zone (≤ 60:40)"}
      </p>
    </div>
  );
}

// Monthly summary & recommendation

const STEPS: { key: "stable" | "adjust" | "urgent"; label: string }[] = [
  { key: "stable", label: "Stable" },
  { key: "adjust", label: "Workload adjustment" },
  { key: "urgent", label: "1-on-1 required" },
];

function ResultCard({ level, onCta }: { level: Level; onCta: (l: Level) => void }) {
  const r = MONTHLY[level];
  const s = LEVEL_STYLES[level];
  const stepIndex = STEPS.findIndex((x) => x.key === r.action);

  const cta =
    level === "green"
      ? { label: "Book an optional growth chat", cls: "bg-white text-ink ring-1 ring-ink/10 hover:bg-cream-200" }
      : level === "yellow"
        ? { label: "Talk to a psychologist", cls: "bg-honey-500 text-white hover:bg-honey-600" }
        : { label: "Book immediate 1-on-1 session", cls: "animate-pulse-ring bg-coral-500 text-white hover:bg-coral-600" };

  return (
    <div className={cn("relative h-full overflow-hidden rounded-[1.75rem] border bg-linear-to-br p-6 shadow-soft transition-colors duration-500 sm:p-7", s.border, s.tint)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={level}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex h-full flex-col"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Monthly End-Result</p>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", s.chip)}>
              {r.zoneLabel}
            </span>
          </div>

          <p className="mt-4 text-sm text-ink-soft">Current Monthly Status</p>
          <p className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", s.text)}>
            {r.statusLabel} <span className="font-serif text-2xl font-normal italic text-ink-soft sm:text-3xl">({r.zoneLabel})</span>
          </p>

          {/* Action ladder */}
          <ol className="mt-6 grid grid-cols-3 gap-2">
            {STEPS.map((st, i) => {
              const active = i === stepIndex;
              const stepLevel: Level = i === 0 ? "green" : i === 1 ? "yellow" : "red";
              return (
                <li
                  key={st.key}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-center text-xs font-semibold transition-all",
                    active ? cn(LEVEL_STYLES[stepLevel].chip, "scale-[1.03] shadow-soft") : "bg-white/60 text-ink-mute",
                  )}
                >
                  <span className="block text-[10px] font-medium opacity-70">Step {i + 1}</span>
                  {st.label}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 rounded-2xl bg-white/85 p-5 ring-1 ring-ink/5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Stethoscope className={cn("size-4", s.text)} /> Psychological Recommendation
            </p>
            <p className={cn("mt-2 text-base font-semibold", s.text)}>{r.recommendationTitle}</p>
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-soft">{r.recommendation}</p>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-ink-mute">
              Auto-generated from {r.checkIns} check-ins · reviewed by your partner psychologist
            </p>
            <button
              onClick={() => onCta(level)}
              className={cn("flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition", cta.cls)}
            >
              <CalendarCheck className="size-4" /> {cta.label}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Monthly snapshot metrics

function SnapshotCard({ level, todayCheckIn }: { level: Level; todayCheckIn: VibeResult | null }) {
  const r = MONTHLY[level];
  return (
    <div className="bento flex h-full flex-col gap-3 p-6 sm:p-7">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Gauge className="size-4 text-ink-mute" /> Snapshot
      </p>

      <Stat label="Avg. brain capacity used" value={`${r.avgCapacity}%`} accent={LEVEL_STYLES[level].text} />
      <Stat label="Check-ins this month" value={`${r.checkIns}/${r.workdays}`} />
      <Stat label="Check-in streak" value={`${r.streak} days`} icon={<Flame className="size-4 text-honey-500" />} />

      <div className="mt-auto rounded-2xl border border-dashed border-ink/15 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Today (live)</p>
        <AnimatePresence mode="wait">
          {todayCheckIn ? (
            <motion.div key={todayCheckIn.score} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <StatusDot level={todayCheckIn.level} pulse /> {VIBE_COPY[todayCheckIn.level].title}
              </span>
              <span className={cn("text-lg font-semibold tabular-nums", LEVEL_STYLES[todayCheckIn.level].text)}>
                {todayCheckIn.score}%
              </span>
            </motion.div>
          ) : (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-ink-mute">
              Not logged yet — try the Vibe Check above ↑
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, icon }: { label: string; value: string; accent?: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-cream-200/60 px-4 py-3">
      <span className="text-sm text-ink-soft">{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className={cn("flex items-center gap-1 text-lg font-semibold tabular-nums", accent ?? "text-ink")}
        >
          {icon}
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Top context tags

function TriggersCard({ level }: { level: Level }) {
  const r = MONTHLY[level];
  const max = Math.max(...r.triggers.map((t) => t.count));
  return (
    <div className="bento p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">Top context tags this month</p>
          <p className="mt-1 text-sm text-ink-mute">What&apos;s draining vs. recharging you (JD-R breakdown)</p>
        </div>
        <div className="flex gap-3 text-xs text-ink-mute">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-coral-400" /> Demand</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sage-500" /> Resource</span>
        </div>
      </div>
      <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {r.triggers.map((t, i) => (
          <li key={`${level}-${t.tag}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">#{t.tag}</span>
              <span className="tabular-nums text-ink-mute">{t.count}×</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/6">
              <motion.div
                className={cn("h-full rounded-full", t.kind === "demand" ? "bg-coral-400" : "bg-sage-500")}
                initial={{ width: 0 }}
                animate={{ width: `${(t.count / max) * 100}%` }}
                transition={{ type: "spring", damping: 20, stiffness: 90, delay: i * 0.05 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
