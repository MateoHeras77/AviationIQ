/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { RealtimeFlightBoard } from "@/components/modules/turnaround/realtime-flight-board";

export default async function TurnaroundPage() {
  const supabase = await createClient();

  // Get the current user's profile to determine station
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let flights: unknown[] = [];

  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("station_id")
      .eq("id", user.id)
      .single();

    // Get today's flights for the user's station
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let query = (supabase as any)
      .from("flights")
      .select(
        "*, airline_clients(name), aircraft_types(code), stations(airport_code)"
      )
      .gte("scheduled_departure", todayStart.toISOString())
      .lte("scheduled_departure", todayEnd.toISOString())
      .order("scheduled_departure", { ascending: true });

    if (profile?.station_id) {
      query = query.eq("station_id", profile.station_id);
    }

    const { data } = await query;

    flights = (data || []).map((f: any) => ({
      ...f,
      airline_client_name: f.airline_clients?.name,
      aircraft_type_code: f.aircraft_types?.code,
      station_code: f.stations?.airport_code,
    }));

    // Fetch turnaround event counts for all flights
    const flightIds = flights.map((f: any) => f.id);
    if (flightIds.length > 0) {
      const { data: eventData } = await (supabase as any)
        .from("turnaround_events")
        .select("flight_id, event_type, logged_at")
        .in("flight_id", flightIds)
        .order("event_sequence", { ascending: true });

      const eventsByFlight = new Map<string, { count: number; lastEventAt: string | null }>();
      for (const evt of eventData || []) {
        const existing = eventsByFlight.get((evt as any).flight_id);
        if (existing) {
          existing.count += 1;
          if (!existing.lastEventAt || (evt as any).logged_at > existing.lastEventAt) {
            existing.lastEventAt = (evt as any).logged_at;
          }
        } else {
          eventsByFlight.set((evt as any).flight_id, { count: 1, lastEventAt: (evt as any).logged_at });
        }
      }

      for (const flight of flights) {
        const info = eventsByFlight.get((flight as any).id);
        (flight as any).completed_events = info?.count ?? 0;
        (flight as any).last_event_at = info?.lastEventAt ?? null;
      }
    }
  }

  return <RealtimeFlightBoard initialFlights={flights as any} />;
}
