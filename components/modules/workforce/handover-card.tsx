"use client";

import type { HandoverLog } from "@/app/(dashboard)/workforce/workforce.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface HandoverCardProps {
  handover: HandoverLog;
}

const SHIFT_LABEL: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

export function HandoverCard({ handover }: HandoverCardProps) {
  const isAcknowledged = handover.status === "acknowledged";

  return (
    <Card className={cn(
      "transition-shadow hover:shadow-md",
      isAcknowledged ? "border-cyan-200/60" : "border-yellow-300"
    )}>
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold shrink-0",
                isAcknowledged
                  ? "bg-cyan-100 text-cyan-800 border-cyan-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              )}
            >
              {isAcknowledged ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {isAcknowledged ? "Acknowledged" : "Pending"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {formatDate(handover.timestamp)} {formatTime(handover.timestamp)}
            </span>
          </div>
        </div>

        {/* Supervisor transition */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
              {SHIFT_LABEL[handover.shift]}
            </Badge>
            <span className="text-sm font-medium">{handover.outgoingSupervisor}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-cyan-500 shrink-0" />
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
              {SHIFT_LABEL[handover.nextShift]}
            </Badge>
            <span className="text-sm font-medium">{handover.incomingSupervisor}</span>
          </div>
        </div>

        {/* Notes */}
        {handover.notes.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Handover Notes</span>
            </div>
            <ul className="space-y-1 pl-5">
              {handover.notes.map((note, idx) => (
                <li key={idx} className="text-sm text-muted-foreground list-disc">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
