/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { GroomingListClient } from "./grooming-list-client";

export default async function GroomingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let workOrders: unknown[] = [];

  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("station_id")
      .eq("id", user.id)
      .single();

    const stationId = profile?.station_id;

    const { data } = await (supabase as any)
      .from("grooming_work_orders")
      .select(
        "*, flights(flight_number, station_id, stations(airport_code)), aircraft_types(code), profiles(full_name), grooming_assignments(id)"
      )
      .order("created_at", { ascending: false });

    workOrders = (data || [])
      .filter((wo: any) => !stationId || wo.flights?.station_id === stationId)
      .map((wo: any) => ({
        ...wo,
        flight_number: wo.flights?.flight_number,
        station_code: wo.flights?.stations?.airport_code,
        aircraft_type_code: wo.aircraft_types?.code,
        supervisor_name: wo.profiles?.full_name,
        assigned_agents_count: wo.grooming_assignments?.length ?? 0,
      }));
  }

  return <GroomingListClient initialWorkOrders={workOrders as any} />;
}
