import type { Level, MoodId } from "./data";

export type AccountStatus = "pending_activation" | "active" | "withdrawn";
export type UserRole = "employee" | "hr";
export type WorkMode = "WFO" | "WFH" | "Hybrid";

export type EmployeeProfile = {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: UserRole;
  accountStatus: AccountStatus;
  generalConsent: boolean;
  psychConsent: boolean;
  consentVersion: string | null;
  consentedAt: string | null;
  anonCode: string;
};

export type AttendanceRecord = {
  id: number;
  employeeId: string;
  workDate: string;
  clockInAt: string;
  clockOutAt: string | null;
  workMode: WorkMode;
  status: string;
  note: string;
};

export type ConsentAuditRecord = {
  id: number;
  employeeId: string;
  action: string;
  generalConsent: boolean;
  psychConsent: boolean;
  documentVersion: string;
  ipAddress: string;
  recordedAt: string;
};

export type PersonalVibeEntry = {
  id: number;
  entryDate: string;
  weekNumber: number;
  moodId: MoodId;
  workloadScore: number;
  tags: string[];
  reflection: string;
  capacityScore: number;
  colorLevel: Level;
  triggerSource: string;
  createdAt: string;
};

export type PersonalBookingEntry = {
  id: number;
  anonCode: string;
  psychologistId: string;
  psychologistName: string;
  slotLabel: string;
  isPriority: boolean;
  preCounselingShared: boolean;
  createdAt: string;
};

export type HrAttendanceRow = {
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  accountStatus: AccountStatus;
  todayClockIn: string | null;
  todayClockOut: string | null;
  todayWorkMode: string | null;
  todayStatus: string;
  totalDaysPresent: number;
};

export type AnonymousAggregateReport = {
  thresholdRequired: number;
  activeRespondents: number;
  totalLogsCount: number;
  meetsThreshold: boolean;
  notice: string;
  metrics: {
    avgCapacityScore: number;
    avgWorkloadScore: number;
    zoneDistribution: {
      greenPct: number;
      yellowPct: number;
      redPct: number;
      greenCount: number;
      yellowCount: number;
      redCount: number;
    };
    weeklyTrend: { week: number; avgScore: number; level: Level }[];
    topContextTags: { tag: string; count: number; kind: "demand" | "resource" }[];
  } | null;
};

export type WorkspaceBundle = {
  employee: EmployeeProfile;
  attendance: {
    todayDate: string;
    todayRecord: AttendanceRecord | null;
    history: AttendanceRecord[];
  };
  psychData: {
    vibeLogs: PersonalVibeEntry[];
    bookings: PersonalBookingEntry[];
  };
  consentHistory: ConsentAuditRecord[];
  hrOverview: {
    todayDate: string;
    attendanceRows: HrAttendanceRow[];
    aggregateReport: AnonymousAggregateReport;
  };
};
