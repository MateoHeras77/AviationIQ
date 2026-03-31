"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { actionGetBaggageCases } from "./actions";
import type { BaggageCase, BaggageCaseStatus } from "./baggage.types";
import {
  BAGGAGE_STATUS_LABELS,
  BAGGAGE_STATUS_SEQUENCE,
} from "./baggage.types";
import { BaggageCaseCard } from "@/components/modules/baggage/baggage-case-card";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Luggage,
  Plus,
  Briefcase,
  Truck,
  PackageCheck,
  AlertCircle,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BaggageListClientProps {
  initialCases: BaggageCase[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All", variant: "neutral" as const },
  { value: "reported", label: "Reported", variant: "danger" as const },
  { value: "located", label: "Located", variant: "info" as const },
  { value: "in_transit", label: "In Transit", variant: "warning" as const },
  {
    value: "out_for_delivery",
    label: "Delivery",
    variant: "warning" as const,
  },
  { value: "delivered", label: "Delivered", variant: "success" as const },
  { value: "closed", label: "Closed", variant: "neutral" as const },
];

const PIPELINE_STATUS_COLORS: Record<BaggageCaseStatus, string> = {
  reported: "border-red-300 bg-red-50/50",
  located: "border-blue-300 bg-blue-50/50",
  in_transit: "border-amber-300 bg-amber-50/50",
  out_for_delivery: "border-violet-300 bg-violet-50/50",
  delivered: "border-green-300 bg-green-50/50",
  closed: "border-gray-300 bg-gray-50/50",
};

const PIPELINE_HEADER_COLORS: Record<BaggageCaseStatus, string> = {
  reported: "text-red-700 bg-red-100",
  located: "text-blue-700 bg-blue-100",
  in_transit: "text-amber-700 bg-amber-100",
  out_for_delivery: "text-violet-700 bg-violet-100",
  delivered: "text-green-700 bg-green-100",
  closed: "text-gray-700 bg-gray-100",
};

export function BaggageListClient({ initialCases }: BaggageListClientProps) {
  const [cases, setCases] = useState<BaggageCase[]>(initialCases);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUserFiltered, setHasUserFiltered] = useState(false);

  const refresh = useCallback(async () => {
    const result = await actionGetBaggageCases({
      status: statusFilter,
      search: searchQuery,
    });
    if (result.data) {
      setCases(result.data);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (hasUserFiltered) {
      refresh();
    }
  }, [statusFilter, searchQuery, hasUserFiltered, refresh]);

  // Stats
  const stats = useMemo(() => {
    const allCases = initialCases; // use full unfiltered set for stats
    const openCases = allCases.filter(
      (c) => !["delivered", "closed"].includes(c.status)
    ).length;
    const inTransit = allCases.filter(
      (c) => c.status === "in_transit" || c.status === "out_for_delivery"
    ).length;
    const deliveredToday = allCases.filter((c) => {
      if (c.status !== "delivered" && c.status !== "closed") return false;
      if (!c.actual_delivery) return false;
      const today = new Date().toISOString().slice(0, 10);
      return c.actual_delivery.slice(0, 10) === today;
    }).length;
    const criticalLost = allCases.filter(
      (c) =>
        c.issue_type === "lost" && !["delivered", "closed"].includes(c.status)
    ).length;
    return { openCases, inTransit, deliveredToday, criticalLost };
  }, [initialCases]);

  // Group cases by status for pipeline view
  const casesByStatus = useMemo(() => {
    const grouped: Record<BaggageCaseStatus, BaggageCase[]> = {
      reported: [],
      located: [],
      in_transit: [],
      out_for_delivery: [],
      delivered: [],
      closed: [],
    };
    cases.forEach((c) => {
      grouped[c.status].push(c);
    });
    return grouped;
  }, [cases]);

  // Sort cases: lost first, then by updated_at desc
  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => {
      const aIsLostOpen =
        a.issue_type === "lost" &&
        !["delivered", "closed"].includes(a.status)
          ? 1
          : 0;
      const bIsLostOpen =
        b.issue_type === "lost" &&
        !["delivered", "closed"].includes(b.status)
          ? 1
          : 0;

      if (bIsLostOpen !== aIsLostOpen) return bIsLostOpen - aIsLostOpen;

      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  }, [cases]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Baggage Services"
        description="Case management, tracking, and delivery coordination"
        action={
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Link href="/baggage/new">
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Link>
          </Button>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          label="Open Cases"
          value={stats.openCases}
          icon={<Briefcase className="h-4 w-4" />}
          accentColor="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatsCard
          label="In Transit"
          value={stats.inTransit}
          icon={<Truck className="h-4 w-4" />}
          accentColor="text-violet-600"
          bgColor="bg-violet-50"
        />
        <StatsCard
          label="Delivered Today"
          value={stats.deliveredToday}
          icon={<PackageCheck className="h-4 w-4" />}
          accentColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          label="Critical / Lost"
          value={stats.criticalLost}
          icon={<AlertCircle className="h-4 w-4" />}
          accentColor="text-red-600"
          bgColor="bg-red-50"
          pulse={stats.criticalLost > 0}
        />
      </div>

      {/* Pipeline view -- desktop only, horizontal flow */}
      {cases.length > 0 && (
        <div className="hidden lg:block">
          <Card className="border-indigo-200/50">
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pipeline View
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {BAGGAGE_STATUS_SEQUENCE.map((status, idx) => {
                  const statusCases = casesByStatus[status];
                  const isLast = idx === BAGGAGE_STATUS_SEQUENCE.length - 1;

                  return (
                    <div key={status} className="flex items-start gap-1 min-w-0">
                      <div
                        className={cn(
                          "flex-shrink-0 w-44 rounded-lg border p-2",
                          PIPELINE_STATUS_COLORS[status]
                        )}
                      >
                        <div
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md mb-2 text-center",
                            PIPELINE_HEADER_COLORS[status]
                          )}
                        >
                          {BAGGAGE_STATUS_LABELS[status]} ({statusCases.length})
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {statusCases.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground text-center py-3">
                              No cases
                            </p>
                          ) : (
                            statusCases.map((c) => (
                              <Link
                                key={c.id}
                                href={`/baggage/${c.id}`}
                                className="block"
                              >
                                <div className="bg-background rounded border p-1.5 hover:border-indigo-400 transition-colors cursor-pointer text-[11px]">
                                  <div className="font-bold text-foreground truncate">
                                    {c.flight_number}
                                  </div>
                                  <div className="text-muted-foreground truncate">
                                    {c.passenger_name}
                                  </div>
                                  <div className="font-mono text-muted-foreground/70">
                                    {c.bag_tag}
                                  </div>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                      {!isLast && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 mt-8 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, PNR, bag tag, flight..."
            className="pl-9 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => {
              setHasUserFiltered(true);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setHasUserFiltered(true);
              setStatusFilter(filter.value);
            }}
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

      {/* Cases list */}
      {sortedCases.length === 0 ? (
        <EmptyState
          icon={Luggage}
          title="No baggage cases found"
          description={
            statusFilter !== "all" || searchQuery
              ? "Try adjusting your filter or search."
              : "No baggage cases yet. Create one to get started."
          }
          action={
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link href="/baggage/new">
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCases.map((c) => (
            <BaggageCaseCard key={c.id} baggageCase={c} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Internal stats card component for the baggage dashboard */
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
