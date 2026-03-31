export type FlightStatus =
  | "scheduled"
  | "on_track"
  | "at_risk"
  | "delayed"
  | "completed"
  | "cancelled";

export type TurnaroundEventType =
  | "aircraft_arrival"
  | "door_open"
  | "deplaning_start"
  | "deplaning_end"
  | "cleaning_start"
  | "cleaning_end"
  | "catering_confirmed"
  | "fueling_confirmed"
  | "boarding_start"
  | "boarding_end"
  | "door_close"
  | "pushback";

export const TURNAROUND_EVENT_SEQUENCE: TurnaroundEventType[] = [
  "aircraft_arrival",
  "door_open",
  "deplaning_start",
  "deplaning_end",
  "cleaning_start",
  "cleaning_end",
  "catering_confirmed",
  "fueling_confirmed",
  "boarding_start",
  "boarding_end",
  "door_close",
  "pushback",
];

export const EVENT_LABELS: Record<TurnaroundEventType, string> = {
  aircraft_arrival: "Aircraft Arrival",
  door_open: "Door Open",
  deplaning_start: "Deplaning Start",
  deplaning_end: "Deplaning End",
  cleaning_start: "Cleaning Start",
  cleaning_end: "Cleaning End",
  catering_confirmed: "Catering Confirmed",
  fueling_confirmed: "Fueling Confirmed",
  boarding_start: "Boarding Start",
  boarding_end: "Boarding End",
  door_close: "Door Close",
  pushback: "Pushback",
};

export interface Flight {
  id: string;
  organization_id: string;
  station_id: string;
  airline_client_id: string;
  flight_number: string;
  aircraft_type_id: string | null;
  aircraft_registration: string | null;
  origin: string | null;
  destination: string | null;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  actual_arrival: string | null;
  actual_departure: string | null;
  status: FlightStatus;
  gate: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  airline_client_name?: string;
  aircraft_type_code?: string;
  station_code?: string;
  // Computed fields from flight board
  completed_events?: number;
  last_event_at?: string | null;
}

export interface TurnaroundEvent {
  id: string;
  organization_id: string;
  flight_id: string;
  event_type: TurnaroundEventType;
  event_sequence: number;
  logged_at: string;
  logged_by: string | null;
  planned_time: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  logged_by_name?: string;
}

export interface TurnaroundAlert {
  id: string;
  organization_id: string;
  flight_id: string;
  event_type: TurnaroundEventType | null;
  alert_message: string;
  is_read: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  // Joined fields
  flight_number?: string;
  acknowledged_by_name?: string;
}

export interface FlightWithEvents extends Flight {
  turnaround_events: TurnaroundEvent[];
}

export const FLIGHT_STATUS_VARIANT: Record<
  FlightStatus,
  "success" | "warning" | "danger" | "neutral" | "info"
> = {
  scheduled: "info",
  on_track: "success",
  at_risk: "warning",
  delayed: "danger",
  completed: "neutral",
  cancelled: "neutral",
};
