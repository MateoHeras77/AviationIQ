"use server";

import type {
  ShiftSchedule,
  StaffMember,
  HandoverLog,
  WorkforceStats,
} from "./workforce.types";

// ── Mock Staff Data ──────────────────────────────────────────────────────────

const MOCK_STAFF: StaffMember[] = [
  { id: "s1", name: "Marcus Johnson", role: "ramp_agent", station: "YUL", status: "on_shift", phone: "+1 514-555-0101", initials: "MJ", currentShift: "morning" },
  { id: "s2", name: "Sarah Chen", role: "wing_walker", station: "YUL", status: "on_shift", phone: "+1 514-555-0102", initials: "SC", currentShift: "morning" },
  { id: "s3", name: "David Tremblay", role: "marshaller", station: "YUL", status: "on_shift", phone: "+1 514-555-0103", initials: "DT", currentShift: "morning" },
  { id: "s4", name: "Priya Patel", role: "cabin_cleaner", station: "YUL", status: "on_shift", phone: "+1 514-555-0104", initials: "PP", currentShift: "morning" },
  { id: "s5", name: "James Wilson", role: "ramp_agent", station: "YUL", status: "on_shift", phone: "+1 514-555-0201", initials: "JW", currentShift: "afternoon" },
  { id: "s6", name: "Amara Diallo", role: "customer_service_agent", station: "YUL", status: "on_shift", phone: "+1 514-555-0202", initials: "AD", currentShift: "afternoon" },
  { id: "s7", name: "Carlos Rivera", role: "marshaller", station: "YUL", status: "on_break", phone: "+1 514-555-0203", initials: "CR", currentShift: "afternoon" },
  { id: "s8", name: "Nadia Bouchard", role: "cabin_cleaner", station: "YUL", status: "on_shift", phone: "+1 514-555-0204", initials: "NB", currentShift: "afternoon" },
  { id: "s9", name: "Kevin O'Brien", role: "ramp_agent", station: "YUL", status: "off_shift", phone: "+1 514-555-0301", initials: "KO", currentShift: "night" },
  { id: "s10", name: "Fatima Hassan", role: "wing_walker", station: "YUL", status: "off_shift", phone: "+1 514-555-0302", initials: "FH", currentShift: "night" },
  { id: "s11", name: "Liam Gagnon", role: "ramp_agent", station: "YUL", status: "off_shift", phone: "+1 514-555-0303", initials: "LG", currentShift: "night" },
  { id: "s12", name: "Maya Thompson", role: "customer_service_agent", station: "YUL", status: "off_shift", phone: "+1 514-555-0304", initials: "MT", currentShift: "night" },
];

// ── Mock Shift Data ──────────────────────────────────────────────────────────

const MOCK_SHIFTS: ShiftSchedule[] = [
  {
    id: "shift-morning",
    type: "morning",
    startTime: "06:00",
    endTime: "14:00",
    startHour: 6,
    endHour: 14,
    staffCount: 4,
    staff: MOCK_STAFF.filter((s) => s.currentShift === "morning"),
  },
  {
    id: "shift-afternoon",
    type: "afternoon",
    startTime: "14:00",
    endTime: "22:00",
    startHour: 14,
    endHour: 22,
    staffCount: 4,
    staff: MOCK_STAFF.filter((s) => s.currentShift === "afternoon"),
  },
  {
    id: "shift-night",
    type: "night",
    startTime: "22:00",
    endTime: "06:00",
    startHour: 22,
    endHour: 30, // wraps to next day, represented as 30 for timeline
    staffCount: 4,
    staff: MOCK_STAFF.filter((s) => s.currentShift === "night"),
  },
];

// ── Mock Handover Data ───────────────────────────────────────────────────────

const MOCK_HANDOVERS: HandoverLog[] = [
  {
    id: "ho-1",
    outgoingSupervisor: "Marcus Johnson",
    incomingSupervisor: "James Wilson",
    shift: "morning",
    nextShift: "afternoon",
    timestamp: new Date().toISOString().split("T")[0] + "T13:45:00Z",
    notes: [
      "Gate B4 belt loader needs maintenance — reported to MX team",
      "Flight AC8842 had a 25-min delay due to late catering, SLA flagged",
      "New marshaller Carlos Rivera starting first solo shift this afternoon",
    ],
    status: "acknowledged",
  },
  {
    id: "ho-2",
    outgoingSupervisor: "James Wilson",
    incomingSupervisor: "Kevin O'Brien",
    shift: "afternoon",
    nextShift: "night",
    timestamp: new Date().toISOString().split("T")[0] + "T21:30:00Z",
    notes: [
      "Runway 24L closed for maintenance until 02:00 — expect taxi delays",
      "Two overnight cargo flights scheduled: CX4401 and FX892",
      "Break room coffee machine still broken — facilities notified",
    ],
    status: "pending",
  },
];

// ── Server Actions ───────────────────────────────────────────────────────────

export async function actionGetShifts(): Promise<{
  data: ShiftSchedule[];
  error?: string;
}> {
  return { data: MOCK_SHIFTS };
}

export async function actionGetStaffDirectory(): Promise<{
  data: StaffMember[];
  error?: string;
}> {
  return { data: MOCK_STAFF };
}

export async function actionGetHandoverLogs(): Promise<{
  data: HandoverLog[];
  error?: string;
}> {
  return { data: MOCK_HANDOVERS };
}

export async function actionGetWorkforceStats(): Promise<{
  data: WorkforceStats;
  error?: string;
}> {
  const onDuty = MOCK_STAFF.filter((s) => s.status === "on_shift" || s.status === "on_break").length;
  const pendingHandovers = MOCK_HANDOVERS.filter((h) => h.status === "pending").length;

  return {
    data: {
      onDutyNow: onDuty,
      totalStaff: MOCK_STAFF.length,
      shiftsToday: MOCK_SHIFTS.length,
      pendingHandovers,
    },
  };
}
