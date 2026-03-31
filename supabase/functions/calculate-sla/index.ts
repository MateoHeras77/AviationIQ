import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TurnaroundEvent {
  id: string;
  flight_id: string;
  event_type: string;
  event_sequence: number;
  logged_at: string;
  planned_time: string | null;
}

interface SlaConfiguration {
  id: string;
  airline_client_id: string;
  event_type: string;
  max_duration_minutes: number;
}

interface Flight {
  id: string;
  organization_id: string;
  airline_client_id: string;
  flight_number: string;
  scheduled_arrival: string | null;
  actual_arrival: string | null;
}

interface SlaEventResult {
  turnaround_event_id: string;
  event_type: string;
  event_sequence: number;
  sla_configuration_id: string | null;
  expected_duration_min: number | null;
  actual_duration_min: number | null;
  status: "compliant" | "breached" | "at_risk" | "no_sla_defined" | "pending";
}

interface SlaComplianceReport {
  flight_id: string;
  flight_number: string;
  organization_id: string;
  airline_client_id: string;
  events: SlaEventResult[];
  overall_status: "compliant" | "breached" | "at_risk" | "pending";
  calculated_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derives actual_duration_min for an event relative to the flight start anchor. */
function calcDurationMinutes(
  anchorTime: string,
  eventTime: string,
): number {
  const anchor = new Date(anchorTime).getTime();
  const event = new Date(eventTime).getTime();
  return Math.round((event - anchor) / 60_000);
}

/** Maps a numeric percentage to an SLA status string. */
function deriveStatus(
  actualMin: number,
  maxMin: number,
): "compliant" | "breached" | "at_risk" {
  if (actualMin > maxMin) return "breached";
  if (actualMin >= maxMin * 0.8) return "at_risk";
  return "compliant";
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- JWT verification & tenant extraction ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or malformed Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Use the caller's JWT so RLS applies automatically
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Decode JWT claims to get organization_id (without trusting the payload —
  // Supabase validates the signature server-side via RLS).
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
  let body: { flight_id: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { flight_id } = body;
  if (!flight_id) {
    return new Response(JSON.stringify({ error: "flight_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Fetch flight (RLS enforces tenant isolation) ---
  const { data: flight, error: flightError } = await supabase
    .from("flights")
    .select("id, organization_id, airline_client_id, flight_number, scheduled_arrival, actual_arrival")
    .eq("id", flight_id)
    .single<Flight>();

  if (flightError || !flight) {
    return new Response(
      JSON.stringify({ error: "Flight not found or access denied", detail: flightError?.message }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Explicit tenant check — belt-and-suspenders on top of RLS
  if (flight.organization_id !== callerOrgId) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Fetch turnaround events for this flight ---
  const { data: events, error: eventsError } = await supabase
    .from("turnaround_events")
    .select("id, flight_id, event_type, event_sequence, logged_at, planned_time")
    .eq("flight_id", flight_id)
    .order("event_sequence", { ascending: true })
    .returns<TurnaroundEvent[]>();

  if (eventsError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch turnaround events", detail: eventsError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Fetch SLA configurations for this airline client ---
  const { data: slaConfigs, error: slaError } = await supabase
    .from("sla_configurations")
    .select("id, airline_client_id, event_type, max_duration_minutes")
    .eq("organization_id", callerOrgId)
    .eq("airline_client_id", flight.airline_client_id)
    .returns<SlaConfiguration[]>();

  if (slaError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch SLA configurations", detail: slaError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Build a quick lookup by event_type
  const slaByEventType = new Map<string, SlaConfiguration>();
  for (const config of slaConfigs ?? []) {
    slaByEventType.set(config.event_type, config);
  }

  // The anchor time is actual_arrival if set, otherwise scheduled_arrival
  const anchorTime = flight.actual_arrival ?? flight.scheduled_arrival;

  // --- Calculate compliance per event ---
  const eventResults: SlaEventResult[] = [];

  for (const event of events ?? []) {
    const slaConfig = slaByEventType.get(event.event_type);

    if (!slaConfig) {
      eventResults.push({
        turnaround_event_id: event.id,
        event_type: event.event_type,
        event_sequence: event.event_sequence,
        sla_configuration_id: null,
        expected_duration_min: null,
        actual_duration_min: null,
        status: "no_sla_defined",
      });
      continue;
    }

    if (!anchorTime) {
      eventResults.push({
        turnaround_event_id: event.id,
        event_type: event.event_type,
        event_sequence: event.event_sequence,
        sla_configuration_id: slaConfig.id,
        expected_duration_min: slaConfig.max_duration_minutes,
        actual_duration_min: null,
        status: "pending",
      });
      continue;
    }

    const actualMin = calcDurationMinutes(anchorTime, event.logged_at);
    const status = deriveStatus(actualMin, slaConfig.max_duration_minutes);

    eventResults.push({
      turnaround_event_id: event.id,
      event_type: event.event_type,
      event_sequence: event.event_sequence,
      sla_configuration_id: slaConfig.id,
      expected_duration_min: slaConfig.max_duration_minutes,
      actual_duration_min: actualMin,
      status,
    });
  }

  // --- Derive overall status ---
  const statusPriority = { breached: 3, at_risk: 2, compliant: 1, pending: 0, no_sla_defined: 0 } as const;
  type StatusKey = keyof typeof statusPriority;

  const overallStatus = eventResults.reduce<"compliant" | "breached" | "at_risk" | "pending">(
    (worst, r) => {
      const rPriority = statusPriority[r.status as StatusKey] ?? 0;
      const wPriority = statusPriority[worst as StatusKey] ?? 0;
      return rPriority > wPriority ? (r.status as "compliant" | "breached" | "at_risk" | "pending") : worst;
    },
    "compliant",
  );

  const report: SlaComplianceReport = {
    flight_id: flight.id,
    flight_number: flight.flight_number,
    organization_id: flight.organization_id,
    airline_client_id: flight.airline_client_id,
    events: eventResults,
    overall_status: overallStatus,
    calculated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(report), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
