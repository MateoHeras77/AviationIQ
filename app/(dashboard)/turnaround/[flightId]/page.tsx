/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TurnaroundTrackerClient } from "./tracker-client";

interface TurnaroundTrackerPageProps {
  params: Promise<{ flightId: string }>;
}

export default async function TurnaroundTrackerPage({
  params,
}: TurnaroundTrackerPageProps) {
  const { flightId } = await params;
  const supabase = await createClient();

  // Fetch flight details
  const { data: flight, error: flightError } = await (supabase as any)
    .from("flights")
    .select(
      "*, airline_clients(name), aircraft_types(code), stations(airport_code)"
    )
    .eq("id", flightId)
    .single();

  if (flightError || !flight) {
    notFound();
  }

  // Fetch turnaround events
  const { data: events } = await (supabase as any)
    .from("turnaround_events")
    .select("*, profiles(full_name)")
    .eq("flight_id", flightId)
    .order("event_sequence", { ascending: true });

  // Get user role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  const mappedFlight = {
    ...flight,
    airline_client_name: flight.airline_clients?.name,
    aircraft_type_code: flight.aircraft_types?.code,
    station_code: flight.stations?.airport_code,
  };

  const mappedEvents = (events || []).map((e: any) => ({
    ...e,
    logged_by_name: e.profiles?.full_name,
  }));

  return (
    <TurnaroundTrackerClient
      flight={mappedFlight}
      events={mappedEvents}
      userRole={userRole}
    />
  );
}
