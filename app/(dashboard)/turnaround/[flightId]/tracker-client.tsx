"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { PageHeader } from "@/components/modules/shared/page-header";
import { TurnaroundTimeline } from "@/components/modules/turnaround/turnaround-timeline";
import type {
  Flight,
  TurnaroundEvent,
} from "@/app/(dashboard)/turnaround/turnaround.types";
import { FLIGHT_STATUS_VARIANT } from "@/app/(dashboard)/turnaround/turnaround.types";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  MapPin,
  Plane,
} from "lucide-react";

interface TurnaroundTrackerClientProps {
  flight: Flight;
  events: TurnaroundEvent[];
  userRole?: string | null;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TurnaroundTrackerClient({
  flight,
  events,
}: TurnaroundTrackerClientProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={`Flight ${flight.flight_number}`}
        description="Turnaround event tracker"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/turnaround">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/turnaround/${flight.id}/events`}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Event Log
              </Link>
            </Button>
          </div>
        }
      />

      {/* Flight info card */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Route */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-blue-900">
                {flight.origin ?? "---"}{" "}
              </span>
              <Plane className="h-3 w-3 text-blue-400 rotate-90" />
              <span className="font-semibold text-blue-900">
                {" "}
                {flight.destination ?? "---"}
              </span>
            </div>

            <StatusBadge
              status={formatStatus(flight.status)}
              variant={FLIGHT_STATUS_VARIANT[flight.status]}
            />

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              STA: {formatTime(flight.scheduled_arrival)} | STD:{" "}
              {formatTime(flight.scheduled_departure)}
            </div>

            {flight.gate && (
              <span className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded px-2 py-1">
                Gate {flight.gate}
              </span>
            )}

            {flight.aircraft_type_code && (
              <span className="text-sm text-muted-foreground">
                {flight.aircraft_type_code}
              </span>
            )}

            {flight.aircraft_registration && (
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-blue-100 text-blue-700 border border-blue-200 rounded px-2 py-1">
                <Plane className="h-3 w-3" />
                {flight.aircraft_registration}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Turnaround Timeline */}
      <TurnaroundTimeline
        flightId={flight.id}
        events={events}
        flightStatus={flight.status}
      />
    </div>
  );
}
