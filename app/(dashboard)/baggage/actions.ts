/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import {
  createBaggageCaseSchema,
  type CreateBaggageCaseFormValues,
  updateCaseStatusSchema,
  type UpdateCaseStatusFormValues,
} from "@/lib/validations/baggage";
import type {
  BaggageCase,
  BaggageCaseWithTimeline,
  BaggageTimelineEntry,
} from "./baggage.types";

// =============================================================================
// MOCK DATA — Replace with Supabase queries once baggage_cases table is created
// =============================================================================

const MOCK_CASES: BaggageCase[] = [
  {
    id: "b0a1c2d3-e4f5-6789-abcd-ef0123456789",
    organization_id: "org-001",
    station_id: "stn-yul",
    flight_id: "flt-001",
    flight_number: "AC1234",
    passenger_name: "Jean-Pierre Tremblay",
    passenger_phone: "+1-514-555-0123",
    passenger_email: "jp.tremblay@email.ca",
    pnr: "XKJF7T",
    bag_tag: "AC847291",
    bag_description: "Large black hard-shell Samsonite suitcase with red ribbon",
    bag_color: "Black",
    issue_type: "lost",
    status: "reported",
    delivery_address: null,
    delivery_agent: null,
    estimated_delivery: null,
    actual_delivery: null,
    notes: "Passenger connecting from Paris CDG. Bag did not arrive on carousel.",
    created_at: "2026-03-30T08:15:00Z",
    updated_at: "2026-03-30T08:15:00Z",
  },
  {
    id: "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
    organization_id: "org-001",
    station_id: "stn-yul",
    flight_id: "flt-002",
    flight_number: "WS312",
    passenger_name: "Marie-Claire Gagnon",
    passenger_phone: "+1-438-555-0456",
    passenger_email: "mc.gagnon@email.ca",
    pnr: "RHTM4B",
    bag_tag: "WS503817",
    bag_description: "Medium navy blue soft-side bag with airline priority tag",
    bag_color: "Navy Blue",
    issue_type: "delayed",
    status: "located",
    delivery_address: null,
    delivery_agent: null,
    estimated_delivery: null,
    actual_delivery: null,
    notes: "Bag confirmed still at YYZ. Next available flight WS314 at 14:30.",
    created_at: "2026-03-30T06:45:00Z",
    updated_at: "2026-03-30T09:30:00Z",
  },
  {
    id: "b2a3c4d5-e6f7-8901-abcd-ef2345678901",
    organization_id: "org-001",
    station_id: "stn-yyz",
    flight_id: "flt-003",
    flight_number: "AC891",
    passenger_name: "David Chen-Murray",
    passenger_phone: "+1-416-555-0789",
    passenger_email: "d.chen.murray@email.ca",
    pnr: "BNWK9P",
    bag_tag: "AC192634",
    bag_description: "Small green duffel bag with gym logo, contains sports equipment",
    bag_color: "Green",
    issue_type: "misrouted",
    status: "in_transit",
    delivery_address: "45 King Street W, Toronto, ON M5H 1J8",
    delivery_agent: null,
    estimated_delivery: "2026-03-30T16:00:00Z",
    actual_delivery: null,
    notes: "Bag routed to YVR by mistake. Re-tagged and on AC891 returning to YYZ.",
    created_at: "2026-03-29T22:10:00Z",
    updated_at: "2026-03-30T10:00:00Z",
  },
  {
    id: "b3a4c5d6-e7f8-9012-abcd-ef3456789012",
    organization_id: "org-001",
    station_id: "stn-yow",
    flight_id: "flt-004",
    flight_number: "PD208",
    passenger_name: "Sarah MacPherson",
    passenger_phone: "+1-613-555-0321",
    passenger_email: "s.macpherson@email.ca",
    pnr: "GLPT6W",
    bag_tag: "PD087542",
    bag_description: "Large red suitcase with Canadian flag sticker, fragile tag",
    bag_color: "Red",
    issue_type: "damaged",
    status: "out_for_delivery",
    delivery_address: "220 Laurier Ave E, Ottawa, ON K1N 6P1",
    delivery_agent: "Pierre Lavoie",
    estimated_delivery: "2026-03-30T14:00:00Z",
    actual_delivery: null,
    notes: "Handle broken and side panel cracked. Damage documented. Delivering with claim form.",
    created_at: "2026-03-29T18:30:00Z",
    updated_at: "2026-03-30T11:45:00Z",
  },
  {
    id: "b4a5c6d7-e8f9-0123-abcd-ef4567890123",
    organization_id: "org-001",
    station_id: "stn-yul",
    flight_id: "flt-005",
    flight_number: "AC445",
    passenger_name: "Robert Bouchard",
    passenger_phone: "+1-450-555-0654",
    passenger_email: "r.bouchard@email.ca",
    pnr: "NMSC2X",
    bag_tag: "AC667321",
    bag_description: "Medium grey rolling suitcase, Travelpro brand",
    bag_color: "Grey",
    issue_type: "delayed",
    status: "delivered",
    delivery_address: "1200 Rue Saint-Jacques, Montreal, QC H3C 1G3",
    delivery_agent: "Alain Deschamps",
    estimated_delivery: "2026-03-30T09:00:00Z",
    actual_delivery: "2026-03-30T08:45:00Z",
    notes: "Bag arrived on next flight. Delivered ahead of schedule.",
    created_at: "2026-03-29T15:20:00Z",
    updated_at: "2026-03-30T08:45:00Z",
  },
  {
    id: "b5a6c7d8-e9f0-1234-abcd-ef5678901234",
    organization_id: "org-001",
    station_id: "stn-yyz",
    flight_id: "flt-006",
    flight_number: "WS118",
    passenger_name: "Aisha Patel-Singh",
    passenger_phone: "+1-905-555-0987",
    passenger_email: "a.patel.singh@email.ca",
    pnr: "DQVR8J",
    bag_tag: "WS441098",
    bag_description: "Large purple hard-shell suitcase, Rimowa, has TSA lock",
    bag_color: "Purple",
    issue_type: "lost",
    status: "located",
    delivery_address: null,
    delivery_agent: null,
    estimated_delivery: null,
    actual_delivery: null,
    notes: "Bag found in Calgary unclaimed. Arranging transfer to YYZ on next WS flight.",
    created_at: "2026-03-28T20:00:00Z",
    updated_at: "2026-03-30T07:20:00Z",
  },
  {
    id: "b6a7c8d9-e0f1-2345-abcd-ef6789012345",
    organization_id: "org-001",
    station_id: "stn-yow",
    flight_id: "flt-007",
    flight_number: "AC202",
    passenger_name: "Thomas Okafor-Lévesque",
    passenger_phone: "+1-613-555-0147",
    passenger_email: "t.okafor@email.ca",
    pnr: "YWXN3F",
    bag_tag: "AC558743",
    bag_description: "Black backpack, Osprey brand, 65L, hiking gear inside",
    bag_color: "Black",
    issue_type: "delayed",
    status: "closed",
    delivery_address: "88 Wellington St, Ottawa, ON K1A 0A4",
    delivery_agent: "Claire Bergeron",
    estimated_delivery: "2026-03-29T18:00:00Z",
    actual_delivery: "2026-03-29T17:30:00Z",
    notes: "Case resolved. Bag delivered successfully. Passenger confirmed receipt.",
    created_at: "2026-03-29T10:00:00Z",
    updated_at: "2026-03-29T19:00:00Z",
  },
  {
    id: "b7a8c9d0-e1f2-3456-abcd-ef7890123456",
    organization_id: "org-001",
    station_id: "stn-yul",
    flight_id: "flt-008",
    flight_number: "PD417",
    passenger_name: "Émilie Fortin-Roy",
    passenger_phone: "+1-581-555-0258",
    passenger_email: "e.fortin.roy@email.ca",
    pnr: "KCMJ5V",
    bag_tag: "PD329104",
    bag_description: "Small pink carry-on sized bag, Herschel brand, with polka dots",
    bag_color: "Pink",
    issue_type: "misrouted",
    status: "reported",
    delivery_address: null,
    delivery_agent: null,
    estimated_delivery: null,
    actual_delivery: null,
    notes: "Passenger checked bag for Quebec City but it was tagged to Halifax. Investigating.",
    created_at: "2026-03-30T10:30:00Z",
    updated_at: "2026-03-30T10:30:00Z",
  },
];

const MOCK_TIMELINES: Record<string, BaggageTimelineEntry[]> = {
  "b0a1c2d3-e4f5-6789-abcd-ef0123456789": [
    {
      status: "reported",
      timestamp: "2026-03-30T08:15:00Z",
      note: "Passenger filed missing bag report at YUL carousel area.",
      changed_by: "Agent Marie Dupont",
    },
  ],
  "b1a2c3d4-e5f6-7890-abcd-ef1234567890": [
    {
      status: "reported",
      timestamp: "2026-03-30T06:45:00Z",
      note: "Bag not on carousel. Passenger filed report.",
      changed_by: "Agent Marc Bélanger",
    },
    {
      status: "located",
      timestamp: "2026-03-30T09:30:00Z",
      note: "Bag confirmed at YYZ. Missed connection belt transfer.",
      changed_by: "Agent Sarah Kim",
    },
  ],
  "b2a3c4d5-e6f7-8901-abcd-ef2345678901": [
    {
      status: "reported",
      timestamp: "2026-03-29T22:10:00Z",
      note: "Bag did not arrive. Passenger claims it was checked in at YYZ.",
      changed_by: "Agent Paul Nguyen",
    },
    {
      status: "located",
      timestamp: "2026-03-30T06:00:00Z",
      note: "WorldTracer match: bag at YVR. Routing tag error.",
      changed_by: "System",
    },
    {
      status: "in_transit",
      timestamp: "2026-03-30T10:00:00Z",
      note: "Bag loaded on AC891 YVR-YYZ. ETA 16:00 local.",
      changed_by: "Agent Lisa Thompson",
    },
  ],
  "b3a4c5d6-e7f8-9012-abcd-ef3456789012": [
    {
      status: "reported",
      timestamp: "2026-03-29T18:30:00Z",
      note: "Passenger reported broken handle and cracked panel upon arrival.",
      changed_by: "Agent James Wilson",
    },
    {
      status: "located",
      timestamp: "2026-03-29T18:45:00Z",
      note: "Bag physically present. Damage documented with photos.",
      changed_by: "Agent James Wilson",
    },
    {
      status: "in_transit",
      timestamp: "2026-03-30T09:00:00Z",
      note: "Damage claim form prepared. Bag with courier.",
      changed_by: "Supervisor Anne Tremblay",
    },
    {
      status: "out_for_delivery",
      timestamp: "2026-03-30T11:45:00Z",
      note: "Pierre Lavoie en route to delivery address with bag and claim papers.",
      changed_by: "Agent James Wilson",
    },
  ],
  "b4a5c6d7-e8f9-0123-abcd-ef4567890123": [
    {
      status: "reported",
      timestamp: "2026-03-29T15:20:00Z",
      note: "Bag delayed from YYZ connection.",
      changed_by: "Agent Sophie Morin",
    },
    {
      status: "located",
      timestamp: "2026-03-29T17:00:00Z",
      note: "Bag at YYZ. On next AC445 flight.",
      changed_by: "System",
    },
    {
      status: "in_transit",
      timestamp: "2026-03-29T20:00:00Z",
      note: "Bag on AC445.",
      changed_by: "Agent Sophie Morin",
    },
    {
      status: "out_for_delivery",
      timestamp: "2026-03-30T07:30:00Z",
      note: "Courier dispatched. Alain Deschamps assigned.",
      changed_by: "Agent Sophie Morin",
    },
    {
      status: "delivered",
      timestamp: "2026-03-30T08:45:00Z",
      note: "Delivered to passenger. Signed confirmation received.",
      changed_by: "Agent Alain Deschamps",
    },
  ],
  "b5a6c7d8-e9f0-1234-abcd-ef5678901234": [
    {
      status: "reported",
      timestamp: "2026-03-28T20:00:00Z",
      note: "Bag missing after WS118 from YYC. Possible misconnection.",
      changed_by: "Agent Kevin Park",
    },
    {
      status: "located",
      timestamp: "2026-03-30T07:20:00Z",
      note: "Bag found unclaimed at YYC baggage services. Arranging transfer.",
      changed_by: "Agent Priya Sharma",
    },
  ],
  "b6a7c8d9-e0f1-2345-abcd-ef6789012345": [
    {
      status: "reported",
      timestamp: "2026-03-29T10:00:00Z",
      note: "Hiking backpack delayed from YUL.",
      changed_by: "Agent Claire Bergeron",
    },
    {
      status: "located",
      timestamp: "2026-03-29T12:30:00Z",
      note: "Found at YUL oversized baggage area.",
      changed_by: "System",
    },
    {
      status: "in_transit",
      timestamp: "2026-03-29T14:00:00Z",
      note: "On AC202 YUL-YOW.",
      changed_by: "Agent Claire Bergeron",
    },
    {
      status: "out_for_delivery",
      timestamp: "2026-03-29T16:00:00Z",
      note: "Courier dispatched.",
      changed_by: "Agent Claire Bergeron",
    },
    {
      status: "delivered",
      timestamp: "2026-03-29T17:30:00Z",
      note: "Delivered. Passenger signed.",
      changed_by: "Agent Claire Bergeron",
    },
    {
      status: "closed",
      timestamp: "2026-03-29T19:00:00Z",
      note: "Passenger confirmed receipt. Case closed.",
      changed_by: "Supervisor Anne Tremblay",
    },
  ],
  "b7a8c9d0-e1f2-3456-abcd-ef7890123456": [
    {
      status: "reported",
      timestamp: "2026-03-30T10:30:00Z",
      note: "Bag tagged to YHZ instead of YQB. Passenger at YQB without bag.",
      changed_by: "Agent Marc Bélanger",
    },
  ],
};

// =============================================================================
// Server Actions
// =============================================================================

export async function actionGetBaggageCases(filters?: {
  status?: string;
  search?: string;
}): Promise<{ data: BaggageCase[]; error?: string }> {
  // In production, this would use Supabase with auth context
  // const ctx = await getAuthContext();
  // if ("error" in ctx) return { error: ctx.error, data: [] };

  let cases = [...MOCK_CASES];

  if (filters?.status && filters.status !== "all") {
    cases = cases.filter((c) => c.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    cases = cases.filter(
      (c) =>
        c.passenger_name.toLowerCase().includes(search) ||
        c.pnr.toLowerCase().includes(search) ||
        c.bag_tag.toLowerCase().includes(search) ||
        c.flight_number.toLowerCase().includes(search)
    );
  }

  return { data: cases };
}

export async function actionGetBaggageCaseDetail(
  caseId: string
): Promise<{ data?: BaggageCaseWithTimeline; error?: string }> {
  const found = MOCK_CASES.find((c) => c.id === caseId);

  if (!found) {
    return { error: "Case not found" };
  }

  const timeline = MOCK_TIMELINES[caseId] ?? [];

  return {
    data: {
      ...found,
      timeline,
    },
  };
}

export async function actionCreateBaggageCase(
  data: CreateBaggageCaseFormValues
): Promise<{ success?: boolean; error?: string; data?: BaggageCase }> {
  const parsed = createBaggageCaseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // In production: insert into baggage_cases via Supabase
  // const ctx = await getAuthContext();
  // if ("error" in ctx) return { error: ctx.error };

  const newCase: BaggageCase = {
    id: crypto.randomUUID(),
    organization_id: "org-001",
    station_id: "stn-yul",
    flight_id: "flt-new",
    flight_number: parsed.data.flightNumber,
    passenger_name: parsed.data.passengerName,
    passenger_phone: parsed.data.passengerPhone,
    passenger_email: parsed.data.passengerEmail,
    pnr: parsed.data.pnr,
    bag_tag: parsed.data.bagTag,
    bag_description: parsed.data.bagDescription,
    bag_color: parsed.data.bagColor,
    issue_type: parsed.data.issueType,
    status: "reported",
    delivery_address: null,
    delivery_agent: null,
    estimated_delivery: null,
    actual_delivery: null,
    notes: parsed.data.notes ?? "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  revalidatePath("/baggage");
  return { success: true, data: newCase };
}

export async function actionUpdateCaseStatus(
  data: UpdateCaseStatusFormValues
): Promise<{ success?: boolean; error?: string }> {
  const parsed = updateCaseStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // In production: update baggage_cases via Supabase
  // Validate status progression, update delivery fields, etc.

  revalidatePath(`/baggage/${parsed.data.caseId}`);
  revalidatePath("/baggage");
  return { success: true };
}
