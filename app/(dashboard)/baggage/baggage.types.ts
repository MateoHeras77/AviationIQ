export type BaggageCaseStatus =
  | "reported"
  | "located"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "closed";

export type BaggageIssueType = "lost" | "damaged" | "delayed" | "misrouted";

export const BAGGAGE_STATUS_LABELS: Record<BaggageCaseStatus, string> = {
  reported: "Reported",
  located: "Located",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  closed: "Closed",
};

export const BAGGAGE_STATUS_VARIANT: Record<
  BaggageCaseStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  reported: "danger",
  located: "info",
  in_transit: "warning",
  out_for_delivery: "warning",
  delivered: "success",
  closed: "neutral",
};

export const ISSUE_TYPE_LABELS: Record<BaggageIssueType, string> = {
  lost: "Lost",
  damaged: "Damaged",
  delayed: "Delayed",
  misrouted: "Misrouted",
};

export const ISSUE_TYPE_VARIANT: Record<
  BaggageIssueType,
  "danger" | "warning" | "info" | "neutral"
> = {
  lost: "danger",
  damaged: "warning",
  delayed: "info",
  misrouted: "neutral",
};

export const ISSUE_TYPE_COLOR: Record<BaggageIssueType, string> = {
  lost: "bg-red-100 text-red-800 border-red-200",
  damaged: "bg-orange-100 text-orange-800 border-orange-200",
  delayed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  misrouted: "bg-purple-100 text-purple-800 border-purple-200",
};

export const BAGGAGE_STATUS_SEQUENCE: BaggageCaseStatus[] = [
  "reported",
  "located",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "closed",
];

export interface BaggageCase {
  id: string;
  organization_id: string;
  station_id: string;
  flight_id: string;
  flight_number: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  pnr: string;
  bag_tag: string;
  bag_description: string;
  bag_color: string;
  issue_type: BaggageIssueType;
  status: BaggageCaseStatus;
  delivery_address: string | null;
  delivery_agent: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BaggageCaseWithTimeline extends BaggageCase {
  timeline: BaggageTimelineEntry[];
}

export interface BaggageTimelineEntry {
  status: BaggageCaseStatus;
  timestamp: string;
  note: string | null;
  changed_by: string;
}
