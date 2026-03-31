import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  NotificationSetting,
  UserRole,
  NotificationChannel,
} from "@/lib/supabase/types";

// =============================================================================
// Types
// =============================================================================

export interface NotificationPreference {
  channel: NotificationChannel;
  recipientRole: UserRole;
  stationId: string | null;
  thresholdMinutes: number | null;
  isActive: boolean;
}

export interface PreferencesResult {
  preferences: NotificationPreference[];
  error: string | null;
}

// =============================================================================
// Notification preferences helpers
// =============================================================================

/**
 * Query notification_settings for an organization and return
 * which notification types are enabled and for which roles.
 * Optionally filter by station.
 */
export async function getNotificationPreferences(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  options?: {
    stationId?: string;
    channel?: NotificationChannel;
  }
): Promise<PreferencesResult> {
  try {
    let query = supabase
      .from("notification_settings")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (options?.stationId) {
      query = query.or(
        `station_id.eq.${options.stationId},station_id.is.null`
      );
    }

    if (options?.channel) {
      query = query.eq("channel", options.channel);
    }

    const { data, error } = await query;

    if (error) {
      return {
        preferences: [],
        error: `Failed to fetch notification preferences: ${error.message}`,
      };
    }

    const preferences: NotificationPreference[] = (
      data as NotificationSetting[]
    ).map((setting) => ({
      channel: setting.channel,
      recipientRole: setting.recipient_role,
      stationId: setting.station_id,
      thresholdMinutes: setting.threshold_minutes,
      isActive: setting.is_active,
    }));

    return { preferences, error: null };
  } catch {
    return {
      preferences: [],
      error: "Unexpected error fetching notification preferences",
    };
  }
}

/**
 * Check if a specific notification type should be sent for a given role and channel.
 * Returns true if there is an active preference matching the criteria.
 */
export async function isNotificationEnabled(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  recipientRole: UserRole,
  channel: NotificationChannel = "email",
  stationId?: string
): Promise<boolean> {
  const { preferences, error } = await getNotificationPreferences(
    supabase,
    organizationId,
    { stationId, channel }
  );

  if (error) {
    // Default to sending if we can't check preferences
    console.warn(
      `[AviationIQ Notifications] Could not check preferences, defaulting to enabled: ${error}`
    );
    return true;
  }

  return preferences.some(
    (pref) => pref.recipientRole === recipientRole && pref.isActive
  );
}
