"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "./ui";

const LINKS = [
  { id: "science", label: "The Science" },
  { id: "vibe-check", label: "Vibe Check" },
  { id: "monthly-report", label: "Monthly Report" },
  { id: "psychologists", label: "Psychologists" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight text-ink", className)}>
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-xl bg-ink text-cream">
        <span className="absolute -right-2 -bottom-2 size-5 rounded-full bg-sage-400/70 blur-[6px]" />
        <span className="relative font-serif text-lg italic leading-none">s</span>
      </span>
      SpillSpace
    </span>
  );
}

export default function Navbar({
  hasConsented,
  onOpenConsent,
  onNavigate,
}: {
  hasConsented: boolean;
  onOpenConsent: () => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-3 py-2.5 shadow-soft sm:px-4">
        <button onClick={() => onNavigate("top")} aria-label="Back to top">
          <Logo />
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => onNavigate(l.id)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConsent}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:px-3",
              hasConsented
                ? "bg-sage-100 text-sage-700 hover:bg-sage-200"
                : "bg-honey-100 text-honey-700 hover:bg-honey-200",
            )}
            title="View privacy agreement"
          >
            {hasConsented ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
            <span className="hidden sm:inline">{hasConsented ? "Consent active" : "Consent pending"}</span>
          </button>
          <button
            onClick={() => onNavigate("vibe-check")}
            className="rounded-xl bg-ink px-3.5 py-2 text-sm font-semibold text-cream transition hover:bg-ink/90"
          >
            Check in
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
