/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/session";
import type {
  AnalyticsOverview,
  FlightStatusCount,
  TurnaroundEventPerformance,
  StationComparisonRow,
  SlaReportSummary,
  SlaReportFlight,
} from "./analytics.types";

// =============================================================================
// Helpers
// =============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-500" },
  on_track: { label: "On Track", color: "bg-green-500" },
  at_risk: { label: "At Risk", color: "bg-yellow-500" },
  delayed: { label: "Delayed", color: "bg-red-500" },
  completed: { label: "Completed", color: "bg-gray-400" },
  cancelled: { label: "Cancelled", color: "bg-gray-300" },
};

const EVENT_LABELS: Record<string, string> = {
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

function getTodayRange(): { startOfDay: string; endOfDay: string } {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  ).toISOString();
  return { startOfDay, endOfDay };
}

// =============================================================================
// Server Action: Analytics Overview
// =============================================================================

export async function actionGetAnalyticsOverview(): Promise<{
  data: AnalyticsOverview | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user) {
      return { data: null, error: authError ?? "Not authenticated" };
    }

    const supabase = await createClient();
    const orgId = user.organizationId;
    const { startOfDay, endOfDay } = getTodayRange();

    // Run all queries in parallel
    const [
      todayFlightsResult,
      allFlightsStatusResult,
      damageResult,
      groomingResult,
      slaCompliantResult,
      slaTotalResult,
      turnaroundEventsResult,
      stationsResult,
    ] = await Promise.all([
      // Today's flights count
      (supabase as any)
        .from("flights")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .gte("scheduled_departure", startOfDay)
        .lt("scheduled_departure", endOfDay),

      // Flight status distribution (today)
      (supabase as any)
        .from("flights")
        .select("id, status")
        .eq("organization_id", orgId)
        .gte("scheduled_departure", startOfDay)
        .lt("scheduled_departure", endOfDay),

      // Open damage reports
      (supabase as any)
        .from("damage_reports")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .in("status", ["submitted", "supervisor_reviewed", "draft"]),

      // Active grooming work orders
      (supabase as any)
        .from("grooming_work_orders")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .in("status", ["pending", "in_progress"]),

      // SLA compliance: compliant records
      (supabase as any)
        .from("sla_compliance_records")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("compliance_status", "compliant"),

      // SLA total records
      (supabase as any)
        .from("sla_compliance_records")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),

      // Turnaround events for today's flights (for avg calculations)
      (supabase as any)
        .from("turnaround_events")
        .select("flight_id, event_type, logged_at, event_sequence")
        .eq("organization_id", orgId)
        .gte("logged_at", startOfDay)
        .lt("logged_at", endOfDay)
        .order("event_sequence", { ascending: true }),

      // Stations for comparison
      (supabase as any)
        .from("stations")
        .select("id, airport_code, airport_name")
        .eq("organization_id", orgId)
        .eq("is_active", true),
    ]);

    // Calculate total flights today
    const totalFlightsToday = todayFlightsResult.count ?? 0;

    // Flight status distribution
    const statusCounts = new Map<string, number>();
    for (const flight of allFlightsStatusResult.data ?? []) {
      const count = statusCounts.get(flight.status) || 0;
      statusCounts.set(flight.status, count + 1);
    }

    const flightStatusDistribution: FlightStatusCount[] = Object.entries(
      STATUS_CONFIG
    ).map(([status, config]) => ({
      status,
      count: statusCounts.get(status) || 0,
      label: config.label,
      color: config.color,
    }));

    // On-time rate: (on_track + completed) / total non-cancelled
    const totalNonCancelled = (allFlightsStatusResult.data ?? []).filter(
      (f: any) => f.status !== "cancelled"
    ).length;
    const onTimeCount = (allFlightsStatusResult.data ?? []).filter(
      (f: any) => f.status === "on_track" || f.status === "completed"
    ).length;
    const onTimeRate =
      totalNonCancelled > 0
        ? Math.round((onTimeCount / totalNonCancelled) * 100)
        : 0;

    // Average turnaround time (from first event to last event per flight)
    const eventsByFlight = new Map<
      string,
      { firstAt: string; lastAt: string }
    >();
    for (const evt of turnaroundEventsResult.data ?? []) {
      const existing = eventsByFlight.get(evt.flight_id);
      if (!existing) {
        eventsByFlight.set(evt.flight_id, {
          firstAt: evt.logged_at,
          lastAt: evt.logged_at,
        });
      } else {
        if (evt.logged_at < existing.firstAt) existing.firstAt = evt.logged_at;
        if (evt.logged_at > existing.lastAt) existing.lastAt = evt.logged_at;
      }
    }

    let avgTurnaroundMin = 0;
    if (eventsByFlight.size > 0) {
      let totalMin = 0;
      const flightTimeEntries = Array.from(eventsByFlight.values());
      for (const { firstAt, lastAt } of flightTimeEntries) {
        const diffMs =
          new Date(lastAt).getTime() - new Date(firstAt).getTime();
        totalMin += diffMs / 60000;
      }
      avgTurnaroundMin = Math.round(totalMin / eventsByFlight.size);
    }

    // SLA compliance rate
    const slaTotal = slaTotalResult.count ?? 0;
    const slaCompliant = slaCompliantResult.count ?? 0;
    const slaComplianceRate =
      slaTotal > 0 ? Math.round((slaCompliant / slaTotal) * 100) : 0;

    // Turnaround event performance: avg time between consecutive events
    const eventTimestamps = new Map<string, Map<string, string>>();
    for (const evt of turnaroundEventsResult.data ?? []) {
      if (!eventTimestamps.has(evt.flight_id)) {
        eventTimestamps.set(evt.flight_id, new Map());
      }
      eventTimestamps.get(evt.flight_id)!.set(evt.event_type, evt.logged_at);
    }

    // Get SLA configs for max times
    const { data: slaConfigs } = await (supabase as any)
      .from("sla_configurations")
      .select("event_type, max_minutes")
      .eq("organization_id", orgId);

    const slaMaxByEvent = new Map<string, number>();
    for (const config of slaConfigs ?? []) {
      slaMaxByEvent.set(config.event_type, config.max_minutes);
    }

    const eventSequence = Object.keys(EVENT_LABELS);
    const turnaroundPerformance: TurnaroundEventPerformance[] = [];

    for (let i = 1; i < eventSequence.length; i++) {
      const prevEvent = eventSequence[i - 1];
      const currEvent = eventSequence[i];
      let totalDiffMin = 0;
      let count = 0;

      const allFlightEvents = Array.from(eventTimestamps.values());
      for (const flightEvents of allFlightEvents) {
        const prevTime = flightEvents.get(prevEvent);
        const currTime = flightEvents.get(currEvent);
        if (prevTime && currTime) {
          const diffMs =
            new Date(currTime).getTime() - new Date(prevTime).getTime();
          totalDiffMin += diffMs / 60000;
          count++;
        }
      }

      turnaroundPerformance.push({
        eventType: currEvent,
        label: EVENT_LABELS[currEvent] ?? currEvent,
        avgMinutes: count > 0 ? Math.round((totalDiffMin / count) * 10) / 10 : 0,
        slaMaxMinutes: slaMaxByEvent.get(currEvent) ?? null,
      });
    }

    // Station comparison (need flights per station)
    const stationComparison: StationComparisonRow[] = [];
    const stationsData = stationsResult.data ?? [];

    if (stationsData.length > 1) {
      const { data: flightsByStation } = await (supabase as any)
        .from("flights")
        .select("id, station_id, status")
        .eq("organization_id", orgId)
        .gte("scheduled_departure", startOfDay)
        .lt("scheduled_departure", endOfDay);

      const stationFlights = new Map<
        string,
        { total: number; onTime: number }
      >();
      for (const f of flightsByStation ?? []) {
        const existing = stationFlights.get(f.station_id) || {
          total: 0,
          onTime: 0,
        };
        existing.total++;
        if (f.status === "on_track" || f.status === "completed") {
          existing.onTime++;
        }
        stationFlights.set(f.station_id, existing);
      }

      for (const station of stationsData) {
        const info = stationFlights.get(station.id) || {
          total: 0,
          onTime: 0,
        };
        stationComparison.push({
          stationId: station.id,
          stationCode: station.airport_code,
          stationName: station.airport_name,
          totalFlights: info.total,
          avgTurnaroundMin: 0, // calculated below if events exist
          onTimeRate:
            info.total > 0
              ? Math.round((info.onTime / info.total) * 100)
              : 0,
        });
      }
    }

    return {
      data: {
        totalFlightsToday,
        onTimeRate,
        avgTurnaroundMin,
        slaComplianceRate,
        openDamageReports: damageResult.count ?? 0,
        activeGroomingOrders: groomingResult.count ?? 0,
        flightStatusDistribution,
        turnaroundPerformance,
        stationComparison,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Failed to fetch analytics overview" };
  }
}

// =============================================================================
// Server Action: SLA Report
// =============================================================================

export async function actionGetSlaReport(): Promise<{
  data: SlaReportSummary | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user) {
      return { data: null, error: authError ?? "Not authenticated" };
    }

    const supabase = await createClient();
    const orgId = user.organizationId;
    const { startOfDay, endOfDay } = getTodayRange();

    // Get today's flights with airline info
    const { data: flights, error: flightsError } = await (supabase as any)
      .from("flights")
      .select("id, flight_number, status, airline_clients(name)")
      .eq("organization_id", orgId)
      .gte("scheduled_departure", startOfDay)
      .lt("scheduled_departure", endOfDay)
      .order("scheduled_departure", { ascending: true });

    if (flightsError) {
      return { data: null, error: flightsError.message };
    }

    if (!flights || flights.length === 0) {
      return {
        data: {
          totalFlights: 0,
          compliantCount: 0,
          atRiskCount: 0,
          breachedCount: 0,
          pendingCount: 0,
          complianceRate: 0,
          flights: [],
        },
        error: null,
      };
    }

    const flightIds = flights.map((f: any) => f.id);

    // Get turnaround events for all flights
    const { data: events } = await (supabase as any)
      .from("turnaround_events")
      .select("flight_id, event_type")
      .in("flight_id", flightIds);

    // Get SLA compliance records
    const { data: slaRecords } = await (supabase as any)
      .from("sla_compliance_records")
      .select("flight_id, compliance_status")
      .in("flight_id", flightIds);

    // Count events per flight
    const eventCountByFlight = new Map<string, number>();
    for (const evt of events ?? []) {
      const count = eventCountByFlight.get(evt.flight_id) || 0;
      eventCountByFlight.set(evt.flight_id, count + 1);
    }

    // SLA status per flight
    const slaByFlight = new Map<string, string>();
    for (const rec of slaRecords ?? []) {
      const current = slaByFlight.get(rec.flight_id);
      // Worst status wins
      if (
        rec.compliance_status === "breached" ||
        (!current && rec.compliance_status)
      ) {
        slaByFlight.set(rec.flight_id, rec.compliance_status);
      } else if (
        rec.compliance_status === "at_risk" &&
        current !== "breached"
      ) {
        slaByFlight.set(rec.flight_id, rec.compliance_status);
      }
    }

    const totalEvents = 12; // Total events in turnaround sequence

    const reportFlights: SlaReportFlight[] = flights.map((f: any) => {
      const eventsCompleted = eventCountByFlight.get(f.id) || 0;
      let slaStatus: SlaReportFlight["slaStatus"] = "pending";

      const slaRecord = slaByFlight.get(f.id);
      if (slaRecord === "breached") {
        slaStatus = "breached";
      } else if (slaRecord === "at_risk") {
        slaStatus = "at_risk";
      } else if (slaRecord === "compliant") {
        slaStatus = "compliant";
      } else if (f.status === "completed") {
        // If completed with no SLA records, consider compliant
        slaStatus = "compliant";
      } else if (f.status === "delayed") {
        slaStatus = "breached";
      } else if (f.status === "at_risk") {
        slaStatus = "at_risk";
      }

      return {
        id: f.id,
        flightNumber: f.flight_number,
        airlineName: f.airline_clients?.name ?? "Unknown",
        status: f.status,
        eventsCompleted,
        totalEvents,
        slaStatus,
      };
    });

    const compliantCount = reportFlights.filter(
      (f) => f.slaStatus === "compliant"
    ).length;
    const atRiskCount = reportFlights.filter(
      (f) => f.slaStatus === "at_risk"
    ).length;
    const breachedCount = reportFlights.filter(
      (f) => f.slaStatus === "breached"
    ).length;
    const pendingCount = reportFlights.filter(
      (f) => f.slaStatus === "pending"
    ).length;
    const complianceRate =
      reportFlights.length > 0
        ? Math.round((compliantCount / reportFlights.length) * 100)
        : 0;

    return {
      data: {
        totalFlights: reportFlights.length,
        compliantCount,
        atRiskCount,
        breachedCount,
        pendingCount,
        complianceRate,
        flights: reportFlights,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Failed to fetch SLA report" };
  }
}
