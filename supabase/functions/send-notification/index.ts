import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotificationEventType =
  | "turnaround_delay"
  | "damage_report_submitted"
  | "damage_report_approved"
  | "damage_report_rejected";

interface NotificationRequest {
  event_type: NotificationEventType;
  organization_id: string;
  // Context payload — shape varies by event_type
  payload: Record<string, unknown>;
}

interface NotificationSettingRow {
  id: string;
  organization_id: string;
  event_type: string;
  channel: string;
  recipient_role: string;
  station_id: string | null;
  threshold_minutes: number | null;
  is_active: boolean;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  station_id: string | null;
}

interface NotificationRecipient {
  profile_id: string;
  full_name: string;
  email: string;
  channel: string;
}

interface NotificationPayload {
  event_type: NotificationEventType;
  organization_id: string;
  template_key: string;
  subject: string;
  body_context: Record<string, unknown>;
  recipients: NotificationRecipient[];
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Template definitions
// Each event_type maps to a template_key and functions that derive
// subject and body_context from the caller's payload.
// ---------------------------------------------------------------------------

const TEMPLATES: Record<
  NotificationEventType,
  {
    template_key: string;
    subject: (payload: Record<string, unknown>) => string;
    body_context: (payload: Record<string, unknown>) => Record<string, unknown>;
    // The notification_settings event_type to look up.
    // turnaround_delay maps to a turnaround_event_type; damage events use
    // a synthetic mapping handled below.
    settings_event_type: string | null;
    // Roles that should always receive damage-related notifications
    // regardless of notification_settings (override list)
    forced_roles: string[] | null;
  }
> = {
  turnaround_delay: {
    template_key: "turnaround-alert",
    subject: (p) =>
      `[AviationIQ] Turnaround delay on flight ${p["flight_number"] ?? "unknown"}`,
    body_context: (p) => ({
      flight_number: p["flight_number"],
      event_type: p["event_type"],
      delay_minutes: p["delay_minutes"],
      station: p["station"],
      scheduled_departure: p["scheduled_departure"],
    }),
    settings_event_type: null, // caller provides specific event_type in payload
    forced_roles: null,
  },
  damage_report_submitted: {
    template_key: "damage-report",
    subject: (p) =>
      `[AviationIQ] New damage report submitted — ${p["aircraft_registration"] ?? "unknown aircraft"}`,
    body_context: (p) => ({
      report_id: p["report_id"],
      aircraft_registration: p["aircraft_registration"],
      damage_location: p["damage_location"],
      severity: p["severity"],
      reported_by: p["reported_by"],
      station: p["station"],
    }),
    settings_event_type: null,
    forced_roles: ["supervisor", "station_manager", "admin"],
  },
  damage_report_approved: {
    template_key: "damage-report",
    subject: (p) =>
      `[AviationIQ] Damage report approved — ${p["aircraft_registration"] ?? "unknown aircraft"}`,
    body_context: (p) => ({
      report_id: p["report_id"],
      aircraft_registration: p["aircraft_registration"],
      approved_by: p["approved_by"],
      manager_comments: p["manager_comments"],
      airline_client: p["airline_client"],
    }),
    settings_event_type: null,
    forced_roles: ["admin", "station_manager"],
  },
  damage_report_rejected: {
    template_key: "damage-report",
    subject: (p) =>
      `[AviationIQ] Damage report rejected — ${p["aircraft_registration"] ?? "unknown aircraft"}`,
    body_context: (p) => ({
      report_id: p["report_id"],
      aircraft_registration: p["aircraft_registration"],
      rejected_by: p["rejected_by"],
      rejection_reason: p["rejection_reason"] ?? p["manager_comments"],
    }),
    settings_event_type: null,
    forced_roles: ["admin", "station_manager", "supervisor"],
  },
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- JWT verification ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or malformed Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  // Use the service-role key here so we can read profiles across tenant
  // (this function is called server-side, not directly by end-users)
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Decode caller JWT to validate organization_id
  const token = authHeader.replace("Bearer ", "");
  const [, payloadB64] = token.split(".");
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(atob(payloadB64));
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JWT payload" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const callerOrgId = claims["organization_id"] as string | undefined;
  if (!callerOrgId) {
    return new Response(JSON.stringify({ error: "organization_id missing from token claims" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Request body ---
  let body: NotificationRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { event_type, organization_id, payload } = body;

  if (!event_type || !organization_id || !payload) {
    return new Response(
      JSON.stringify({ error: "event_type, organization_id, and payload are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Tenant isolation check
  if (organization_id !== callerOrgId) {
    return new Response(JSON.stringify({ error: "Access denied: organization_id mismatch" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const template = TEMPLATES[event_type];
  if (!template) {
    return new Response(
      JSON.stringify({ error: `Unsupported event_type: ${event_type}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Determine which roles should be notified ---
  let targetRoles: string[] = [];

  if (event_type === "turnaround_delay") {
    // For turnaround delays, consult notification_settings for the specific
    // turnaround_event_type and station
    const turnaroundEventType = payload["event_type"] as string | undefined;
    const stationId = payload["station_id"] as string | undefined;

    if (!turnaroundEventType) {
      return new Response(
        JSON.stringify({ error: "payload.event_type is required for turnaround_delay notifications" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let settingsQuery = supabase
      .from("notification_settings")
      .select("id, organization_id, event_type, channel, recipient_role, station_id, threshold_minutes, is_active")
      .eq("organization_id", callerOrgId)
      .eq("event_type", turnaroundEventType)
      .eq("is_active", true);

    if (stationId) {
      // Match settings scoped to this station OR global settings (null station_id)
      settingsQuery = settingsQuery.or(`station_id.eq.${stationId},station_id.is.null`);
    }

    const { data: settings, error: settingsError } = await settingsQuery
      .returns<NotificationSettingRow[]>();

    if (settingsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch notification settings", detail: settingsError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    targetRoles = [...new Set((settings ?? []).map((s) => s.recipient_role))];
  } else {
    // Damage report events — use forced roles from the template definition
    targetRoles = template.forced_roles ?? [];
  }

  if (targetRoles.length === 0) {
    return new Response(
      JSON.stringify({
        message: "No active notification settings found for this event. No recipients.",
        event_type,
        organization_id,
        recipients: [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Fetch profiles for the target roles within this organization ---
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, station_id")
    .eq("organization_id", callerOrgId)
    .eq("is_active", true)
    .in("role", targetRoles)
    .returns<ProfileRow[]>();

  if (profilesError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch recipient profiles", detail: profilesError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Deduplicate by email (a profile may match multiple roles)
  const seenEmails = new Set<string>();
  const recipients: NotificationRecipient[] = [];

  for (const profile of profiles ?? []) {
    if (seenEmails.has(profile.email)) continue;
    seenEmails.add(profile.email);
    recipients.push({
      profile_id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      channel: "email", // default channel; expand for in_app if needed
    });
  }

  // --- Build the notification payload ---
  const notificationPayload: NotificationPayload = {
    event_type,
    organization_id: callerOrgId,
    template_key: template.template_key,
    subject: template.subject(payload),
    body_context: template.body_context(payload),
    recipients,
    generated_at: new Date().toISOString(),
  };

  // Return the payload. Actual email delivery is handled by the Integration
  // layer (lib/email/) which consumes this response.
  return new Response(JSON.stringify(notificationPayload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
