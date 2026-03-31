/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { AlertCenterClient } from "./alert-center-client";

export default async function AlertCenterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alerts: unknown[] = [];
  let stationId: string | null = null;

  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("station_id")
      .eq("id", user.id)
      .single();

    stationId = profile?.station_id ?? null;

    const { data } = await (supabase as any)
      .from("turnaround_alerts")
      .select(
        "*, flights(flight_number, station_id), profiles(full_name)"
      )
      .order("created_at", { ascending: false });

    alerts = (data || [])
      .filter((a: any) => !stationId || a.flights?.station_id === stationId)
      .map((a: any) => ({
        ...a,
        flight_number: a.flights?.flight_number,
        acknowledged_by_name: a.profiles?.full_name,
      }));
  }

  return <AlertCenterClient initialAlerts={alerts as any} />;
}
