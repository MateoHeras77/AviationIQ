"use client";

import type { BaggageTimelineEntry } from "@/app/(dashboard)/baggage/baggage.types";
import type { BaggageCaseStatus } from "@/app/(dashboard)/baggage/baggage.types";
import {
  BAGGAGE_STATUS_LABELS,
} from "@/app/(dashboard)/baggage/baggage.types";
import { cn } from "@/lib/utils";

interface CaseTimelineProps {
  entries: BaggageTimelineEntry[];
}

const STATUS_DOT_COLOR: Record<BaggageCaseStatus, string> = {
  reported: "bg-red-500",
  located: "bg-blue-500",
  in_transit: "bg-amber-500",
  out_for_delivery: "bg-violet-500",
  delivered: "bg-green-500",
  closed: "bg-gray-500",
};

const STATUS_LINE_COLOR: Record<BaggageCaseStatus, string> = {
  reported: "bg-red-200",
  located: "bg-blue-200",
  in_transit: "bg-amber-200",
  out_for_delivery: "bg-violet-200",
  delivered: "bg-green-200",
  closed: "bg-gray-200",
};

function formatTimestamp(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

export function CaseTimeline({ entries }: CaseTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No timeline entries yet.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const { date, time } = formatTimestamp(entry.timestamp);

        return (
          <div key={`${entry.status}-${index}`} className="relative flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-3 w-3 rounded-full flex-shrink-0 z-10 ring-2 ring-background",
                  STATUS_DOT_COLOR[entry.status]
                )}
              />
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[2rem]",
                    STATUS_LINE_COLOR[entry.status]
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-4 -mt-0.5 flex-1 min-w-0", isLast && "pb-0")}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {BAGGAGE_STATUS_LABELS[entry.status]}
                </span>
                <span className="text-[11px] text-muted-foreground flex-shrink-0 font-mono">
                  {date} {time}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                  {entry.note}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                {entry.changed_by}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
