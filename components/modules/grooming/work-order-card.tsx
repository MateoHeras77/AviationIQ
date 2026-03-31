"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { GroomingWorkOrder } from "@/app/(dashboard)/grooming/grooming.types";
import {
  CLEANING_LEVEL_LABELS,
  type CleaningLevel,
} from "@/app/(dashboard)/grooming/grooming.types";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkOrderCardProps {
  workOrder: GroomingWorkOrder;
}

const CLEANING_LEVEL_BAR_COLOR: Record<CleaningLevel, string> = {
  transit_clean: "bg-emerald-400",
  full_clean: "bg-green-500",
  deep_clean: "bg-teal-600",
};

const CLEANING_LEVEL_TAG_STYLES: Record<CleaningLevel, string> = {
  transit_clean: "bg-emerald-100 text-emerald-800 border-emerald-300",
  full_clean: "bg-green-100 text-green-800 border-green-300",
  deep_clean: "bg-teal-100 text-teal-800 border-teal-300",
};

const AGENT_AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-green-600",
  "bg-teal-500",
  "bg-lime-600",
  "bg-emerald-700",
];

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const agentCount = workOrder.assigned_agents_count ?? 0;
  const requiredAgents = workOrder.required_agents;
  const flightParts = [
    workOrder.flight_number ?? "No Flight",
    workOrder.aircraft_type_code,
    workOrder.station_code ? `Gate ${workOrder.station_code}` : null,
  ].filter(Boolean);

  return (
    <Link href={`/dashboard/grooming/${workOrder.id}`}>
      <Card
        className={cn(
          "hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer overflow-hidden",
          "border-green-100"
        )}
      >
        <div className="flex">
          {/* Left color bar based on cleaning level */}
          <div
            className={cn(
              "w-1.5 shrink-0",
              CLEANING_LEVEL_BAR_COLOR[workOrder.cleaning_level]
            )}
          />

          <CardContent className="flex-1 p-3 space-y-2">
            {/* Top row: flight info + status */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-foreground truncate">
                {flightParts.join(" \u00B7 ")}
              </p>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 border",
                  workOrder.status === "pending" &&
                    "bg-gray-100 text-gray-700 border-gray-200",
                  workOrder.status === "in_progress" &&
                    "bg-emerald-100 text-emerald-800 border-emerald-300",
                  workOrder.status === "completed" &&
                    "bg-green-100 text-green-800 border-green-300",
                  workOrder.status === "cancelled" &&
                    "bg-red-100 text-red-700 border-red-200"
                )}
              >
                {formatStatus(workOrder.status)}
              </span>
            </div>

            {/* Cleaning level tag */}
            <div>
              <span
                className={cn(
                  "inline-block text-xs font-semibold px-2.5 py-1 rounded-md border",
                  CLEANING_LEVEL_TAG_STYLES[workOrder.cleaning_level]
                )}
              >
                {CLEANING_LEVEL_LABELS[workOrder.cleaning_level]}
              </span>
            </div>

            {/* Bottom row: duration + agents */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-medium">
                  {workOrder.standard_duration_min} min
                </span>
                {workOrder.actual_duration_min !== null && (
                  <span className="text-emerald-700 font-semibold ml-0.5">
                    ({workOrder.actual_duration_min}m actual)
                  </span>
                )}
              </span>

              {/* Agent avatar circles */}
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1.5">
                  {Array.from({ length: Math.min(agentCount, 5) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-5 w-5 rounded-full border-2 border-white flex items-center justify-center",
                          AGENT_AVATAR_COLORS[i % AGENT_AVATAR_COLORS.length]
                        )}
                      >
                        <Users className="h-2.5 w-2.5 text-white" />
                      </div>
                    )
                  )}
                  {agentCount === 0 && (
                    <div className="h-5 w-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Users className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium ml-1",
                    agentCount >= requiredAgents
                      ? "text-emerald-600"
                      : "text-amber-600"
                  )}
                >
                  {agentCount}/{requiredAgents}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
