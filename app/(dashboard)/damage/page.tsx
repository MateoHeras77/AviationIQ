/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { DamageListClient } from "./damage-list-client";

export default async function DamagePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let reports: unknown[] = [];

  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("station_id")
      .eq("id", user.id)
      .single();

    const stationId = profile?.station_id;

    let query = (supabase as any)
      .from("damage_reports")
      .select(
        "*, flights(flight_number), reporter:profiles!damage_reports_reported_by_fkey(full_name), stations(airport_code)"
      )
      .order("created_at", { ascending: false });

    if (stationId) {
      query = query.eq("station_id", stationId);
    }

    const { data } = await query;

    reports = (data || []).map((r: any) => ({
      ...r,
      flight_number: r.flights?.flight_number,
      reported_by_name: r.reporter?.full_name,
      station_code: r.stations?.airport_code,
    }));
  }

  return <DamageListClient initialReports={reports as any} />;
}
