import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportParams {
  organization_id: string;
  flight_id?: string;
  date_from?: string;
  date_to?: string;
}

interface FlightRow {
  id: string;
  organization_id: string;
  flight_number: string;
  origin: string | null;
  destination: string | null;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  actual_arrival: string | null;
  actual_departure: string | null;
  status: string;
  gate: string | null;
  aircraft_registration: string | null;
  airline_clients: { name: string; code: string } | null;
  aircraft_types: { name: string; code: string } | null;
  stations: { airport_code: string; city: string } | null;
}

interface EventRow {
  id: string;
  flight_id: string;
  event_type: string;
  event_sequence: number;
  logged_at: string;
  planned_time: string | null;
  notes: string | null;
  profiles: { full_name: string } | null;
}

interface AlertRow {
  id: string;
  flight_id: string;
  event_type: string | null;
  alert_message: string;
  is_read: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

interface SlaRecordRow {
  id: string;
  flight_id: string;
  turnaround_event_id: string;
  expected_duration_min: number;
  actual_duration_min: number | null;
  compliance_status: string;
  calculated_at: string;
}

interface FlightReport {
  flight: FlightRow;
  turnaround_events: EventRow[];
  sla_compliance: SlaRecordRow[];
  alerts: AlertRow[];
}

interface Report {
  generated_at: string;
  organization_id: string;
  parameters: ReportParams;
  summary: {
    total_flights: number;
    compliant_flights: number;
    breached_flights: number;
    at_risk_flights: number;
    total_alerts: number;
  };
  flights: FlightReport[];
}

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
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Decode JWT claims
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
  let params: ReportParams;
  try {
    params = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Enforce tenant isolation — caller can only generate reports for their org
  if (params.organization_id !== callerOrgId) {
    return new Response(JSON.stringify({ error: "Access denied: organization_id mismatch" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!params.flight_id && !params.date_from) {
    return new Response(
      JSON.stringify({ error: "Provide either flight_id or date_from (and optionally date_to)" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Build flight query ---
  let flightQuery = supabase
    .from("flights")
    .select(`
      id, organization_id, flight_number, origin, destination,
      scheduled_arrival, scheduled_departure, actual_arrival, actual_departure,
      status, gate, aircraft_registration,
      airline_clients ( name, code ),
      aircraft_types ( name, code ),
      stations ( airport_code, city )
    `)
    .eq("organization_id", callerOrgId);

  if (params.flight_id) {
    flightQuery = flightQuery.eq("id", params.flight_id);
  } else {
    if (params.date_from) {
      flightQuery = flightQuery.gte("scheduled_arrival", params.date_from);
    }
    if (params.date_to) {
      flightQuery = flightQuery.lte("scheduled_arrival", params.date_to);
    }
  }

  const { data: flights, error: flightError } = await flightQuery
    .order("scheduled_arrival", { ascending: true })
    .returns<FlightRow[]>();

  if (flightError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch flights", detail: flightError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!flights || flights.length === 0) {
    return new Response(JSON.stringify({ error: "No flights found for the given parameters" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const flightIds = flights.map((f) => f.id);

  // --- Fetch turnaround events for all flights in one query ---
  const { data: allEvents, error: eventsError } = await supabase
    .from("turnaround_events")
    .select(`
      id, flight_id, event_type, event_sequence, logged_at, planned_time, notes,
      profiles ( full_name )
    `)
    .in("flight_id", flightIds)
    .order("event_sequence", { ascending: true })
    .returns<EventRow[]>();

  if (eventsError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch turnaround events", detail: eventsError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Fetch SLA compliance records for all flights ---
  const { data: allSlaRecords, error: slaError } = await supabase
    .from("sla_compliance_records")
    .select("id, flight_id, turnaround_event_id, expected_duration_min, actual_duration_min, compliance_status, calculated_at")
    .in("flight_id", flightIds)
    .returns<SlaRecordRow[]>();

  if (slaError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch SLA records", detail: slaError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Fetch alerts for all flights ---
  const { data: allAlerts, error: alertsError } = await supabase
    .from("turnaround_alerts")
    .select("id, flight_id, event_type, alert_message, is_read, acknowledged_at, created_at")
    .in("flight_id", flightIds)
    .order("created_at", { ascending: true })
    .returns<AlertRow[]>();

  if (alertsError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch alerts", detail: alertsError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Group events, SLA records, and alerts by flight_id ---
  const eventsByFlight = new Map<string, EventRow[]>();
  const slaByFlight = new Map<string, SlaRecordRow[]>();
  const alertsByFlight = new Map<string, AlertRow[]>();

  for (const event of allEvents ?? []) {
    const arr = eventsByFlight.get(event.flight_id) ?? [];
    arr.push(event);
    eventsByFlight.set(event.flight_id, arr);
  }

  for (const record of allSlaRecords ?? []) {
    const arr = slaByFlight.get(record.flight_id) ?? [];
    arr.push(record);
    slaByFlight.set(record.flight_id, arr);
  }

  for (const alert of allAlerts ?? []) {
    const arr = alertsByFlight.get(alert.flight_id) ?? [];
    arr.push(alert);
    alertsByFlight.set(alert.flight_id, arr);
  }

  // --- Assemble per-flight reports ---
  const flightReports: FlightReport[] = flights.map((flight) => ({
    flight,
    turnaround_events: eventsByFlight.get(flight.id) ?? [],
    sla_compliance: slaByFlight.get(flight.id) ?? [],
    alerts: alertsByFlight.get(flight.id) ?? [],
  }));

  // --- Summary statistics ---
  let compliantFlights = 0;
  let breachedFlights = 0;
  let atRiskFlights = 0;
  let totalAlerts = 0;

  for (const fr of flightReports) {
    const statuses = fr.sla_compliance.map((r) => r.compliance_status);
    if (statuses.includes("breached")) {
      breachedFlights++;
    } else if (statuses.includes("at_risk")) {
      atRiskFlights++;
    } else if (statuses.length > 0) {
      compliantFlights++;
    }
    totalAlerts += fr.alerts.length;
  }

  const report: Report = {
    generated_at: new Date().toISOString(),
    organization_id: callerOrgId,
    parameters: params,
    summary: {
      total_flights: flights.length,
      compliant_flights: compliantFlights,
      breached_flights: breachedFlights,
      at_risk_flights: atRiskFlights,
      total_alerts: totalAlerts,
    },
    flights: flightReports,
  };

  return new Response(JSON.stringify(report), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
