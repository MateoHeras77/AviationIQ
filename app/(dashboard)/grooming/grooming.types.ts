export type CleaningLevel = "transit_clean" | "full_clean" | "deep_clean";

export type GroomingWorkOrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export const CLEANING_LEVEL_LABELS: Record<CleaningLevel, string> = {
  transit_clean: "Transit Clean",
  full_clean: "Full Clean",
  deep_clean: "Deep Clean",
};

export const CLEANING_LEVEL_VARIANT: Record<
  CleaningLevel,
  "info" | "warning" | "danger"
> = {
  transit_clean: "info",
  full_clean: "warning",
  deep_clean: "danger",
};

export const WORK_ORDER_STATUS_VARIANT: Record<
  GroomingWorkOrderStatus,
  "neutral" | "info" | "success" | "danger"
> = {
  pending: "neutral",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
};

export interface GroomingWorkOrder {
  id: string;
  organization_id: string;
  flight_id: string;
  aircraft_type_id: string | null;
  cleaning_level: CleaningLevel;
  standard_duration_min: number;
  actual_duration_min: number | null;
  required_agents: number;
  status: GroomingWorkOrderStatus;
  supervisor_id: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  flight_number?: string;
  aircraft_type_code?: string;
  station_code?: string;
  supervisor_name?: string;
  assigned_agents_count?: number;
}

export interface GroomingAssignment {
  id: string;
  organization_id: string;
  work_order_id: string;
  agent_id: string;
  entry_time: string | null;
  completion_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  agent_name?: string;
  agent_email?: string;
}

export interface GroomingWorkOrderWithAssignments extends GroomingWorkOrder {
  grooming_assignments: GroomingAssignment[];
}

export interface AgentOption {
  id: string;
  full_name: string;
  email: string;
}
