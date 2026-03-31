/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import type { OrganizationFormValues } from "@/lib/validations/settings";

export async function actionUpdateOrganization(data: OrganizationFormValues) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = (user as any).user_metadata?.organization_id;

  if (!organizationId) {
    return { error: "No organization found for this user" };
  }

  const { error } = await (supabase as any)
    .from("organizations")
    .update({
      name: data.companyName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
