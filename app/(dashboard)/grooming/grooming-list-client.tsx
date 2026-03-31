"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { actionGetWorkOrders } from "./actions";
import type {
  GroomingWorkOrder,
  GroomingWorkOrderStatus,
} from "./grooming.types";
import { WorkOrderCard } from "@/components/modules/grooming/work-order-card";
import { WorkOrderForm } from "@/components/modules/grooming/work-order-form";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import {
  Sparkles,
  ClipboardList,
  Loader2,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GroomingListClientProps {
  initialWorkOrders: GroomingWorkOrder[];
}

const CLEANING_FILTERS = [
  { value: "all", label: "All Levels", variant: "neutral" as const },
  { value: "transit_clean", label: "Transit", variant: "info" as const },
  { value: "full_clean", label: "Full", variant: "warning" as const },
  { value: "deep_clean", label: "Deep", variant: "danger" as const },
];

const KANBAN_COLUMNS: {
  key: GroomingWorkOrderStatus;
  label: string;
  headerClass: string;
  emptyLabel: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    headerClass: "bg-green-100 text-green-800 border-green-200",
    emptyLabel: "No pending orders",
  },
  {
    key: "in_progress",
    label: "In Progress",
    headerClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    emptyLabel: "No active orders",
  },
  {
    key: "completed",
    label: "Completed",
    headerClass: "bg-green-50 text-green-700 border-green-200",
    emptyLabel: "No completed orders",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    headerClass: "bg-gray-100 text-gray-600 border-gray-200",
    emptyLabel: "No cancelled orders",
  },
];

// Mobile status filter tabs
const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "Active" },
  { value: "completed", label: "Done" },
];

export function GroomingListClient({
  initialWorkOrders,
}: GroomingListClientProps) {
  const [workOrders, setWorkOrders] =
    useState<GroomingWorkOrder[]>(initialWorkOrders);
  const [cleaningFilter, setCleaningFilter] = useState("all");
  const [mobileStatusFilter, setMobileStatusFilter] = useState("all");

  const [hasUserFiltered, setHasUserFiltered] = useState(false);

  const refresh = useCallback(async () => {
    const result = await actionGetWorkOrders({
      cleaningLevel: cleaningFilter,
    });
    if (result.data) {
      setWorkOrders(result.data);
    }
  }, [cleaningFilter]);

  // Only refetch when user actively changes the filter, not on mount
  useEffect(() => {
    if (hasUserFiltered) {
      refresh();
    }
  }, [cleaningFilter, hasUserFiltered, refresh]);

  // Summary metrics
  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: workOrders.length,
      pending: workOrders.filter((wo) => wo.status === "pending").length,
      inProgress: workOrders.filter((wo) => wo.status === "in_progress").length,
      completedToday: workOrders.filter(
        (wo) =>
          wo.status === "completed" &&
          wo.completed_at &&
          new Date(wo.completed_at).toDateString() === today
      ).length,
    };
  }, [workOrders]);

  // Group by status for kanban
  const groupedOrders = useMemo(() => {
    const groups: Record<GroomingWorkOrderStatus, GroomingWorkOrder[]> = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };
    workOrders.forEach((wo) => {
      if (groups[wo.status]) {
        groups[wo.status].push(wo);
      }
    });
    return groups;
  }, [workOrders]);

  // Filtered list for mobile
  const mobileFilteredOrders = useMemo(() => {
    if (mobileStatusFilter === "all") return workOrders;
    return workOrders.filter((wo) => wo.status === mobileStatusFilter);
  }, [workOrders, mobileStatusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Grooming Management"
        description="Manage cabin cleaning work orders"
        action={<WorkOrderForm onSuccess={refresh} />}
      />

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total Orders"
          value={metrics.total}
          icon={<ClipboardList className="h-4 w-4 text-green-600" />}
          accentClass="border-green-200 bg-green-50/50"
        />
        <MetricCard
          label="Pending"
          value={metrics.pending}
          icon={<Loader2 className="h-4 w-4 text-emerald-600" />}
          accentClass="border-emerald-200 bg-emerald-50/50"
        />
        <MetricCard
          label="In Progress"
          value={metrics.inProgress}
          icon={<PlayCircle className="h-4 w-4 text-teal-600" />}
          accentClass="border-teal-200 bg-teal-50/50"
        />
        <MetricCard
          label="Completed Today"
          value={metrics.completedToday}
          icon={<CheckCircle2 className="h-4 w-4 text-green-700" />}
          accentClass="border-green-300 bg-green-50/50"
        />
      </div>

      {/* Cleaning level filters */}
      <div className="flex flex-wrap gap-2">
        {CLEANING_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setHasUserFiltered(true); setCleaningFilter(filter.value); }}
            className={cn(
              "transition-all",
              cleaningFilter === filter.value
                ? "opacity-100 scale-105"
                : "opacity-60 hover:opacity-80"
            )}
          >
            <StatusBadge
              status={filter.label}
              variant={filter.variant}
              className="cursor-pointer px-3 py-1 text-sm"
            />
          </button>
        ))}
      </div>

      {workOrders.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No work orders found"
          description={
            cleaningFilter !== "all"
              ? "Try adjusting your filters."
              : "No grooming work orders yet. Create one to get started."
          }
        />
      ) : (
        <>
          {/* Desktop: Kanban layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.key} className="flex flex-col">
                <div
                  className={cn(
                    "rounded-t-lg px-3 py-2 border font-semibold text-sm flex items-center justify-between",
                    col.headerClass
                  )}
                >
                  <span>{col.label}</span>
                  <span className="text-xs font-bold rounded-full bg-white/70 px-2 py-0.5">
                    {groupedOrders[col.key].length}
                  </span>
                </div>
                <div className="flex-1 bg-green-50/30 border border-t-0 border-green-100 rounded-b-lg p-2 space-y-2 min-h-[200px]">
                  {groupedOrders[col.key].length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      {col.emptyLabel}
                    </p>
                  ) : (
                    groupedOrders[col.key].map((wo) => (
                      <WorkOrderCard key={wo.id} workOrder={wo} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Status filter tabs + card list */}
          <div className="lg:hidden space-y-3">
            <div className="flex gap-1 bg-green-50 rounded-lg p-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setMobileStatusFilter(filter.value)}
                  className={cn(
                    "flex-1 text-xs font-medium py-2 rounded-md transition-all min-h-[44px]",
                    mobileStatusFilter === filter.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-green-700 hover:bg-green-100"
                  )}
                >
                  {filter.label}
                  {filter.value !== "all" && (
                    <span className="ml-1 opacity-70">
                      {filter.value === "pending"
                        ? metrics.pending
                        : filter.value === "in_progress"
                        ? metrics.inProgress
                        : workOrders.filter(
                            (wo) => wo.status === "completed"
                          ).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {mobileFilteredOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders in this status.
              </p>
            ) : (
              <div className="space-y-2">
                {mobileFilteredOrders.map((wo) => (
                  <WorkOrderCard key={wo.id} workOrder={wo} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accentClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 flex items-center gap-3",
        accentClass
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
