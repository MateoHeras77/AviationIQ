/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createFlightSchema,
  type CreateFlightFormValues,
  logTurnaroundEventSchema,
  type LogTurnaroundEventFormValues,
} from "@/lib/validations/turnaround";
import { TURNAROUND_EVENT_SEQUENCE } from "./turnaround.types";
import type { TurnaroundEventType } from "./turnaround.types";

async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" as const };
  }

  const organizationId = (user as any).user_metadata?.organization_id as
    | string
    | undefined;

  if (!organizationId) {
    return { error: "No organization found" as const };
  }

  const { data: profileData } = await (supabase as any)
    .from("profiles")
    .select("station_id, role, full_name")
    .eq("id", user.id)
    .single();

  return {
    supabase: supabase as any,
    user,
    organizationId,
    stationId: profileData?.station_id as string | null,
    userRole: profileData?.role as string | null,
    userName: profileData?.full_name as string | null,
  };
}

export async function actionCreateFlight(data: CreateFlightFormValues) {
  const parsed = createFlightSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, organizationId, stationId } = ctx;

  if (!stationId) {
    return { error: "No station assigned to your profile" };
  }

  const { data: flight, error } = await supabase.from("flights").insert({
    organization_id: organizationId,
    station_id: stationId,
    airline_client_id: parsed.data.airlineClientId,
    flight_number: parsed.data.flightNumber.toUpperCase(),
    aircraft_type_id: parsed.data.aircraftTypeId || null,
    aircraft_registration: parsed.data.aircraftRegistration || null,
    origin: parsed.data.origin.toUpperCase(),
    destination: parsed.data.destination.toUpperCase(),
    scheduled_arrival: parsed.data.scheduledArrival,
    scheduled_departure: parsed.data.scheduledDeparture,
    gate: parsed.data.gate || null,
    notes: parsed.data.notes || null,
    status: "scheduled",
    created_by: user.id,
  }).select().single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/turnaround");
  return { success: true, data: flight };
}

export async function actionLogTurnaroundEvent(
  data: LogTurnaroundEventFormValues
) {
  const parsed = logTurnaroundEventSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, organizationId } = ctx;

  // Validate event sequence - check which events already exist for this flight
  const { data: existingEvents } = await supabase
    .from("turnaround_events")
    .select("event_type, event_sequence")
    .eq("flight_id", parsed.data.flightId)
    .order("event_sequence", { ascending: true });

  const completedTypes = (existingEvents || []).map(
    (e: { event_type: string }) => e.event_type
  );
  const eventIndex = TURNAROUND_EVENT_SEQUENCE.indexOf(
    parsed.data.eventType as TurnaroundEventType
  );

  // Ensure the previous event in the sequence has been logged
  if (eventIndex > 0) {
    const previousEvent = TURNAROUND_EVENT_SEQUENCE[eventIndex - 1];
    if (!completedTypes.includes(previousEvent)) {
      return {
        error: `Cannot log "${parsed.data.eventType}" before "${previousEvent}" has been completed`,
      };
    }
  }

  // Ensure this event hasn't already been logged
  if (completedTypes.includes(parsed.data.eventType)) {
    return { error: "This event has already been logged" };
  }

  const { error } = await supabase.from("turnaround_events").insert({
    organization_id: organizationId,
    flight_id: parsed.data.flightId,
    event_type: parsed.data.eventType,
    event_sequence: eventIndex + 1,
    logged_at: new Date().toISOString(),
    logged_by: user.id,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Update flight status to on_track if it was scheduled
  if (parsed.data.eventType === "aircraft_arrival") {
    await supabase
      .from("flights")
      .update({ status: "on_track", actual_arrival: new Date().toISOString() })
      .eq("id", parsed.data.flightId);
  }

  // Mark flight as completed if pushback is logged
  if (parsed.data.eventType === "pushback") {
    await supabase
      .from("flights")
      .update({
        status: "completed",
        actual_departure: new Date().toISOString(),
      })
      .eq("id", parsed.data.flightId);
  }

  revalidatePath(`/turnaround/${parsed.data.flightId}`);
  revalidatePath("/turnaround");
  return { success: true };
}

export async function actionAcknowledgeAlert(alertId: string) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user } = ctx;

  const { error } = await supabase
    .from("turnaround_alerts")
    .update({
      is_read: true,
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", alertId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/turnaround/alerts");
  return { success: true };
}

export async function actionGetFlights(filters?: {
  status?: string;
  search?: string;
}) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  let query = supabase
    .from("flights")
    .select(
      "*, airline_clients(name), aircraft_types(code), stations(airport_code)"
    )
    .order("scheduled_departure", { ascending: true });

  if (stationId) {
    query = query.eq("station_id", stationId);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.ilike("flight_number", `%${filters.search}%`);
  }

  // Get today's flights by default
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  query = query
    .gte("scheduled_departure", todayStart.toISOString())
    .lte("scheduled_departure", todayEnd.toISOString());

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  // Map joined data
  const flights = (data || []).map((f: any) => ({
    ...f,
    airline_client_name: f.airline_clients?.name,
    aircraft_type_code: f.aircraft_types?.code,
    station_code: f.stations?.airport_code,
  }));

  // Fetch turnaround event counts for all flights in one query
  const flightIds = flights.map((f: any) => f.id);
  if (flightIds.length > 0) {
    const { data: eventData } = await supabase
      .from("turnaround_events")
      .select("flight_id, event_type, logged_at")
      .in("flight_id", flightIds)
      .order("event_sequence", { ascending: true });

    const eventsByFlight = new Map<string, { count: number; lastEventAt: string | null }>();
    for (const evt of eventData || []) {
      const existing = eventsByFlight.get(evt.flight_id);
      if (existing) {
        existing.count += 1;
        if (!existing.lastEventAt || evt.logged_at > existing.lastEventAt) {
          existing.lastEventAt = evt.logged_at;
        }
      } else {
        eventsByFlight.set(evt.flight_id, { count: 1, lastEventAt: evt.logged_at });
      }
    }

    for (const flight of flights) {
      const info = eventsByFlight.get(flight.id);
      flight.completed_events = info?.count ?? 0;
      flight.last_event_at = info?.lastEventAt ?? null;
    }
  }

  return { data: flights };
}

export async function actionGetFlightDetails(flightId: string) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase } = ctx;

  const { data: flight, error: flightError } = await supabase
    .from("flights")
    .select(
      "*, airline_clients(name), aircraft_types(code), stations(airport_code)"
    )
    .eq("id", flightId)
    .single();

  if (flightError) {
    return { error: flightError.message };
  }

  const { data: events, error: eventsError } = await supabase
    .from("turnaround_events")
    .select("*, profiles(full_name)")
    .eq("flight_id", flightId)
    .order("event_sequence", { ascending: true });

  if (eventsError) {
    return { error: eventsError.message };
  }

  const mappedEvents = (events || []).map((e: any) => ({
    ...e,
    logged_by_name: e.profiles?.full_name,
  }));

  return {
    data: {
      ...flight,
      airline_client_name: (flight as any).airline_clients?.name,
      aircraft_type_code: (flight as any).aircraft_types?.code,
      station_code: (flight as any).stations?.airport_code,
      turnaround_events: mappedEvents,
    },
  };
}

export async function actionGetAlerts() {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  const { data, error } = await supabase
    .from("turnaround_alerts")
    .select("*, flights(flight_number, station_id), profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  // Filter by station if user has one
  const alerts = (data || [])
    .filter((a: any) => !stationId || a.flights?.station_id === stationId)
    .map((a: any) => ({
      ...a,
      flight_number: a.flights?.flight_number,
      acknowledged_by_name: a.profiles?.full_name,
    }));

  return { data: alerts };
}

export async function actionGetAirlineClients() {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase } = ctx;

  const { data, error } = await supabase
    .from("airline_clients")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function actionGetAircraftTypes() {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase } = ctx;

  const { data, error } = await supabase
    .from("aircraft_types")
    .select("id, code, name")
    .order("code");

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
