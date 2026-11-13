"use client";

import { ArrowUp, HeartHandshake, PhoneCall } from "lucide-react";
import { Logo } from "./Navbar";
import { Reveal } from "./ui";

export default function Footer({ onTryVibeCheck }: { onTryVibeCheck: () => void }) {
  return (
    <footer className="px-4 pt-10 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center text-cream sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -top-20 left-1/4 size-72 rounded-full bg-sage-500/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 right-1/4 size-72 rounded-full bg-coral-500/20 blur-3xl" />
          <div className="relative">
            <HeartHandshake className="mx-auto size-9 text-sage-300" />
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Your brain capacity matters.{" "}
              <span className="font-serif font-normal italic text-sage-300">Check in today.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-cream/70">
              10 seconds now can save you weeks of burnout later. Anonymous, encrypted, and backed by real psychologists.
            </p>
            <button
              onClick={onTryVibeCheck}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cream px-6 py-4 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ArrowUp className="size-5" /> Start my Vibe Check
            </button>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-8 text-sm text-ink-mute md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 leading-relaxed">
              A concept prototype for the Industrial &amp; Organizational Psychology (Psikologi Kerja) final project.
              All data shown is simulated for demonstration.
            </p>
          </div>
          <div className="max-w-sm rounded-2xl bg-coral-50 p-4 text-coral-700 ring-1 ring-coral-100">
            <p className="flex items-center gap-2 font-semibold">
              <PhoneCall className="size-4" /> In a crisis right now?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              SpillSpace isn&apos;t an emergency service. Please contact local emergency services or, in Indonesia, call
              the SEJIWA mental-health line at <b>119 ext. 8</b>.
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink-mute">© 2026 SpillSpace · Built with empathy (and a lot of coffee).</p>
      </div>
    </footer>
  );
}
