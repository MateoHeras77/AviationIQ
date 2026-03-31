export type DamageReportStatus =
  | "draft"
  | "submitted"
  | "supervisor_reviewed"
  | "approved"
  | "rejected";

export type DamageSeverity = "minor" | "moderate" | "major" | "critical";

export const DAMAGE_STATUS_LABELS: Record<DamageReportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  supervisor_reviewed: "Supervisor Reviewed",
  approved: "Approved",
  rejected: "Rejected",
};

export const DAMAGE_STATUS_VARIANT: Record<
  DamageReportStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  draft: "neutral",
  submitted: "info",
  supervisor_reviewed: "warning",
  approved: "success",
  rejected: "danger",
};

export const SEVERITY_LABELS: Record<DamageSeverity, string> = {
  minor: "Minor",
  moderate: "Moderate",
  major: "Major",
  critical: "Critical",
};

export const SEVERITY_VARIANT: Record<
  DamageSeverity,
  "success" | "warning" | "danger" | "danger"
> = {
  minor: "success",
  moderate: "warning",
  major: "danger",
  critical: "danger",
};

export interface DamageReport {
  id: string;
  organization_id: string;
  flight_id: string | null;
  aircraft_registration: string | null;
  station_id: string;
  damage_location: string;
  description: string;
  severity: DamageSeverity;
  status: DamageReportStatus;
  reported_by: string;
  supervisor_id: string | null;
  supervisor_comments: string | null;
  supervisor_reviewed_at: string | null;
  manager_id: string | null;
  manager_comments: string | null;
  manager_approved_at: string | null;
  airline_notified_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  flight_number?: string;
  reported_by_name?: string;
  supervisor_name?: string;
  manager_name?: string;
  station_code?: string;
  photos?: DamageReportPhoto[];
}

export interface DamageReportPhoto {
  id: string;
  organization_id: string;
  damage_report_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  uploaded_by: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  created_at: string;
}

export interface DamageReportWithDetails extends DamageReport {
  photos: DamageReportPhoto[];
  status_history: DamageStatusChange[];
}

export interface DamageStatusChange {
  status: DamageReportStatus;
  changed_by_name: string;
  changed_at: string;
  comments: string | null;
}
