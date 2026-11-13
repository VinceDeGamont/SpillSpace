"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryFull,
  BatteryMedium,
  BatteryWarning,
  CalendarCheck,
  Check,
  Lock,
  RotateCcw,
  Send,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  DEMO_PRESETS,
  LOAD_LABELS,
  MOODS,
  TAGS,
  VIBE_COPY,
  computeVibe,
  type Level,
  type MoodId,
  type VibeResult,
} from "./data";
import { LEVEL_STYLES, Reveal, SectionHeader, StatusDot, cn } from "./ui";

const MOOD_SELECTED: Record<Level, string> = {
  green: "bg-sage-100 text-sage-700 ring-2 ring-sage-400 shadow-soft",
  yellow: "bg-honey-100 text-honey-700 ring-2 ring-honey-400 shadow-soft",
  red: "bg-coral-100 text-coral-700 ring-2 ring-coral-400 shadow-soft",
};

const STATUS_ICON = { green: BatteryFull, yellow: BatteryMedium, red: BatteryWarning } as const;

export default function VibeCheck({
  onSubmit,
  onPriorityBook,
  priorityRequested,
}: {
  onSubmit: (result: VibeResult) => void;
  onPriorityBook: () => void;
  priorityRequested: boolean;
}) {
  const [mood, setMood] = useState<MoodId>("okay");
  const [load, setLoad] = useState(4);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => computeVibe(mood, load, tags), [mood, load, tags]);
  const sliderId = useId();
  const noteId = useId();

  // Any edit after submitting re-opens the form for another log.
  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setSubmitted(false);
  };
  const changeMood = edit(setMood);
  const changeLoad = edit(setLoad);
  const toggleTag = (id: string) => {
    setTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
    setSubmitted(false);
  };

  const applyPreset = (p: (typeof DEMO_PRESETS)[number]) => {
    setMood(p.mood);
    setLoad(p.load);
    setTags(p.tags);
    setNote(p.note);
    setSubmitted(false);
  };

  const reset = () => {
    setMood("okay");
    setLoad(4);
    setTags([]);
    setNote("");
    setSubmitted(false);
  };

  const submit = () => {
    setSubmitted(true);
    onSubmit(result);
  };

  const loadPct = ((load - 1) / 9) * 100;
  const loadColor = load >= 8 ? "#e2614a" : load >= 6 ? "#e39a1b" : "#6f9d66";

  return (
    <section id="vibe-check" className="scroll-mt-28 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Interactive demo"
          icon={<Zap className="size-3.5" />}
          title="The 10-Second"
          accent="Daily Vibe Check."
          description="Go on, try it. Your status updates live as you tap. (Demo mode — nothing leaves your browser.)"
        />

        {/* Presenter shortcuts */}
        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-ink-mute">Quick demo:</span>
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-full border border-ink/10 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-soft"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-mute transition hover:text-ink"
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </Reveal>

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* Check-in form */}
          <Reveal className="bento p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-mute">Today&apos;s check-in</p>
                <p className="text-lg font-semibold text-ink">Hey, how are you really? 💬</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink-soft">
                <Timer className="size-3.5" /> ~10 sec
              </span>
            </div>

            {/* 1. Mood */}
            <fieldset className="mt-8">
              <legend className="flex items-center gap-2 text-sm font-semibold text-ink">
                <StepNum n={1} /> Mood &amp; energy — how&apos;s your brain battery?
              </legend>
              <div role="radiogroup" className="mt-4 flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const active = mood === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => changeMood(m.id)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                        active ? MOOD_SELECTED[m.tone] : "bg-cream-200/70 text-ink-soft hover:bg-cream-300/70 hover:text-ink",
                      )}
                    >
                      <span className={cn("text-lg transition-transform", active && "scale-125")}>{m.emoji}</span>
                      {m.label}
                    </motion.button>
                  );
                })}
              </div>
            </fieldset>

            {/* 2. Slider */}
            <div className="mt-9">
              <div className="flex items-end justify-between gap-4">
                <label htmlFor={sliderId} className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <StepNum n={2} /> Task Load vs. Personal Time Today
                </label>
                <span className="shrink-0 text-2xl font-semibold tabular-nums text-ink">
                  {load}
                  <span className="text-sm font-medium text-ink-mute">/10</span>
                </span>
              </div>
              <input
                id={sliderId}
                type="range"
                min={1}
                max={10}
                step={1}
                value={load}
                onChange={(e) => changeLoad(Number(e.target.value))}
                aria-valuetext={`${load} of 10 — ${LOAD_LABELS[load]}`}
                className="vibe-range mt-4"
                style={{
                  background: `linear-gradient(to right, ${loadColor} 0%, ${loadColor} ${loadPct}%, rgb(30 41 59 / 0.08) ${loadPct}%)`,
                }}
              />
              <div className="mt-2 flex justify-between text-xs text-ink-mute">
                <span>🌿 Light load, lots of me-time</span>
                <span>🔥 All work, zero me-time</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={load}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="mt-3 text-sm font-medium text-ink-soft"
                >
                  “{LOAD_LABELS[load]}”
                </motion.p>
              </AnimatePresence>
            </div>

            {/* 3. Tags */}
            <fieldset className="mt-9">
              <legend className="flex items-center gap-2 text-sm font-semibold text-ink">
                <StepNum n={3} /> Quick context <span className="font-normal text-ink-mute">(pick any)</span>
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {TAGS.map((t) => {
                  const active = tags.includes(t.id);
                  const demand = t.kind === "demand";
                  return (
                    <motion.button
                      key={t.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTag(t.id)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                        active
                          ? demand
                            ? "border-coral-300 bg-coral-50 text-coral-700"
                            : "border-sage-300 bg-sage-50 text-sage-700"
                          : "border-ink/10 bg-white text-ink-soft hover:border-ink/25 hover:text-ink",
                      )}
                    >
                      {active ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        <span className={cn("size-1.5 rounded-full", demand ? "bg-coral-400" : "bg-sage-500")} />
                      )}
                      #{t.id}
                    </motion.button>
                  );
                })}
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-mute">
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-coral-400" /> Job demand (drains)</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-sage-500" /> Job resource (recharges)</span>
              </p>
            </fieldset>

            {/* 4. Reflection */}
            <div className="mt-9">
              <label htmlFor={noteId} className="flex items-center gap-2 text-sm font-semibold text-ink">
                <StepNum n={4} /> Short reflection <span className="font-normal text-ink-mute">(optional)</span>
              </label>
              <div className="relative mt-4">
                <input
                  id={noteId}
                  type="text"
                  maxLength={120}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="Spill one thing on your mind today (optional)..."
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 pr-16 text-sm text-ink outline-none transition placeholder:text-ink-mute/70 focus:border-sage-400 focus:ring-4 focus:ring-sage-100"
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs tabular-nums text-ink-mute">
                  {note.length}/120
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-9 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-ink/5 pt-6 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-xs text-ink-mute">
                <Lock className="size-3.5 text-sage-600" /> Encrypted · HR can&apos;t see this
              </p>
              <motion.button
                type="button"
                onClick={submit}
                disabled={submitted}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all",
                  submitted ? "bg-sage-100 text-sage-700" : "bg-ink text-cream shadow-lift hover:bg-ink/90",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {submitted ? (
                    <motion.span key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                      <Check className="size-4" strokeWidth={3} /> Logged anonymously
                    </motion.span>
                  ) : (
                    <motion.span key="send" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                      Log my vibe <Send className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </Reveal>

          {/* Live status card */}
          <div className="lg:sticky lg:top-28">
            <StatusCard
              result={result}
              submitted={submitted}
              priorityRequested={priorityRequested}
              onPriorityBook={onPriorityBook}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepNum({ n }: { n: number }) {
  return (
    <span className="grid size-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-cream">{n}</span>
  );
}

function StatusCard({
  result,
  submitted,
  priorityRequested,
  onPriorityBook,
}: {
  result: VibeResult;
  submitted: boolean;
  priorityRequested: boolean;
  onPriorityBook: () => void;
}) {
  const { level, score, parts } = result;
  const s = LEVEL_STYLES[level];
  const copy = VIBE_COPY[level];
  const Icon = STATUS_ICON[level];

  return (
    <motion.div
      layout
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border bg-linear-to-br p-6 shadow-lift transition-colors duration-500 sm:p-7",
        s.border,
        s.tint,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          <StatusDot level={level} pulse /> Live status
        </span>
        {/* Traffic-light legend */}
        <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 ring-1 ring-ink/5">
          {(["green", "yellow", "red"] as Level[]).map((l) => (
            <span
              key={l}
              className={cn(
                "size-3 rounded-full transition-all duration-300",
                LEVEL_STYLES[l].dot,
                l === level ? "scale-125 opacity-100" : "opacity-25",
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={level}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="mt-6 flex items-center gap-4">
            <span className={cn("grid size-14 place-items-center rounded-2xl bg-white shadow-soft", s.text)}>
              <Icon className="size-7" />
            </span>
            <div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider", s.chip)}>
                {s.name} · {copy.zone}
              </span>
              <p className="mt-1.5 text-xl font-semibold leading-tight text-ink">{copy.title}</p>
            </div>
          </div>
          <p className="mt-5 text-pretty text-[15px] leading-relaxed text-ink">{copy.message}</p>
        </motion.div>
      </AnimatePresence>

      {/* Brain capacity meter */}
      <div className="mt-6 rounded-2xl bg-white/80 p-4 ring-1 ring-ink/5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-ink">Brain Capacity Used</span>
          <motion.span key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={cn("text-2xl font-semibold tabular-nums", s.text)}>
            {score}%
          </motion.span>
        </div>
        <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-ink/8">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: s.hex }}
            animate={{ width: `${Math.max(4, score)}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
          />
          {/* thresholds */}
          <span className="absolute inset-y-0 left-[40%] w-px bg-white" />
          <span className="absolute inset-y-0 left-[70%] w-px bg-white" />
        </div>
        <div className="relative mt-1.5 h-3.5 text-[10px] font-medium uppercase tracking-wider text-ink-mute">
          <span className="absolute left-0">Chill</span>
          <span className="absolute left-[40%] -translate-x-1/2">40</span>
          <span className="absolute left-[70%] -translate-x-1/2">70</span>
          <span className="absolute right-0">Max</span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["Mood", parts.mood],
            ["Load", parts.load],
            ["Context", parts.context],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-cream-200/60 py-2">
              <dt className="text-[11px] text-ink-mute">{k}</dt>
              <dd className="text-sm font-semibold tabular-nums text-ink">
                {Number(v) > 0 ? "+" : ""}
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tips */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={level}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-5 space-y-2"
        >
          {copy.tips.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-ink-soft">
              <Sparkles className={cn("mt-0.5 size-4 shrink-0", s.text)} /> {t}
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {/* RED → Priority booking */}
      <AnimatePresence>
        {level === "red" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-5">
              {priorityRequested ? (
                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-coral-200">
                  <span className="grid size-9 place-items-center rounded-full bg-sage-100 text-sage-700">
                    <Check className="size-5" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Priority session requested</p>
                    <p className="text-xs text-ink-mute">A partner psychologist will reach out within 2 hours.</p>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={onPriorityBook}
                    className="animate-pulse-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-coral-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-coral-600"
                  >
                    <CalendarCheck className="size-5" /> Book Priority Session
                  </button>
                  <p className="mt-2.5 text-center text-xs text-ink-mute">
                    Anonymous · Your manager won&apos;t be notified
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {submitted && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-center gap-2 border-t border-ink/5 pt-4 text-xs font-medium text-ink-soft"
          >
            <Check className="size-3.5 text-sage-600" strokeWidth={3} /> Added to your monthly report below ↓
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
