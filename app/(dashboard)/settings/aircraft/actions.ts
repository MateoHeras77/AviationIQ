"use server";

import { createClient } from "@/lib/supabase/server";
import type { AircraftTypeFormValues } from "@/lib/validations/settings";

export async function actionCreateAircraftType(data: AircraftTypeFormValues) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = (user as any).user_metadata?.organization_id;

  if (!organizationId) {
    return { error: "No organization found" };
  }

  const { error } = await (supabase as any).from("aircraft_types").insert({
    organization_id: organizationId,
    code: data.code,
    name: data.name,
    manufacturer: data.manufacturer,
    transit_clean_minutes: data.transitCleanMinutes,
    full_clean_minutes: data.fullCleanMinutes,
    deep_clean_minutes: data.deepCleanMinutes,
    default_turnaround_minutes: data.defaultTurnaroundMinutes,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function actionUpdateAircraftType(
  aircraftTypeId: string,
  data: AircraftTypeFormValues
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = (user as any).user_metadata?.organization_id;

  const { error } = await (supabase as any)
    .from("aircraft_types")
    .update({
      code: data.code,
      name: data.name,
      manufacturer: data.manufacturer,
      transit_clean_minutes: data.transitCleanMinutes,
      full_clean_minutes: data.fullCleanMinutes,
      deep_clean_minutes: data.deepCleanMinutes,
      default_turnaround_minutes: data.defaultTurnaroundMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", aircraftTypeId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function actionDeleteAircraftType(aircraftTypeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = (user as any).user_metadata?.organization_id;

  const { error } = await (supabase as any)
    .from("aircraft_types")
    .delete()
    .eq("id", aircraftTypeId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
