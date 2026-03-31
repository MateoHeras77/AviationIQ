import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Flight,
  TurnaroundAlert,
  DamageReport,
} from "./types";

// =============================================================================
// Realtime payload types
// =============================================================================

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

export interface RealtimePayload<T> {
  eventType: RealtimeEventType;
  new: T;
  old: Partial<T>;
}

export type UnsubscribeFn = () => void;

// =============================================================================
// Typed Realtime subscription helpers
// =============================================================================

/**
 * Subscribe to INSERT/UPDATE on flights table filtered by station_id.
 * Returns an unsubscribe function for cleanup.
 */
export function subscribeToFlights(
  supabase: SupabaseClient<Database>,
  stationId: string,
  callback: (payload: RealtimePayload<Flight>) => void
): UnsubscribeFn {
  const channel: RealtimeChannel = supabase
    .channel(`flights:station:${stationId}`)
    .on<Flight>(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "flights",
        filter: `station_id=eq.${stationId}`,
      },
      (payload) => {
        callback({
          eventType: "INSERT",
          new: payload.new as Flight,
          old: {},
        });
      }
    )
    .on<Flight>(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "flights",
        filter: `station_id=eq.${stationId}`,
      },
      (payload) => {
        callback({
          eventType: "UPDATE",
          new: payload.new as Flight,
          old: payload.old as Partial<Flight>,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to INSERT on turnaround_alerts table filtered by station.
 * Since alerts don't have station_id directly, we filter by organization
 * and let the callback handle station filtering via flight data.
 * Returns an unsubscribe function for cleanup.
 */
export function subscribeToAlerts(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  callback: (payload: RealtimePayload<TurnaroundAlert>) => void
): UnsubscribeFn {
  const channel: RealtimeChannel = supabase
    .channel(`alerts:org:${organizationId}`)
    .on<TurnaroundAlert>(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "turnaround_alerts",
        filter: `organization_id=eq.${organizationId}`,
      },
      (payload) => {
        callback({
          eventType: "INSERT",
          new: payload.new as TurnaroundAlert,
          old: {},
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to INSERT/UPDATE on damage_reports table filtered by organization_id.
 * Returns an unsubscribe function for cleanup.
 */
export function subscribeToDamageReports(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  callback: (payload: RealtimePayload<DamageReport>) => void
): UnsubscribeFn {
  const channel: RealtimeChannel = supabase
    .channel(`damage_reports:org:${organizationId}`)
    .on<DamageReport>(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "damage_reports",
        filter: `organization_id=eq.${organizationId}`,
      },
      (payload) => {
        callback({
          eventType: "INSERT",
          new: payload.new as DamageReport,
          old: {},
        });
      }
    )
    .on<DamageReport>(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "damage_reports",
        filter: `organization_id=eq.${organizationId}`,
      },
      (payload) => {
        callback({
          eventType: "UPDATE",
          new: payload.new as DamageReport,
          old: payload.old as Partial<DamageReport>,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
