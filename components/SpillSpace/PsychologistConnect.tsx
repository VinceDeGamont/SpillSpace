"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  EyeOff,
  FileText,
  Fingerprint,
  LoaderCircle,
  MessageCircleHeart,
  Siren,
  Star,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { MONTHLY, PSYCHOLOGISTS, VIBE_COPY, levelFromScore, type Level, type Psychologist, type VibeResult } from "./data";
import { LEVEL_STYLES, Reveal, SectionHeader, StatusDot, cn } from "./ui";

type BookingState = { status: "idle" } | { status: "loading" } | { status: "booked"; anonId: string };

export default function PsychologistConnect({
  priorityRequested,
  previewLevel,
  todayCheckIn,
  onBooked,
}: {
  priorityRequested: boolean;
  previewLevel: Level;
  todayCheckIn: VibeResult | null;
  onBooked: (msg: string) => void;
}) {
  const [bookings, setBookings] = useState<Record<string, BookingState>>({});
  const timers = useRef<Record<string, number>>({});

  const book = (p: Psychologist) => {
    setBookings((b) => ({ ...b, [p.id]: { status: "loading" } }));
    window.clearTimeout(timers.current[p.id]);
    timers.current[p.id] = window.setTimeout(() => {
      const anonId = `Anon-#${Math.floor(1000 + Math.random() * 9000)}`;
      setBookings((b) => ({ ...b, [p.id]: { status: "booked", anonId } }));
      onBooked(`Booked anonymously with ${p.name.split(" ")[0]} · ${p.slot}`);
    }, 1100);
  };

  const cancel = (id: string) => setBookings((b) => ({ ...b, [id]: { status: "idle" } }));

  return (
    <section id="psychologists" className="scroll-mt-28 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Partner Psychologist Connect"
          icon={<MessageCircleHeart className="size-3.5" />}
          title="Real humans. Licensed."
          accent="Definitely not HR."
          description="External, certified psychologists contracted by your company — bound by professional confidentiality. Book in one click, stay anonymous, skip the awkward intro."
        />

        <AnimatePresence>
          {priorityRequested && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-auto mt-10 flex max-w-3xl items-start gap-4 rounded-2xl border border-coral-200 bg-coral-50 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-coral-500 text-white">
                  <Siren className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-coral-700">Priority request received 💛</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Nadia Prameswari (on-call today) got an <b>anonymous</b> Red alert and will reach out within 2
                    hours. Your manager & HR are <b>not</b> notified. You can also pick any slot below.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PSYCHOLOGISTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <PsychologistCard
                p={p}
                state={bookings[p.id] ?? { status: "idle" }}
                onBook={() => book(p)}
                onCancel={() => cancel(p.id)}
                priority={priorityRequested && i === 0}
              />
            </Reveal>
          ))}
        </div>

        {/* Pre-counseling summary explainer */}
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          <Reveal className="bento p-7 lg:col-span-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-honey-100 px-3 py-1 text-xs font-semibold text-honey-700">
              <FileText className="size-3.5" /> Pre-Counseling Summary
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              No more &ldquo;so… where do I even start?&rdquo;
            </h3>
            <p className="mt-2 text-pretty text-ink-soft">
              When you book, your psychologist automatically receives your anonymized monthly chart — so you
              don&apos;t have to explain your stress from scratch.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                { t: "You tap “1-Click Anonymous Booking”", d: "No name, no division, no manager attached." },
                { t: "Your monthly chart is shared securely", d: "Stress trend, work-life ratio & top tags — nothing else." },
                { t: "Session starts from context", d: "50 minutes of real help, not 20 minutes of backstory." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{s.t}</p>
                    <p className="text-sm text-ink-mute">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-3">
            <SummaryMockup level={previewLevel} todayCheckIn={todayCheckIn} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PsychologistCard({
  p,
  state,
  onBook,
  onCancel,
  priority,
}: {
  p: Psychologist;
  state: BookingState;
  onBook: () => void;
  onCancel: () => void;
  priority: boolean;
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={cn("bento relative flex h-full flex-col p-6", priority && "ring-2 ring-coral-300")}
    >
      {priority && (
        <span className="absolute -top-3 left-6 rounded-full bg-coral-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          On-call for you
        </span>
      )}
      <div className="flex items-start justify-between">
        <div className={cn("grid size-16 place-items-center rounded-2xl bg-linear-to-br text-xl font-semibold text-white shadow-soft", p.gradient)}>
          {p.initials}
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            LEVEL_STYLES[p.availability.tone].chip,
          )}
        >
          <StatusDot level={p.availability.tone} pulse={p.availability.tone === "green"} />
          {p.availability.label}
        </span>
      </div>

      <h3 className="mt-5 flex items-center gap-1.5 text-lg font-semibold text-ink">
        {p.name}
        <BadgeCheck className="size-4.5 text-sage-600" aria-label="Verified license" />
      </h3>
      <p className="text-sm text-ink-mute">{p.credentials} · SIPP verified</p>

      <span className="mt-4 self-start rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-ink">
        {p.specialization}
      </span>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">{p.bio}</p>

      <div className="mt-5 flex items-center gap-4 text-xs text-ink-mute">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-honey-400 text-honey-400" /> <b className="text-ink">{p.rating}</b>
        </span>
        <span>{p.years} yrs exp.</span>
        <span>{p.languages.join(" / ")}</span>
      </div>

      <div className="mt-auto pt-6">
        <AnimatePresence mode="wait" initial={false}>
          {state.status === "booked" ? (
            <motion.div
              key="booked"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-sage-50 p-4 ring-1 ring-sage-200"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold text-sage-700">
                  <Check className="size-4" strokeWidth={3} /> You&apos;re booked!
                </p>
                <button onClick={onCancel} aria-label="Cancel booking" className="rounded-full p-1 text-ink-mute hover:bg-white hover:text-ink">
                  <X className="size-4" />
                </button>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                <li className="flex items-center gap-1.5"><Fingerprint className="size-3.5" /> Booked as <b>{state.anonId}</b></li>
                <li className="flex items-center gap-1.5"><CalendarCheck className="size-3.5" /> {p.slot}</li>
                <li className="flex items-center gap-1.5"><Video className="size-3.5" /> Video call · camera optional</li>
              </ul>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onBook}
              disabled={state.status === "loading"}
              whileTap={{ scale: 0.97 }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-ink/90 disabled:opacity-80"
            >
              {state.status === "loading" ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" /> Securing anonymous slot…
                </>
              ) : (
                <>
                  <Fingerprint className="size-4" /> 1-Click Anonymous Booking
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function SummaryMockup({ level, todayCheckIn }: { level: Level; todayCheckIn: VibeResult | null }) {
  const r = MONTHLY[level];
  const s = LEVEL_STYLES[level];

  return (
    <div className="relative h-full rounded-[1.75rem] bg-ink p-3 shadow-lift">
      <div className="flex items-center gap-1.5 px-3 pt-1 pb-3">
        <span className="size-2.5 rounded-full bg-coral-400" />
        <span className="size-2.5 rounded-full bg-honey-400" />
        <span className="size-2.5 rounded-full bg-sage-400" />
        <span className="ml-3 text-xs font-medium text-cream/60">Psychologist portal · what they receive</span>
      </div>

      <div className="h-[calc(100%-2.25rem)] rounded-[1.25rem] bg-cream p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Pre-Counseling Summary</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-ink">
              <Fingerprint className="size-5 text-ink-mute" /> Client Anon-#4821
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={level}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn("rounded-full px-3 py-1 text-xs font-bold", s.chip)}
            >
              {r.statusLabel}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {/* Mini chart */}
          <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5 sm:col-span-2">
            <p className="text-xs font-medium text-ink-mute">4-week stress trend</p>
            <div className="mt-3 flex h-20 items-end gap-3">
              {r.weeks.map((w, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    className={cn("w-full rounded-lg", LEVEL_STYLES[levelFromScore(w)].bar)}
                    animate={{ height: `${(w / 100) * 64}px` }}
                    transition={{ type: "spring", damping: 18, stiffness: 100, delay: i * 0.04 }}
                  />
                  <span className="text-[10px] text-ink-mute">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-white p-4 ring-1 ring-ink/5">
            <p className="text-xs font-medium text-ink-mute">Work : life</p>
            <p className={cn("text-2xl font-semibold tabular-nums", s.text)}>
              {r.taskDemand}:{r.recovery}
            </p>
            <p className="text-xs font-medium text-ink-mute">Avg. capacity</p>
            <p className="text-lg font-semibold tabular-nums text-ink">{r.avgCapacity}%</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
            <p className="text-xs font-medium text-ink-mute">Top context tags</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.triggers.slice(0, 3).map((t) => (
                <span
                  key={t.tag}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    t.kind === "demand" ? "bg-coral-50 text-coral-700" : "bg-sage-50 text-sage-700",
                  )}
                >
                  #{t.tag} · {t.count}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
            <p className="text-xs font-medium text-ink-mute">Latest check-in</p>
            {todayCheckIn ? (
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <StatusDot level={todayCheckIn.level} /> {VIBE_COPY[todayCheckIn.level].title} · {todayCheckIn.score}%
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-mute">— none logged today</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-ink/5 px-3 py-2.5 text-xs text-ink-soft">
          <EyeOff className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <b>Never shared:</b> real name, employee ID, division, manager, or your written reflections.
          </span>
        </div>
      </div>
    </div>
  );
}
