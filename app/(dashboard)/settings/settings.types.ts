export interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Station {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface AirlineClient {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  station_id: string | null;
  station_code: string | null;
  is_active: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | "admin"
  | "station_manager"
  | "supervisor"
  | "agent"
  | "airline_client";

export interface AircraftType {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  manufacturer: string;
  transit_clean_minutes: number;
  full_clean_minutes: number;
  deep_clean_minutes: number;
  default_turnaround_minutes: number;
  created_at: string;
  updated_at: string;
}

export const TURNAROUND_EVENT_TYPES = [
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
] as const;

export type TurnaroundEventType = (typeof TURNAROUND_EVENT_TYPES)[number];

export interface SLAConfig {
  id: string;
  organization_id: string;
  airline_client_id: string;
  event_type: TurnaroundEventType;
  max_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: string;
  organization_id: string;
  event_type: TurnaroundEventType;
  in_app_enabled: boolean;
  email_enabled: boolean;
  threshold_minutes: number;
  recipient_role: UserRole;
  station_id: string | null;
  created_at: string;
  updated_at: string;
}
