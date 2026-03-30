export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

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
