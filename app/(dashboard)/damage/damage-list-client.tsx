"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { actionGetDamageReports } from "./actions";
import type { DamageReport } from "./damage.types";
import type { DamageSeverity } from "./damage.types";
import { DamageReportCard } from "@/components/modules/damage/damage-report-card";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Plus,
  FileWarning,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DamageListClientProps {
  initialReports: DamageReport[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All", variant: "neutral" as const },
  { value: "draft", label: "Draft", variant: "neutral" as const },
  { value: "submitted", label: "Submitted", variant: "info" as const },
  {
    value: "supervisor_reviewed",
    label: "Reviewed",
    variant: "warning" as const,
  },
  { value: "approved", label: "Approved", variant: "success" as const },
  { value: "rejected", label: "Rejected", variant: "danger" as const },
];

const SEVERITY_BAR_COLORS: Record<DamageSeverity, string> = {
  minor: "bg-slate-400",
  moderate: "bg-amber-400",
  major: "bg-orange-500",
  critical: "bg-red-600",
};

const SEVERITY_BAR_LABELS: Record<DamageSeverity, string> = {
  minor: "Minor",
  moderate: "Moderate",
  major: "Major",
  critical: "Critical",
};

export function DamageListClient({
  initialReports,
}: DamageListClientProps) {
  const [reports, setReports] = useState<DamageReport[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState("all");
  const [hasUserFiltered, setHasUserFiltered] = useState(false);

  const refresh = useCallback(async () => {
    const result = await actionGetDamageReports({ status: statusFilter });
    if (result.data) {
      setReports(result.data);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (hasUserFiltered) {
      refresh();
    }
  }, [statusFilter, hasUserFiltered, refresh]);

  // Compute stats
  const stats = useMemo(() => {
    const total = reports.length;
    const pendingReview = reports.filter((r) =>
      ["submitted", "supervisor_reviewed"].includes(r.status)
    ).length;
    const approved = reports.filter((r) => r.status === "approved").length;
    const criticalOpen = reports.filter(
      (r) => r.severity === "critical" && r.status !== "approved" && r.status !== "rejected"
    ).length;
    return { total, pendingReview, approved, criticalOpen };
  }, [reports]);

  // Severity distribution
  const severityDistribution = useMemo(() => {
    const counts: Record<DamageSeverity, number> = {
      minor: 0,
      moderate: 0,
      major: 0,
      critical: 0,
    };
    reports.forEach((r) => {
      counts[r.severity]++;
    });
    return counts;
  }, [reports]);

  const totalForBar = reports.length || 1; // avoid div by zero

  // Sort reports: unresolved critical first, then by created_at desc
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const aIsCriticalOpen =
        a.severity === "critical" &&
        a.status !== "approved" &&
        a.status !== "rejected"
          ? 1
          : 0;
      const bIsCriticalOpen =
        b.severity === "critical" &&
        b.status !== "approved" &&
        b.status !== "rejected"
          ? 1
          : 0;

      if (bIsCriticalOpen !== aIsCriticalOpen) {
        return bIsCriticalOpen - aIsCriticalOpen;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reports]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Damage Reports"
        description="Aircraft damage incident tracking and approval"
        action={
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/damage/new">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          label="Total Reports"
          value={stats.total}
          icon={<FileWarning className="h-4 w-4" />}
          accentColor="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatsCard
          label="Pending Review"
          value={stats.pendingReview}
          icon={<Clock className="h-4 w-4" />}
          accentColor="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatsCard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accentColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          label="Critical Open"
          value={stats.criticalOpen}
          icon={<ShieldAlert className="h-4 w-4" />}
          accentColor="text-red-600"
          bgColor="bg-red-50"
          pulse={stats.criticalOpen > 0}
        />
      </div>

      {/* Severity distribution bar */}
      {reports.length > 0 && (
        <Card className="border-amber-200/50">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Severity Distribution
              </span>
              <div className="flex items-center gap-3">
                {(["minor", "moderate", "major", "critical"] as DamageSeverity[]).map(
                  (sev) =>
                    severityDistribution[sev] > 0 && (
                      <div key={sev} className="flex items-center gap-1">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            SEVERITY_BAR_COLORS[sev]
                          )}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {SEVERITY_BAR_LABELS[sev]} ({severityDistribution[sev]})
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted/50">
              {(["minor", "moderate", "major", "critical"] as DamageSeverity[]).map(
                (sev) => {
                  const pct = (severityDistribution[sev] / totalForBar) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={sev}
                      className={cn(
                        "h-full transition-all duration-500",
                        SEVERITY_BAR_COLORS[sev]
                      )}
                      style={{ width: `${pct}%` }}
                      title={`${SEVERITY_BAR_LABELS[sev]}: ${severityDistribution[sev]}`}
                    />
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setHasUserFiltered(true); setStatusFilter(filter.value); }}
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
      </div>

      {/* Reports list */}
      {sortedReports.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No damage reports found"
          description={
            statusFilter !== "all"
              ? "Try adjusting your filter."
              : "No damage reports yet. Create one to get started."
          }
          action={
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/damage/new">
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedReports.map((report) => (
            <DamageReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Internal stats card component for the damage dashboard */
function StatsCard({
  label,
  value,
  icon,
  accentColor,
  bgColor,
  pulse = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  pulse?: boolean;
}) {
  return (
    <Card className={cn("border-0 shadow-sm", bgColor)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className={cn("text-2xl font-bold mt-0.5", accentColor)}>
              {value}
            </p>
          </div>
          <div
            className={cn(
              "rounded-full p-2",
              accentColor,
              pulse && "animate-pulse"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
