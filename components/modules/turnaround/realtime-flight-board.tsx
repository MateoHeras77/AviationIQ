"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { actionGetFlights } from "@/app/(dashboard)/turnaround/actions";
import type { Flight, FlightStatus } from "@/app/(dashboard)/turnaround/turnaround.types";
import { FLIGHT_STATUS_VARIANT } from "@/app/(dashboard)/turnaround/turnaround.types";
import { FlightCard } from "./flight-card";
import { FlightForm } from "./flight-form";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plane,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Timer,
} from "lucide-react";

interface RealtimeFlightBoardProps {
  initialFlights: Flight[];
}

const TOTAL_EVENTS = 12;

const STATUS_FILTERS: Array<{
  value: string;
  label: string;
  variant: "success" | "warning" | "danger" | "neutral" | "info";
}> = [
  { value: "all", label: "All", variant: "neutral" },
  { value: "scheduled", label: "Scheduled", variant: "info" },
  { value: "on_track", label: "On Track", variant: "success" },
  { value: "at_risk", label: "At Risk", variant: "warning" },
  { value: "delayed", label: "Delayed", variant: "danger" },
  { value: "completed", label: "Completed", variant: "neutral" },
];

const STATUS_ROW_BG: Record<FlightStatus, string> = {
  scheduled: "",
  on_track: "bg-green-50/50",
  at_risk: "bg-yellow-50/50",
  delayed: "bg-red-50/40",
  completed: "bg-gray-50/50",
  cancelled: "bg-gray-50/30",
};

const STATUS_ROW_BORDER: Record<FlightStatus, string> = {
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

function getTimeElapsed(dateStr: string | null | undefined): string | null {
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

export function RealtimeFlightBoard({
  initialFlights,
}: RealtimeFlightBoardProps) {
  const [flights, setFlights] = useState<Flight[]>(initialFlights);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const total = flights.length;
    const onTrack = flights.filter((f) => f.status === "on_track").length;
    const atRisk = flights.filter((f) => f.status === "at_risk").length;
    const delayed = flights.filter((f) => f.status === "delayed").length;
    return { total, onTrack, atRisk, delayed };
  }, [flights]);

  const refreshFlights = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await actionGetFlights({
        status: statusFilter,
        search: searchQuery,
      });
      // Only update if we got actual data — don't reset to empty on RLS/auth errors
      if (result.data && result.data.length > 0) {
        setFlights(result.data);
      } else if (result.data && !result.error) {
        setFlights(result.data);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  // Set up Supabase Realtime subscription (once, not on every filter change)
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("flights-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "flights",
        },
        () => {
          refreshFlights();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "turnaround_events",
        },
        () => {
          refreshFlights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when filters change
  useEffect(() => {
    refreshFlights();
  }, [statusFilter, refreshFlights]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshFlights();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, refreshFlights]);

  const filteredFlights = flights;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Flight Board"
        description="Real-time turnaround operations"
        action={<FlightForm onSuccess={refreshFlights} />}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Flights</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">On Track</p>
                <p className="text-2xl font-bold text-green-900">{stats.onTrack}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">At Risk</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.atRisk}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-3 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Delayed</p>
                <p className="text-2xl font-bold text-red-900">{stats.delayed}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by flight number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 items-center">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`transition-all ${
                statusFilter === filter.value
                  ? "opacity-100 scale-105"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <StatusBadge
                status={filter.label}
                variant={filter.variant}
                className="cursor-pointer px-3 py-1 text-sm"
              />
            </button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto"
            onClick={refreshFlights}
            disabled={isRefreshing}
            aria-label="Refresh flights"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Flight list */}
      {isRefreshing && flights.length === 0 ? (
        <LoadingSpinner className="py-12" />
      ) : filteredFlights.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No flights found"
          description={
            statusFilter !== "all" || searchQuery
              ? "Try adjusting your filters or search query."
              : "No flights scheduled for today. Create one to get started."
          }
        />
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="grid gap-3 md:hidden">
            {filteredFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>

          {/* Desktop: Enhanced table view */}
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-blue-50/70">
                  <th className="w-1" />
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Flight</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Route</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">STD</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Gate</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Aircraft</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Progress</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Last Activity</th>
                  <th className="text-left p-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((flight) => {
                  const completedEvents = flight.completed_events ?? 0;
                  const progressPercent = (completedEvents / TOTAL_EVENTS) * 100;
                  const lastEventElapsed = getTimeElapsed(flight.last_event_at);

                  return (
                    <tr
                      key={flight.id}
                      className={cn(
                        "border-b cursor-pointer transition-colors hover:bg-blue-50/30",
                        STATUS_ROW_BG[flight.status]
                      )}
                      onClick={() => {
                        window.location.href = `/dashboard/turnaround/${flight.id}`;
                      }}
                    >
                      {/* Status color bar */}
                      <td className={cn("w-1 p-0 border-l-4", STATUS_ROW_BORDER[flight.status])} />

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{flight.flight_number}</span>
                          {flight.aircraft_registration && (
                            <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-200 rounded px-1 py-0.5">
                              {flight.aircraft_registration}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <span className="font-medium">{flight.origin ?? "---"}</span>
                        <Plane className="inline-block h-3 w-3 mx-1 text-blue-400 rotate-90" />
                        <span className="font-medium">{flight.destination ?? "---"}</span>
                      </td>
                      <td className="p-3 text-sm font-mono">
                        {flight.scheduled_departure
                          ? new Date(
                              flight.scheduled_departure
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "--:--"}
                      </td>
                      <td className="p-3">
                        {flight.gate ? (
                          <span className="text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded px-2 py-0.5">
                            {flight.gate}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {flight.aircraft_type_code ?? "-"}
                      </td>
                      {/* Progress bar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
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
                        </div>
                      </td>
                      {/* Last activity */}
                      <td className="p-3">
                        {lastEventElapsed && flight.status !== "completed" && flight.status !== "scheduled" ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            {lastEventElapsed}
                          </span>
                        ) : flight.status === "completed" ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Activity className="h-3 w-3" />
                            Done
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          status={flight.status
                            .split("_")
                            .map(
                              (w) => w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ")}
                          variant={FLIGHT_STATUS_VARIANT[flight.status]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
