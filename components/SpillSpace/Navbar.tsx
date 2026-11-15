"use client";

import { motion } from "framer-motion";
import { LogOut, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "./ui";
import type { EmployeeProfile } from "./workspaceTypes";

const LINKS = [
  { id: "attendance-hub", label: "Absensi" },
  { id: "vibe-check", label: "Vibe Check" },
  { id: "monthly-report", label: "Laporan Bulanan" },
  { id: "psychologists", label: "Psikolog" },
  { id: "hr-dashboard", label: "Agregat HR" },
  { id: "privacy-settings", label: "Hak Data" },
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
  employee,
  onOpenConsent,
  onNavigate,
  onLogout,
}: {
  hasConsented: boolean;
  employee?: EmployeeProfile | null;
  onOpenConsent: () => void;
  onNavigate: (id: string) => void;
  onLogout?: () => void;
}) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-2xl px-3 py-2.5 shadow-soft sm:px-4">
        <button onClick={() => onNavigate("top")} aria-label="Back to top">
          <Logo />
        </button>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => onNavigate(l.id)}
                className="rounded-xl px-2.5 py-2 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {employee && (
            <button
              type="button"
              onClick={() => onNavigate("attendance-hub")}
              className="hidden items-center gap-1.5 rounded-xl border border-ink/10 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-ink sm:flex"
              title={`${employee.fullName} (${employee.department})`}
            >
              <UserCheck className="size-3.5 text-sage-600" />
              <span>{employee.employeeId}</span>
              <span className="hidden text-ink-mute xl:inline">
                · {employee.fullName.split(" ")[0]}
              </span>
            </button>
          )}

          <button
            onClick={onOpenConsent}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:px-3",
              hasConsented
                ? "bg-sage-100 text-sage-700 hover:bg-sage-200"
                : "bg-honey-100 text-honey-700 hover:bg-honey-200",
            )}
            title="Baca Perjanjian Penggunaan & Kebijakan Privasi"
          >
            {hasConsented ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
            <span className="hidden sm:inline">
              {hasConsented ? "T&C Disetujui" : "T&C Psikologis Off"}
            </span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-cream transition hover:bg-ink/90"
              title="Keluar dari akun karyawan"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
