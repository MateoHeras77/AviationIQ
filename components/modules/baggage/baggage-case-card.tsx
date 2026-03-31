"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import type { BaggageCase } from "@/app/(dashboard)/baggage/baggage.types";
import {
  BAGGAGE_STATUS_LABELS,
  BAGGAGE_STATUS_VARIANT,
  ISSUE_TYPE_LABELS,
  ISSUE_TYPE_COLOR,
  BAGGAGE_STATUS_SEQUENCE,
} from "@/app/(dashboard)/baggage/baggage.types";
import type { BaggageCaseStatus } from "@/app/(dashboard)/baggage/baggage.types";
import { Luggage, User, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaggageCaseCardProps {
  baggageCase: BaggageCase;
}

const STATUS_BORDER_COLOR: Record<BaggageCaseStatus, string> = {
  reported: "border-l-red-500",
  located: "border-l-blue-500",
  in_transit: "border-l-amber-500",
  out_for_delivery: "border-l-violet-500",
  delivered: "border-l-green-500",
  closed: "border-l-gray-400",
};

/**
 * Formats a date string as a relative time (e.g., "2h ago", "3d ago").
 */
function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

/**
 * Returns pipeline progress as a fraction: how many stages completed.
 */
function getPipelineProgress(status: BaggageCaseStatus): {
  current: number;
  total: number;
} {
  const total = BAGGAGE_STATUS_SEQUENCE.length;
  const current = BAGGAGE_STATUS_SEQUENCE.indexOf(status) + 1;
  return { current, total };
}

export function BaggageCaseCard({ baggageCase }: BaggageCaseCardProps) {
  const progress = getPipelineProgress(baggageCase.status);
  const isLost = baggageCase.issue_type === "lost";

  return (
    <Link href={`/baggage/${baggageCase.id}`}>
      <Card
        className={cn(
          "hover:border-indigo-500/50 transition-all cursor-pointer border-l-4",
          STATUS_BORDER_COLOR[baggageCase.status],
          isLost && baggageCase.status === "reported" && "ring-1 ring-red-200"
        )}
      >
        <CardContent className="py-3 px-4 space-y-2.5">
          {/* Header: flight + status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Luggage className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span className="text-base font-bold truncate">
                {baggageCase.flight_number}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 flex-shrink-0",
                  ISSUE_TYPE_COLOR[baggageCase.issue_type]
                )}
              >
                {ISSUE_TYPE_LABELS[baggageCase.issue_type]}
              </Badge>
            </div>
            <StatusBadge
              status={BAGGAGE_STATUS_LABELS[baggageCase.status]}
              variant={BAGGAGE_STATUS_VARIANT[baggageCase.status]}
            />
          </div>

          {/* Passenger + PNR */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-foreground font-medium truncate">
              <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {baggageCase.passenger_name}
            </span>
            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
              {baggageCase.pnr}
            </span>
          </div>

          {/* Bag tag */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Tag className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-mono">{baggageCase.bag_tag}</span>
            <span className="mx-1">-</span>
            <span className="truncate">{baggageCase.bag_color} bag</span>
          </div>

          {/* Pipeline progress + timestamp */}
          <div className="flex items-center justify-between pt-1 border-t border-dashed">
            {/* Mini pipeline indicator */}
            <div
              className="flex items-center gap-0.5"
              aria-label={`Stage ${progress.current} of ${progress.total}`}
            >
              {BAGGAGE_STATUS_SEQUENCE.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === 0 ? "w-4" : "w-3",
                    i < progress.current
                      ? "bg-indigo-500"
                      : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(baggageCase.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
