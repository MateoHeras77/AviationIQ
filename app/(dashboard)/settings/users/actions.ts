/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import type { InviteUserFormValues } from "@/lib/validations/settings";

export async function actionInviteUser(data: InviteUserFormValues) {
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

  // Create an invitation record
  const { error } = await (supabase as any)
    .from("invitations")
    .insert({
      organization_id: organizationId,
      email: data.email,
      role: data.role,
      station_id: data.stationId,
      invited_by: user.id,
      status: "pending",
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function actionUpdateUser(
  userId: string,
  data: { role?: string; station_id?: string; is_active?: boolean }
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
    .from("profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function actionDeactivateUser(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = (user as any).user_metadata?.organization_id;

  const { error } = await (supabase as any)
    .from("profiles")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
