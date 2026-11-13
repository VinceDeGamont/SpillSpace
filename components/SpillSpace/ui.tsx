"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Level } from "./data";

/** Full literal class strings so Tailwind can see them. */
export const LEVEL_STYLES: Record<
  Level,
  {
    name: string;
    chip: string;
    dot: string;
    bar: string;
    solid: string;
    soft: string;
    text: string;
    border: string;
    tint: string;
    hex: string;
  }
> = {
  green: {
    name: "Green",
    chip: "bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-200",
    dot: "bg-sage-500",
    bar: "bg-linear-to-t from-sage-500 to-sage-300",
    solid: "bg-sage-600 hover:bg-sage-700 text-white",
    soft: "bg-sage-50",
    text: "text-sage-700",
    border: "border-sage-200",
    tint: "from-sage-100 via-white to-sage-50",
    hex: "#6f9d66",
  },
  yellow: {
    name: "Yellow",
    chip: "bg-honey-100 text-honey-700 ring-1 ring-inset ring-honey-200",
    dot: "bg-honey-400",
    bar: "bg-linear-to-t from-honey-500 to-honey-300",
    solid: "bg-honey-500 hover:bg-honey-600 text-white",
    soft: "bg-honey-50",
    text: "text-honey-700",
    border: "border-honey-200",
    tint: "from-honey-100 via-white to-honey-50",
    hex: "#e39a1b",
  },
  red: {
    name: "Red",
    chip: "bg-coral-100 text-coral-700 ring-1 ring-inset ring-coral-200",
    dot: "bg-coral-500",
    bar: "bg-linear-to-t from-coral-600 to-coral-400",
    solid: "bg-coral-500 hover:bg-coral-600 text-white",
    soft: "bg-coral-50",
    text: "text-coral-700",
    border: "border-coral-200",
    tint: "from-coral-100 via-white to-coral-50",
    hex: "#e2614a",
  },
};

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  eyebrow,
  icon,
  title,
  accent,
  description,
  align = "center",
}: {
  eyebrow: string;
  icon?: ReactNode;
  title: string;
  accent?: string;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center mx-auto max-w-2xl" : "items-start max-w-xl",
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {icon}
        {eyebrow}
      </span>
      <h2 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {title}{" "}
        {accent && <span className="font-serif font-normal italic text-sage-600">{accent}</span>}
      </h2>
      {description && <p className="text-pretty text-lg leading-relaxed text-ink-soft">{description}</p>}
    </Reveal>
  );
}

export function StatusDot({ level, pulse = false }: { level: Level; pulse?: boolean }) {
  return (
    <span className="relative inline-flex size-2.5">
      {pulse && (
        <span
          className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", LEVEL_STYLES[level].dot)}
        />
      )}
      <span className={cn("relative inline-flex size-2.5 rounded-full", LEVEL_STYLES[level].dot)} />
    </span>
  );
}
