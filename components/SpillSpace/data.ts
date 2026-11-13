// Data & scoring logic for SpillSpace

export type Level = "green" | "yellow" | "red";

// Daily Vibe Check

export type MoodId = "charged" | "okay" | "drained" | "overwhelmed" | "burnout";

export const MOODS: {
  id: MoodId;
  emoji: string;
  label: string;
  weight: number; // 0 (best) → 4 (worst)
  tone: Level;
}[] = [
  { id: "charged", emoji: "⚡", label: "Fully Charged", weight: 0, tone: "green" },
  { id: "okay", emoji: "🙂", label: "Doing Okay", weight: 1, tone: "green" },
  { id: "drained", emoji: "\u{1F62E}\u200D\u{1F4A8}", label: "A Bit Drained", weight: 2, tone: "yellow" },
  { id: "overwhelmed", emoji: "🤯", label: "Overwhelmed", weight: 3, tone: "red" },
  { id: "burnout", emoji: "🥀", label: "Burnout", weight: 4, tone: "red" },
];

/** JD-R: every context tag is either a Job Demand (adds strain) or a Job Resource (buffers it). */
export type TagKind = "demand" | "resource";

export const TAGS: { id: string; kind: TagKind }[] = [
  { id: "TooManyMeetings", kind: "demand" },
  { id: "TightDeadline", kind: "demand" },
  { id: "GreatTeamSupport", kind: "resource" },
  { id: "NeedSleep", kind: "demand" },
  { id: "PersonalLifeIssue", kind: "demand" },
  { id: "ClearGoals", kind: "resource" },
];

export const LOAD_LABELS: Record<number, string> = {
  1: "Super light day, tons of me-time",
  2: "Light load, lots of personal time",
  3: "Chill pace, evenings are free",
  4: "Steady — work stays at work",
  5: "Even split between work & life",
  6: "Work is leaning in a bit",
  7: "Mostly work, a little me-time",
  8: "Work is eating my evenings",
  9: "Barely any personal time left",
  10: "All work, zero me-time",
};

export type VibeResult = {
  score: number; // "Brain Capacity Used", 0–100
  level: Level;
  parts: { mood: number; load: number; context: number };
};

/**
 * Brain Capacity Used (0–100)
 *  - Mood & energy        → up to 50 pts
 *  - Task load vs. me-time → up to 40 pts
 *  - Context tags (JD-R)   → ±10 pts (demands add, resources buffer)
 * Safety rules: "Burnout" is always Red; "Overwhelmed" is never Green.
 */
export function computeVibe(moodId: MoodId, load: number, tags: string[]): VibeResult {
  const mood = MOODS.find((m) => m.id === moodId) ?? MOODS[1];
  const demands = tags.filter((t) => TAGS.find((x) => x.id === t)?.kind === "demand").length;
  const resources = tags.filter((t) => TAGS.find((x) => x.id === t)?.kind === "resource").length;

  const moodPts = (mood.weight / 4) * 50;
  const loadPts = ((load - 1) / 9) * 40;
  const contextPts = Math.max(-10, Math.min(10, (demands - resources) * 4));
  const score = Math.round(Math.max(0, Math.min(100, moodPts + loadPts + contextPts)));

  let level: Level = levelFromScore(score);
  if (mood.id === "burnout") level = "red";
  if (mood.id === "overwhelmed" && level === "green") level = "yellow";

  return {
    score,
    level,
    parts: { mood: Math.round(moodPts), load: Math.round(loadPts), context: Math.round(contextPts) },
  };
}

export function levelFromScore(score: number): Level {
  if (score >= 70) return "red";
  if (score >= 40) return "yellow";
  return "green";
}

export const VIBE_COPY: Record<
  Level,
  { title: string; zone: string; message: string; tips: string[] }
> = {
  green: {
    title: "Balanced",
    zone: "Green Zone",
    message: "Your work-life rhythm looks solid! Keep pacing yourself.",
    tips: ["Protect that lunch break — no laptop allowed 🥗", "Log off on time. You earned it."],
  },
  yellow: {
    title: "Overwhelmed",
    zone: "Yellow Zone",
    message:
      "Warning: Your personal battery is draining. Consider blocking focus time or taking a breather.",
    tips: [
      "Block 90 min of no-meeting focus time",
      "Take a 5-min walk away from all screens",
      "Ask “can this be async?” on one meeting",
    ],
  },
  red: {
    title: "High Stress · Burnout Alert",
    zone: "Red Zone",
    message:
      "Critical Load Detected. You don't have to carry this alone—our partner psychologist is ready to chat.",
    tips: [
      "Only a partner psychologist gets an anonymous alert — never HR",
      "Priority slots open within the next 24 hours",
    ],
  },
};

export const DEMO_PRESETS: {
  label: string;
  mood: MoodId;
  load: number;
  tags: string[];
  note: string;
}[] = [
  { label: "😌 Chill day", mood: "charged", load: 3, tags: ["ClearGoals", "GreatTeamSupport"], note: "Shipped my task before lunch!" },
  { label: "😬 Crunch week", mood: "drained", load: 7, tags: ["TightDeadline", "TooManyMeetings"], note: "4 meetings back to back today" },
  { label: "🚨 Breaking point", mood: "burnout", load: 10, tags: ["TightDeadline", "NeedSleep", "PersonalLifeIssue"], note: "I haven't slept properly in a week" },
];

// Monthly Psychological Report

export type MonthlyReport = {
  month: string;
  weeks: number[]; // stress index per week, 0–100
  taskDemand: number; // % of waking energy
  recovery: number;
  statusLabel: string;
  zoneLabel: string;
  avgCapacity: number;
  checkIns: number;
  workdays: number;
  streak: number;
  action: "stable" | "adjust" | "urgent";
  recommendationTitle: string;
  recommendation: string;
  triggers: { tag: string; count: number; kind: TagKind }[];
};

export const MONTHLY: Record<Level, MonthlyReport> = {
  green: {
    month: "October 2026",
    weeks: [28, 34, 31, 24],
    taskDemand: 54,
    recovery: 46,
    statusLabel: "Stable & Balanced",
    zoneLabel: "Green Zone",
    avgCapacity: 29,
    checkIns: 21,
    workdays: 22,
    streak: 14,
    action: "stable",
    recommendationTitle: "Stable — no intervention needed",
    recommendation:
      "Your job demands and job resources are in a healthy balance. Keep the boundaries you've built (they're clearly working). An optional growth chat with a partner psychologist is always open if you want one.",
    triggers: [
      { tag: "ClearGoals", count: 14, kind: "resource" },
      { tag: "GreatTeamSupport", count: 11, kind: "resource" },
      { tag: "TooManyMeetings", count: 4, kind: "demand" },
      { tag: "NeedSleep", count: 2, kind: "demand" },
    ],
  },
  yellow: {
    month: "October 2026",
    weeks: [36, 49, 61, 56],
    taskDemand: 68,
    recovery: 32,
    statusLabel: "Moderate Stress",
    zoneLabel: "Yellow Zone",
    avgCapacity: 51,
    checkIns: 19,
    workdays: 22,
    streak: 6,
    action: "adjust",
    recommendationTitle: "Needs workload adjustment",
    recommendation:
      "Demands are outpacing your recovery time for 3 weeks straight. We'll send an anonymous, team-level nudge to rebalance deadlines and meeting load. A 1-on-1 with a partner psychologist is recommended (but optional).",
    triggers: [
      { tag: "TightDeadline", count: 12, kind: "demand" },
      { tag: "TooManyMeetings", count: 10, kind: "demand" },
      { tag: "GreatTeamSupport", count: 7, kind: "resource" },
      { tag: "NeedSleep", count: 6, kind: "demand" },
    ],
  },
  red: {
    month: "October 2026",
    weeks: [52, 64, 78, 87],
    taskDemand: 82,
    recovery: 18,
    statusLabel: "Moderate-to-High Stress",
    zoneLabel: "Yellow-Red Zone",
    avgCapacity: 74,
    checkIns: 17,
    workdays: 22,
    streak: 2,
    action: "urgent",
    recommendationTitle: "Requires an immediate 1-on-1 session",
    recommendation:
      "Your stress has climbed every single week and recovery time is critically low. This pattern is an early burnout signal. Our partner psychologist has been alerted anonymously and is holding a priority slot for you — please book an immediate 1-on-1 session.",
    triggers: [
      { tag: "TightDeadline", count: 15, kind: "demand" },
      { tag: "NeedSleep", count: 13, kind: "demand" },
      { tag: "PersonalLifeIssue", count: 8, kind: "demand" },
      { tag: "GreatTeamSupport", count: 3, kind: "resource" },
    ],
  },
};

// Partner Psychologists

export type Psychologist = {
  id: string;
  name: string;
  initials: string;
  credentials: string;
  specialization: string;
  bio: string;
  years: number;
  rating: number;
  languages: string[];
  availability: { label: string; tone: Level };
  slot: string;
  gradient: string;
};

export const PSYCHOLOGISTS: Psychologist[] = [
  {
    id: "nadia",
    name: "Nadia Prameswari",
    initials: "NP",
    credentials: "M.Psi., Psikolog",
    specialization: "Gen-Z Career Anxiety",
    bio: "Helps early-career folks untangle imposter syndrome, career FOMO and “am I behind?” spirals.",
    years: 7,
    rating: 4.9,
    languages: ["ID", "EN"],
    availability: { label: "Available today", tone: "green" },
    slot: "Today · 16:00",
    gradient: "from-sage-300 to-sage-500",
  },
  {
    id: "raka",
    name: "Raka Aditya",
    initials: "RA",
    credentials: "M.Psi., Psikolog",
    specialization: "Burnout Recovery",
    bio: "Specialist in workplace burnout & emotional exhaustion. Calm, practical, zero judgment.",
    years: 9,
    rating: 4.8,
    languages: ["ID", "EN"],
    availability: { label: "Next slot: Tomorrow", tone: "yellow" },
    slot: "Tomorrow · 10:00",
    gradient: "from-honey-300 to-coral-400",
  },
  {
    id: "clarissa",
    name: "Clarissa Wijaya",
    initials: "CW",
    credentials: "M.Psi., Psikolog",
    specialization: "Work-Life Boundaries",
    bio: "Teaches you to say “no” without guilt and actually switch off after work hours.",
    years: 6,
    rating: 4.9,
    languages: ["ID", "EN"],
    availability: { label: "Available today", tone: "green" },
    slot: "Today · 19:30",
    gradient: "from-coral-200 to-honey-400",
  },
];
