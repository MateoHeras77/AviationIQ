// =============================================================================
// Base email types
// =============================================================================

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId: string | null;
  error: string | null;
}

// =============================================================================
// Template parameter types
// =============================================================================

export interface TurnaroundAlertParams {
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  delayMinutes: number;
  delayReason: string;
  stationCode: string;
}

export interface DamageReportNotificationParams {
  reportId: string;
  flightNumber: string;
  aircraftRegistration: string;
  damageDescription: string;
  severity: string;
  reportedBy: string;
  reportedAt: string;
  stationCode: string;
  imageUrls?: string[];
}

export interface DamageReportSubmittedParams {
  reportId: string;
  flightNumber: string;
  aircraftRegistration: string;
  damageLocation: string;
  damageDescription: string;
  severity: string;
  reportedBy: string;
  reportedAt: string;
  stationCode: string;
  dashboardUrl: string;
}

export interface DamageReportApprovedParams {
  reportId: string;
  flightNumber: string;
  aircraftRegistration: string;
  damageDescription: string;
  severity: string;
  supervisorName: string;
  supervisorComments: string | null;
  stationCode: string;
  dashboardUrl: string;
}

export interface DamageReportRejectedParams {
  reportId: string;
  flightNumber: string;
  aircraftRegistration: string;
  damageDescription: string;
  severity: string;
  rejectedBy: string;
  rejectionComments: string;
  stationCode: string;
  dashboardUrl: string;
}

export interface GroomingAssignmentParams {
  agentName: string;
  flightNumber: string;
  aircraftRegistration: string;
  cleaningLevel: string;
  gate: string;
  scheduledTime: string;
  stationCode: string;
  dashboardUrl: string;
}

export interface BaggageStatusUpdateParams {
  caseId: string;
  passengerName: string;
  status: string;
  flightNumber: string;
  bagTagNumber: string;
  lastKnownLocation?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export interface ShiftHandoverReportParams {
  stationCode: string;
  outgoingShift: string;
  incomingShift: string;
  handoverDate: string;
  pendingFlights: number;
  openIssues: string[];
  completedTasks: string[];
  notes?: string;
  handoverBy: string;
}

export interface UserInvitationParams {
  inviteeName: string;
  inviteeEmail: string;
  organizationName: string;
  role: string;
  invitedBy: string;
  inviteUrl: string;
}

// =============================================================================
// Notification dispatcher types
// =============================================================================

export type NotificationType =
  | "turnaround_delay"
  | "damage_report_submitted"
  | "damage_report_approved"
  | "damage_report_final_approved"
  | "damage_report_rejected"
  | "grooming_assignment"
  | "user_invitation";

export interface NotificationPayloadMap {
  turnaround_delay: TurnaroundAlertParams & { recipientEmail: string; recipientName: string };
  damage_report_submitted: DamageReportSubmittedParams & { recipientEmail: string; recipientName: string };
  damage_report_approved: DamageReportApprovedParams & { recipientEmail: string; recipientName: string };
  damage_report_final_approved: DamageReportNotificationParams & { recipientEmail: string; recipientName: string };
  damage_report_rejected: DamageReportRejectedParams & { recipientEmail: string; recipientName: string };
  grooming_assignment: GroomingAssignmentParams & { recipientEmail: string };
  user_invitation: UserInvitationParams;
}
