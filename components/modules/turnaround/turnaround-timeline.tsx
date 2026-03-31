"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { actionLogTurnaroundEvent } from "@/app/(dashboard)/turnaround/actions";
import {
  TURNAROUND_EVENT_SEQUENCE,
  EVENT_LABELS,
  type TurnaroundEvent,
} from "@/app/(dashboard)/turnaround/turnaround.types";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Loader2,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TurnaroundTimelineProps {
  flightId: string;
  events: TurnaroundEvent[];
  flightStatus: string;
}

const TOTAL_STEPS = TURNAROUND_EVENT_SEQUENCE.length;

/** Target durations in minutes for SLA compliance per event step */
const SLA_TARGETS_MINUTES: Partial<Record<string, number>> = {
  door_open: 3,
  deplaning_start: 5,
  deplaning_end: 15,
  cleaning_start: 2,
  cleaning_end: 20,
  catering_confirmed: 10,
  fueling_confirmed: 15,
  boarding_start: 5,
  boarding_end: 20,
  door_close: 5,
  pushback: 5,
};

/** SLA warning threshold as a fraction of target (show yellow at 80%) */
const SLA_WARNING_RATIO = 0.8;

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getDurationMs(current: string, previous: string): number {
  return new Date(current).getTime() - new Date(previous).getTime();
}

function formatDurationShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

type SlaStatus = "compliant" | "at_risk" | "breached" | "none";

function getSlaStatus(eventType: string, durationMs: number): SlaStatus {
  const targetMinutes = SLA_TARGETS_MINUTES[eventType];
  if (!targetMinutes) return "none";
  const targetMs = targetMinutes * 60000;
  if (durationMs > targetMs) return "breached";
  if (durationMs > targetMs * SLA_WARNING_RATIO) return "at_risk";
  return "compliant";
}

const SLA_DOT_COLORS: Record<SlaStatus, string> = {
  compliant: "bg-green-500",
  at_risk: "bg-yellow-500",
  breached: "bg-red-500",
  none: "",
};

export function TurnaroundTimeline({
  flightId,
  events,
  flightStatus,
}: TurnaroundTimelineProps) {
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const completedEventTypes = new Set(events.map((e) => e.event_type));
  const eventMap = new Map(events.map((e) => [e.event_type, e]));

  // Find the next event to log
  const nextEventIndex = TURNAROUND_EVENT_SEQUENCE.findIndex(
    (eventType) => !completedEventTypes.has(eventType)
  );
  const nextEventType =
    nextEventIndex >= 0 ? TURNAROUND_EVENT_SEQUENCE[nextEventIndex] : null;
  const isComplete = nextEventType === null;
  const isFlightActive = flightStatus !== "completed" && flightStatus !== "cancelled";

  const completedCount = events.length;
  const progressPercent = (completedCount / TOTAL_STEPS) * 100;

  async function handleLogEvent() {
    if (!nextEventType) return;
    setIsLogging(true);
    try {
      const result = await actionLogTurnaroundEvent({
        flightId,
        eventType: nextEventType,
        notes: notes.trim() || undefined,
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Event Logged",
          description: `${EVENT_LABELS[nextEventType]} has been recorded.`,
        });
        setNotes("");
        setShowNotes(false);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to log event.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Horizontal progress bar */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-800">
              Turnaround Progress
            </span>
            <span className="text-sm font-bold text-blue-700">
              {completedCount} of {TOTAL_STEPS} steps
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: isComplete
                  ? "#22c55e"
                  : `linear-gradient(90deg, #22c55e 0%, #3b82f6 100%)`,
              }}
            />
          </div>
          {/* Step markers */}
          <div className="flex justify-between mt-1.5">
            {TURNAROUND_EVENT_SEQUENCE.map((eventType) => {
              const isDone = completedEventTypes.has(eventType);
              const isNext = eventType === nextEventType;
              return (
                <div
                  key={eventType}
                  className="flex flex-col items-center"
                  title={EVENT_LABELS[eventType]}
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      isDone
                        ? "bg-green-500"
                        : isNext
                        ? "bg-blue-500 animate-pulse"
                        : "bg-gray-300"
                    )}
                  />
                  {/* Show abbreviated labels only on large screens */}
                  <span className="hidden lg:block text-[9px] text-muted-foreground mt-0.5 max-w-[60px] truncate text-center">
                    {EVENT_LABELS[eventType].split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Log next event button */}
      {nextEventType && isFlightActive && (
        <Card className="border-blue-300 bg-blue-50/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Next Event
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {EVENT_LABELS[nextEventType]}
                </p>
              </div>
              <Button
                onClick={handleLogEvent}
                disabled={isLogging}
                size="lg"
                className="min-h-[48px] min-w-[48px] bg-blue-600 hover:bg-blue-700"
              >
                {isLogging ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="mr-2 h-5 w-5" />
                )}
                Log Event
              </Button>
            </div>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-blue-600/70 flex items-center gap-1 hover:text-blue-700 transition-colors"
            >
              Add notes
              {showNotes ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {showNotes && (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for this event..."
                rows={2}
                className="text-sm"
              />
            )}
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">
                All turnaround events have been completed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {TURNAROUND_EVENT_SEQUENCE.map((eventType, index) => {
          const event = eventMap.get(eventType);
          const isCompleted = completedEventTypes.has(eventType);
          const isNext = eventType === nextEventType;
          const previousEvent =
            index > 0
              ? eventMap.get(TURNAROUND_EVENT_SEQUENCE[index - 1])
              : null;

          // Calculate SLA status for completed events
          let slaStatus: SlaStatus = "none";
          if (isCompleted && event && previousEvent) {
            const durationMs = getDurationMs(event.logged_at, previousEvent.logged_at);
            slaStatus = getSlaStatus(eventType, durationMs);
          }

          return (
            <div key={eventType} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Timeline line with gradient */}
              {index < TURNAROUND_EVENT_SEQUENCE.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[15px] top-8 w-0.5 h-full",
                    isCompleted ? "bg-green-400" : "bg-gray-200"
                  )}
                  style={
                    isCompleted && !completedEventTypes.has(TURNAROUND_EVENT_SEQUENCE[index + 1])
                      ? {
                          background: "linear-gradient(to bottom, #4ade80, #d1d5db)",
                        }
                      : undefined
                  }
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : isNext ? (
                  <PlayCircle className="h-8 w-8 text-blue-500 animate-pulse" />
                ) : (
                  <Circle className="h-8 w-8 text-muted-foreground/30" />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "flex-1 min-w-0 pb-2",
                  !isCompleted && !isNext && "opacity-40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "font-medium",
                          isNext && "text-blue-600 font-bold",
                          isCompleted && "text-foreground"
                        )}
                      >
                        {EVENT_LABELS[eventType]}
                      </p>
                      {/* SLA dot indicator */}
                      {slaStatus !== "none" && (
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full flex-shrink-0",
                            SLA_DOT_COLORS[slaStatus]
                          )}
                          title={
                            slaStatus === "compliant"
                              ? "SLA compliant"
                              : slaStatus === "at_risk"
                              ? "SLA at risk"
                              : "SLA breached"
                          }
                        />
                      )}
                    </div>
                    {isCompleted && event && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(event.logged_at)}
                        </span>
                        {event.logged_by_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.logged_by_name}
                          </span>
                        )}
                        {previousEvent && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-medium rounded px-1.5 py-0.5",
                              slaStatus === "breached"
                                ? "bg-red-50 text-red-700"
                                : slaStatus === "at_risk"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-blue-50 text-blue-600"
                            )}
                          >
                            <Timer className="h-3 w-3" />
                            {formatDurationShort(getDurationMs(event.logged_at, previousEvent.logged_at))}
                          </span>
                        )}
                      </div>
                    )}
                    {event?.notes && (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        {event.notes}
                      </p>
                    )}
                  </div>

                  {isCompleted && event && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Step {index + 1}/{TOTAL_STEPS}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
