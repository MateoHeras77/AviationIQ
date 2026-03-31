"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import type { DamageReport } from "@/app/(dashboard)/damage/damage.types";
import {
  DAMAGE_STATUS_LABELS,
  DAMAGE_STATUS_VARIANT,
  SEVERITY_LABELS,
} from "@/app/(dashboard)/damage/damage.types";
import type { DamageSeverity, DamageReportStatus } from "@/app/(dashboard)/damage/damage.types";
import { MapPin, User, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface DamageReportCardProps {
  report: DamageReport;
}

const SEVERITY_BORDER_COLOR: Record<DamageSeverity, string> = {
  minor: "border-l-slate-400",
  moderate: "border-l-amber-400",
  major: "border-l-orange-500",
  critical: "border-l-red-600",
};

const SEVERITY_DOT_COLOR: Record<DamageSeverity, string> = {
  minor: "bg-slate-400",
  moderate: "bg-amber-400",
  major: "bg-orange-500",
  critical: "bg-red-600",
};

/**
 * Returns the current approval step (1-indexed) and total steps for the approval chain.
 * Steps: 1=Reported, 2=Submitted, 3=Supervisor Reviewed, 4=Manager Approved
 */
function getApprovalProgress(status: DamageReportStatus): {
  current: number;
  total: number;
} {
  const total = 4;
  switch (status) {
    case "draft":
      return { current: 1, total };
    case "submitted":
      return { current: 2, total };
    case "supervisor_reviewed":
      return { current: 3, total };
    case "approved":
      return { current: 4, total };
    case "rejected":
      return { current: 0, total }; // special case
    default:
      return { current: 1, total };
  }
}

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

export function DamageReportCard({ report }: DamageReportCardProps) {
  const approvalProgress = getApprovalProgress(report.status);
  const isCritical = report.severity === "critical";

  return (
    <Link href={`/damage/${report.id}`}>
      <Card
        className={cn(
          "hover:border-amber-500/50 transition-all cursor-pointer border-l-4",
          SEVERITY_BORDER_COLOR[report.severity],
          isCritical && "ring-1 ring-red-200"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Plane className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <CardTitle className="text-base font-bold truncate">
                {report.flight_number ?? "No Flight"}
              </CardTitle>
            </div>
            <StatusBadge
              status={DAMAGE_STATUS_LABELS[report.status]}
              variant={DAMAGE_STATUS_VARIANT[report.status]}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {/* Severity with colored dot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full flex-shrink-0",
                  SEVERITY_DOT_COLOR[report.severity],
                  isCritical && "animate-pulse shadow-[0_0_6px_2px_rgba(220,38,38,0.4)]"
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  report.severity === "critical" && "text-red-600",
                  report.severity === "major" && "text-orange-600",
                  report.severity === "moderate" && "text-amber-600",
                  report.severity === "minor" && "text-slate-500"
                )}
              >
                {SEVERITY_LABELS[report.severity]}
              </span>
            </div>

            {/* Approval chain mini stepper */}
            {report.status !== "rejected" ? (
              <div className="flex items-center gap-1" aria-label={`Step ${approvalProgress.current} of ${approvalProgress.total}`}>
                <span className="text-[10px] text-muted-foreground mr-1">
                  {approvalProgress.current}/{approvalProgress.total}
                </span>
                {Array.from({ length: approvalProgress.total }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full border",
                      i < approvalProgress.current
                        ? "bg-amber-500 border-amber-500"
                        : "bg-transparent border-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs font-medium text-red-600">Rejected</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{report.damage_location}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-dashed">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {report.reported_by_name ?? "Unknown"}
            </span>
            <span className="text-amber-600 font-medium">
              Reported {formatRelativeTime(report.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
