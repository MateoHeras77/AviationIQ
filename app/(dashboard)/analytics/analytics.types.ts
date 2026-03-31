// =============================================================================
// Analytics Module Types
// =============================================================================

export interface AnalyticsOverview {
  totalFlightsToday: number;
  onTimeRate: number;
  avgTurnaroundMin: number;
  slaComplianceRate: number;
  openDamageReports: number;
  activeGroomingOrders: number;
  flightStatusDistribution: FlightStatusCount[];
  turnaroundPerformance: TurnaroundEventPerformance[];
  stationComparison: StationComparisonRow[];
}

export interface FlightStatusCount {
  status: string;
  count: number;
  label: string;
  color: string;
}

export interface TurnaroundEventPerformance {
  eventType: string;
  label: string;
  avgMinutes: number;
  slaMaxMinutes: number | null;
}

export interface StationComparisonRow {
  stationId: string;
  stationCode: string;
  stationName: string;
  totalFlights: number;
  avgTurnaroundMin: number;
  onTimeRate: number;
}

export interface SlaReportFlight {
  id: string;
  flightNumber: string;
  airlineName: string;
  status: string;
  eventsCompleted: number;
  totalEvents: number;
  slaStatus: "compliant" | "at_risk" | "breached" | "pending";
}

export interface SlaReportSummary {
  totalFlights: number;
  compliantCount: number;
  atRiskCount: number;
  breachedCount: number;
  pendingCount: number;
  complianceRate: number;
  flights: SlaReportFlight[];
}

export interface ExportReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}
