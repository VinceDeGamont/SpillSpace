"use client";

import { motion } from "framer-motion";
import { Building2, Check, Eye, EyeOff, Scale, Stethoscope, UserRound, X } from "lucide-react";
import { Reveal, SectionHeader, cn } from "./ui";

const DEMANDS = ["Tight deadlines", "Back-to-back meetings", "After-hours pings", "Role ambiguity"];
const RESOURCES = ["Team support", "Clear goals", "Autonomy", "Recovery time"];

const ACCESS: {
  who: string;
  icon: typeof UserRound;
  sees: string;
  daily: boolean;
  alerts: boolean;
  aggregate: boolean;
}[] = [
  { who: "You", icon: UserRound, sees: "Everything you log", daily: true, alerts: true, aggregate: true },
  { who: "Partner Psychologist", icon: Stethoscope, sees: "Risk alerts + charts you share", daily: false, alerts: true, aggregate: true },
  { who: "HR / Management", icon: Building2, sees: "Anonymous team trends (5+ people)", daily: false, alerts: false, aggregate: true },
];

export default function Science() {
  return (
    <section id="science" className="scroll-mt-28 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="The science bit (we kept it short)"
          icon={<Scale className="size-3.5" />}
          title="Built on the Job Demands–Resources"
          accent="model."
          description="Burnout isn't a personal weakness — it happens when job demands keep outweighing job resources. SpillSpace tracks both, every day, so imbalance gets caught early."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-5">
          {/* Balance visual */}
          <Reveal className="bento relative overflow-hidden p-7 md:col-span-3">
            <p className="text-sm font-semibold text-ink">The balance we monitor</p>
            <p className="mt-1 text-sm text-ink-mute">Demands drain your battery. Resources recharge it.</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-coral-50 p-4 ring-1 ring-coral-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-coral-600">Job Demands ↑</p>
                <ul className="mt-3 space-y-2">
                  {DEMANDS.map((d, i) => (
                    <motion.li
                      key={d}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl bg-white/80 px-3 py-2 text-sm text-ink"
                    >
                      {d}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-sage-50 p-4 ring-1 ring-sage-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-sage-700">Job Resources ↑</p>
                <ul className="mt-3 space-y-2">
                  {RESOURCES.map((d, i) => (
                    <motion.li
                      key={d}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl bg-white/80 px-3 py-2 text-sm text-ink"
                    >
                      {d}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">Formula</span>
              High demands + low resources = <b className="text-coral-600">strain → burnout</b>. Balanced = <b className="text-sage-700">engagement</b>.
            </div>
          </Reveal>

          {/* Stat tile */}
          <Reveal delay={0.1} className="bento flex flex-col justify-between bg-ink! p-7 text-cream md:col-span-2">
            <div>
              <p className="text-sm font-medium text-cream/70">Daily effort required</p>
              <p className="mt-3 font-serif text-7xl italic leading-none">10 sec</p>
              <p className="mt-4 text-pretty text-cream/80">
                1 tap for mood, 1 slide for workload, a few optional tags. Faster than replying &ldquo;noted 🙏&rdquo; in the group chat.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 text-center">
              {[
                ["1", "tap"],
                ["1", "slide"],
                ["0", "essays"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white/10 py-3">
                  <p className="text-2xl font-semibold">{n}</p>
                  <p className="text-xs text-cream/70">{l}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Who sees what */}
          <Reveal delay={0.05} className="bento p-7 md:col-span-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-ink">Who sees what? (Transparency matrix)</p>
                <p className="mt-1 text-sm text-ink-mute">Privacy isn&apos;t a vibe, it&apos;s a rule. Here&apos;s exactly who can access your data.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
                <EyeOff className="size-3.5" /> HR never sees individual answers
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-ink-mute">
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">What they see</th>
                    <th className="pb-3 text-center font-semibold">Daily answers</th>
                    <th className="pb-3 text-center font-semibold">Risk alerts</th>
                    <th className="pb-3 text-center font-semibold">Team trends</th>
                  </tr>
                </thead>
                <tbody>
                  {ACCESS.map((a) => (
                    <tr key={a.who} className="border-t border-ink/5">
                      <td className="py-3.5">
                        <span className="flex items-center gap-2.5 font-semibold text-ink">
                          <span className="grid size-8 place-items-center rounded-lg bg-cream-200">
                            <a.icon className="size-4" />
                          </span>
                          {a.who}
                        </span>
                      </td>
                      <td className="py-3.5 text-ink-soft">{a.sees}</td>
                      {[a.daily, a.alerts, a.aggregate].map((v, i) => (
                        <td key={i} className="py-3.5 text-center">
                          <span
                            className={cn(
                              "inline-grid size-7 place-items-center rounded-full",
                              v ? "bg-sage-100 text-sage-700" : "bg-coral-50 text-coral-500",
                            )}
                          >
                            {v ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-mute">
              <Eye className="size-3.5" /> Psychologists only receive your monthly chart when you book a session (Pre-Counseling Summary) or when a Red alert triggers.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
