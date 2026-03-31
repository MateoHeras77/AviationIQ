/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import type { SLAConfigFormValues } from "@/lib/validations/settings";

export async function actionUpdateSLAConfig(data: SLAConfigFormValues) {
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

  // Upsert SLA configs for each event type
  for (const event of data.events) {
    const { error } = await (supabase as any)
      .from("sla_configs")
      .upsert(
        {
          organization_id: organizationId,
          airline_client_id: data.airlineClientId,
          event_type: event.eventType,
          max_duration_minutes: event.maxDurationMinutes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "organization_id,airline_client_id,event_type",
        }
      );

    if (error) {
      return { error: error.message };
    }
  }

  return { success: true };
}
