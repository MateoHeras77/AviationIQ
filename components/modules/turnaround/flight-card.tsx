"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import type { Flight, FlightStatus } from "@/app/(dashboard)/turnaround/turnaround.types";
import { FLIGHT_STATUS_VARIANT } from "@/app/(dashboard)/turnaround/turnaround.types";
import { Plane, Clock, MapPin, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightCardProps {
  flight: Flight;
}

const TOTAL_EVENTS = 12;

const STATUS_BORDER_COLOR: Record<FlightStatus, string> = {
  scheduled: "border-l-blue-400",
  on_track: "border-l-green-500",
  at_risk: "border-l-yellow-500",
  delayed: "border-l-red-500",
  completed: "border-l-gray-400",
  cancelled: "border-l-gray-300",
};

const STATUS_PROGRESS_COLOR: Record<FlightStatus, string> = {
  scheduled: "bg-blue-400",
  on_track: "bg-green-500",
  at_risk: "bg-yellow-500",
  delayed: "bg-red-500",
  completed: "bg-gray-400",
  cancelled: "bg-gray-300",
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatStatus(status: FlightStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Returns a human-readable elapsed duration from an ISO timestamp to now */
function getTimeElapsed(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return null;
  const totalMinutes = Math.floor(diff / 60000);
  if (totalMinutes < 1) return "<1m ago";
  if (totalMinutes < 60) return `${totalMinutes}m ago`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m ago`;
}

export function FlightCard({ flight }: FlightCardProps) {
  const completedEvents = flight.completed_events ?? 0;
  const progressPercent = (completedEvents / TOTAL_EVENTS) * 100;
  const lastEventElapsed = getTimeElapsed(flight.last_event_at ?? null);

  return (
    <Link href={`/dashboard/turnaround/${flight.id}`}>
      <Card
        className={cn(
          "relative overflow-hidden border-l-4 hover:shadow-md transition-all cursor-pointer",
          STATUS_BORDER_COLOR[flight.status]
        )}
      >
        <CardContent className="pt-3 pb-2 px-4 space-y-2.5">
          {/* Top row: flight number, registration, status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg font-bold tracking-tight truncate">
                {flight.flight_number}
              </span>
              {flight.aircraft_registration && (
                <span className="inline-flex items-center gap-1 text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 flex-shrink-0">
                  <Plane className="h-3 w-3" />
                  {flight.aircraft_registration}
                </span>
              )}
            </div>
            <StatusBadge
              status={formatStatus(flight.status)}
              variant={FLIGHT_STATUS_VARIANT[flight.status]}
            />
          </div>

          {/* Route and gate */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold">{flight.origin ?? "---"}</span>
              <Plane className="h-3 w-3 text-blue-400 rotate-90" />
              <span className="font-semibold">{flight.destination ?? "---"}</span>
            </div>
            {flight.gate && (
              <span className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded px-2 py-0.5">
                Gate {flight.gate}
              </span>
            )}
          </div>

          {/* Times and info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              STD: {formatTime(flight.scheduled_departure)}
            </span>
            {flight.actual_departure && (
              <span className="font-medium text-foreground">
                ATD: {formatTime(flight.actual_departure)}
              </span>
            )}
            {flight.aircraft_type_code && (
              <span className="text-muted-foreground">{flight.aircraft_type_code}</span>
            )}
            {flight.airline_client_name && (
              <span className="ml-auto text-muted-foreground truncate max-w-[120px]">
                {flight.airline_client_name}
              </span>
            )}
          </div>

          {/* Progress row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  STATUS_PROGRESS_COLOR[flight.status]
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
              {completedEvents}/{TOTAL_EVENTS}
            </span>
            {lastEventElapsed && flight.status !== "completed" && flight.status !== "scheduled" && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
                <Timer className="h-3 w-3" />
                {lastEventElapsed}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
