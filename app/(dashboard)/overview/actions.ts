"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/session";

// =============================================================================
// Types
// =============================================================================

export interface DashboardStats {
  activeFlights: number;
  groomingOrders: number;
  damageReports: number;
  slaCompliance: number | null;
  recentActivity: RecentActivityItem[];
}

export interface RecentActivityItem {
  id: string;
  flightNumber: string;
  eventType: string;
  loggedAt: string;
  loggedByName: string;
}

// =============================================================================
// Server Actions
// =============================================================================

/**
 * Fetches all dashboard KPI data and recent activity in one call.
 * Filters by the authenticated user's organization_id.
 */
export async function actionGetDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return { data: null, error: authError ?? "Not authenticated" };
    }

    const supabase = await createClient();
    const orgId = user.organizationId;

    // Get today's date range in UTC
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

    // Run all queries in parallel
    const [
      flightsResult,
      groomingResult,
      damageResult,
      slaCompliantResult,
      slaTotalResult,
      recentEventsResult,
    ] = await Promise.all([
      // Active flights: today's flights that are not completed or cancelled
      supabase
        .from("flights")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .gte("scheduled_departure", startOfDay)
        .lt("scheduled_departure", endOfDay)
        .not("status", "in", '("completed","cancelled")'),

      // Grooming work orders: pending + in_progress
      supabase
        .from("grooming_work_orders")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .in("status", ["pending", "in_progress"]),

      // Damage reports needing review: submitted + supervisor_reviewed
      supabase
        .from("damage_reports")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .in("status", ["submitted", "supervisor_reviewed"]),

      // SLA compliance: compliant records
      supabase
        .from("sla_compliance_records")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("compliance_status", "compliant"),

      // SLA total records
      supabase
        .from("sla_compliance_records")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),

      // Recent turnaround events with flight number and logger name
      supabase
        .from("turnaround_events")
        .select(
          `
          id,
          event_type,
          logged_at,
          flights!inner(flight_number),
          profiles:logged_by(full_name)
        `
        )
        .eq("organization_id", orgId)
        .order("logged_at", { ascending: false })
        .limit(5),
    ]);

    // Calculate SLA compliance percentage
    const slaTotal = slaTotalResult.count ?? 0;
    const slaCompliant = slaCompliantResult.count ?? 0;
    const slaCompliance =
      slaTotal > 0 ? Math.round((slaCompliant / slaTotal) * 100) : null;

    // Map recent events
    const recentActivity: RecentActivityItem[] = (
      recentEventsResult.data ?? []
    ).map((event) => {
      const flights = event.flights as unknown as {
        flight_number: string;
      };
      const profiles = event.profiles as unknown as {
        full_name: string;
      } | null;

      return {
        id: event.id,
        flightNumber: flights?.flight_number ?? "Unknown",
        eventType: event.event_type,
        loggedAt: event.logged_at,
        loggedByName: profiles?.full_name ?? "System",
      };
    });

    return {
      data: {
        activeFlights: flightsResult.count ?? 0,
        groomingOrders: groomingResult.count ?? 0,
        damageReports: damageResult.count ?? 0,
        slaCompliance,
        recentActivity,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Failed to fetch dashboard stats" };
  }
}
