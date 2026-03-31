"use client";

import { useState } from "react";
import type { ShiftSchedule } from "@/app/(dashboard)/workforce/workforce.types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftTimelineProps {
  shifts: ShiftSchedule[];
}

const SHIFT_COLORS: Record<string, {
  bg: string;
  bar: string;
  barHover: string;
  text: string;
  badge: string;
  light: string;
  avatar: string;
}> = {
  morning: {
    bg: "bg-cyan-50",
    bar: "bg-cyan-500",
    barHover: "hover:bg-cyan-600",
    text: "text-cyan-900",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    light: "bg-cyan-50/50 border-cyan-100",
    avatar: "bg-cyan-100 text-cyan-700",
  },
  afternoon: {
    bg: "bg-teal-50",
    bar: "bg-teal-500",
    barHover: "hover:bg-teal-600",
    text: "text-teal-900",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
    light: "bg-teal-50/50 border-teal-100",
    avatar: "bg-teal-100 text-teal-700",
  },
  night: {
    bg: "bg-slate-100",
    bar: "bg-slate-600",
    barHover: "hover:bg-slate-700",
    text: "text-slate-900",
    badge: "bg-slate-200 text-slate-800 border-slate-300",
    light: "bg-slate-50/50 border-slate-200",
    avatar: "bg-slate-200 text-slate-700",
  },
};

const SHIFT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
};

// Timeline runs from 06:00 to 30:00 (06:00 next day) = 24 hours
const TIMELINE_START = 6;
const TIMELINE_END = 30;
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;

// Hour markers to display
const HOUR_MARKERS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 0, 2, 4, 6];

function formatHour(hour: number): string {
  const h = hour % 24;
  if (h === 0) return "00:00";
  return `${h.toString().padStart(2, "0")}:00`;
}

/** Returns the current hour as a position within the timeline (6-30 range) */
function getCurrentTimelinePosition(): number {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  // Convert current time to timeline position
  if (h >= TIMELINE_START) return h;
  // After midnight, offset to 24+ range
  return h + 24;
}

export function ShiftTimeline({ shifts }: ShiftTimelineProps) {
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const currentPos = getCurrentTimelinePosition();
  const nowPct = ((currentPos - TIMELINE_START) / TIMELINE_HOURS) * 100;

  return (
    <div className="space-y-4">
      {/* Timeline visualization */}
      <Card className="overflow-hidden border-cyan-200/60">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              <h3 className="font-semibold text-sm text-cyan-900">24-Hour Shift Timeline</h3>
            </div>
            <div className="flex gap-2">
              {Object.entries(SHIFT_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 rounded-full", SHIFT_COLORS[key].bar)} />
                  <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline bar area */}
          <div className="relative">
            {/* Hour markers */}
            <div className="flex justify-between px-0 mb-1">
              {HOUR_MARKERS.map((hour, idx) => {
                const timelineHour = idx === 0 ? 6 : 6 + idx * 2;
                const displayHour = timelineHour % 24;
                return (
                  <span
                    key={`marker-${idx}`}
                    className="text-[10px] text-muted-foreground font-mono w-0 text-center"
                  >
                    {formatHour(displayHour)}
                  </span>
                );
              })}
            </div>

            {/* Main timeline bar */}
            <div className="relative h-12 sm:h-14 bg-gray-100 rounded-lg overflow-hidden">
              {/* Shift blocks */}
              {shifts.map((shift) => {
                const leftPct = ((shift.startHour - TIMELINE_START) / TIMELINE_HOURS) * 100;
                const widthPct = ((shift.endHour - shift.startHour) / TIMELINE_HOURS) * 100;
                const colors = SHIFT_COLORS[shift.type];

                return (
                  <button
                    key={shift.id}
                    onClick={() => setExpandedShift(expandedShift === shift.id ? null : shift.id)}
                    className={cn(
                      "absolute top-0 h-full flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer",
                      colors.bar,
                      colors.barHover,
                      "min-h-[44px]"
                    )}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    aria-label={`${SHIFT_LABELS[shift.type]} shift: ${shift.startTime} to ${shift.endTime}, ${shift.staffCount} staff`}
                  >
                    <Users className="h-3.5 w-3.5 text-white/90" />
                    <span className="text-white font-bold text-sm">{shift.staffCount}</span>
                    <span className="text-white/80 text-xs hidden sm:inline ml-1">
                      {SHIFT_LABELS[shift.type]}
                    </span>
                  </button>
                );
              })}

              {/* Current time indicator */}
              {nowPct >= 0 && nowPct <= 100 && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-red-500 z-10 pointer-events-none"
                  style={{ left: `${nowPct}%` }}
                >
                  <div className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow" />
                </div>
              )}
            </div>

            {/* Hour grid lines */}
            <div className="absolute top-6 sm:top-6 left-0 right-0 h-12 sm:h-14 pointer-events-none">
              {HOUR_MARKERS.map((_, idx) => {
                const pct = (idx / (HOUR_MARKERS.length - 1)) * 100;
                return (
                  <div
                    key={`line-${idx}`}
                    className="absolute top-0 h-full border-l border-white/20"
                    style={{ left: `${pct}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Shift detail cards (expandable) */}
          <div className="mt-4 space-y-2">
            {shifts.map((shift) => {
              const colors = SHIFT_COLORS[shift.type];
              const isExpanded = expandedShift === shift.id;

              return (
                <div key={`detail-${shift.id}`} className={cn("rounded-lg border transition-all", colors.light)}>
                  <button
                    onClick={() => setExpandedShift(isExpanded ? null : shift.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 min-h-[44px]",
                      "text-left"
                    )}
                    aria-expanded={isExpanded}
                    aria-label={`Toggle ${SHIFT_LABELS[shift.type]} shift details`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("text-xs font-semibold", colors.badge)}>
                        {SHIFT_LABELS[shift.type]}
                      </Badge>
                      <span className="text-sm font-medium font-mono">
                        {shift.startTime} &ndash; {shift.endTime}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {shift.staffCount} staff assigned
                      </span>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {shift.staff.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-md bg-white/70"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={cn("text-xs font-semibold", colors.avatar)}>
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.role.replace(/_/g, " ")}
                            </p>
                          </div>
                          <StatusDot status={member.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "on_shift"
      ? "bg-green-500"
      : status === "on_break"
      ? "bg-yellow-500"
      : "bg-gray-400";

  const label =
    status === "on_shift"
      ? "On shift"
      : status === "on_break"
      ? "On break"
      : "Off shift";

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <div className={cn("h-2 w-2 rounded-full", color)} />
    </div>
  );
}
