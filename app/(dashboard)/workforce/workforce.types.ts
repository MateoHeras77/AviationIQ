export type ShiftType = "morning" | "afternoon" | "night";

export type AgentFlightRole =
  | "ramp_agent"
  | "wing_walker"
  | "marshaller"
  | "cabin_cleaner"
  | "customer_service_agent";

export type StaffStatus = "on_shift" | "off_shift" | "on_break";

export type HandoverStatus = "acknowledged" | "pending";

export interface StaffMember {
  id: string;
  name: string;
  role: AgentFlightRole;
  station: string;
  status: StaffStatus;
  phone: string;
  initials: string;
  currentShift: ShiftType | null;
}

export interface ShiftSchedule {
  id: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  startHour: number;
  endHour: number;
  staffCount: number;
  staff: StaffMember[];
}

export interface HandoverLog {
  id: string;
  outgoingSupervisor: string;
  incomingSupervisor: string;
  shift: ShiftType;
  nextShift: ShiftType;
  timestamp: string;
  notes: string[];
  status: HandoverStatus;
}

export interface WorkforceStats {
  onDutyNow: number;
  totalStaff: number;
  shiftsToday: number;
  pendingHandovers: number;
}
