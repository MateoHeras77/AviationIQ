"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/modules/analytics/metric-card";
import { BarChart, ComparisonBarChart } from "@/components/modules/analytics/bar-chart";
import { SlaTable } from "@/components/modules/analytics/sla-table";
import { ExportCard } from "@/components/modules/analytics/export-card";
import {
  Plane,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  BarChart3,
  Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsOverview, SlaReportSummary } from "./analytics.types";

// =============================================================================
// Props
// =============================================================================

interface AnalyticsClientProps {
  overview: AnalyticsOverview | null;
  slaReport: SlaReportSummary | null;
}

// =============================================================================
// Component
// =============================================================================

export function AnalyticsClient({ overview, slaReport }: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Page header with purple accent */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Analytics & Reporting
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Operational insights, SLA compliance, and report generation
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start border-purple-200 text-purple-700 bg-purple-50 px-3 py-1"
        >
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Badge>
      </div>

      {/* Stats bar -- purple themed summary strip */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">
              Flights Today
            </p>
            <p className="text-2xl font-bold mt-1">
              {overview?.totalFlightsToday ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">
              On-Time Rate
            </p>
            <p className="text-2xl font-bold mt-1">
              {overview?.onTimeRate ?? 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">
              SLA Compliance
            </p>
            <p className="text-2xl font-bold mt-1">
              {overview?.slaComplianceRate ?? 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">
              Avg Turnaround
            </p>
            <p className="text-2xl font-bold mt-1">
              {overview?.avgTurnaroundMin ?? 0}
              <span className="text-sm font-normal ml-1">min</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-1.5">
            <ShieldCheck className="h-4 w-4 hidden sm:inline" />
            SLA Report
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5">
            <FileText className="h-4 w-4 hidden sm:inline" />
            Export Center
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operations Overview */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewTab overview={overview} />
        </TabsContent>

        {/* Tab 2: SLA Report */}
        <TabsContent value="sla" className="space-y-6">
          <SlaReportTab slaReport={slaReport} />
        </TabsContent>

        {/* Tab 3: Export Center */}
        <TabsContent value="export" className="space-y-6">
          <ExportCenterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// Tab 1: Operations Overview
// =============================================================================

function OverviewTab({ overview }: { overview: AnalyticsOverview | null }) {
  if (!overview) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Unable to load analytics data.</p>
      </div>
    );
  }

  return (
    <>
      {/* KPI row: 6 metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Flights"
          value={overview.totalFlightsToday}
          subtitle="Today"
          icon={Plane}
        />
        <MetricCard
          title="On-Time Rate"
          value={`${overview.onTimeRate}%`}
          subtitle="On track + completed"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Turnaround"
          value={`${overview.avgTurnaroundMin}`}
          subtitle="Minutes"
          icon={Clock}
        />
        <MetricCard
          title="SLA Compliance"
          value={`${overview.slaComplianceRate}%`}
          subtitle="Overall"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Damage Reports"
          value={overview.openDamageReports}
          subtitle="Open"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Grooming Orders"
          value={overview.activeGroomingOrders}
          subtitle="Active"
          icon={Sparkles}
        />
      </div>

      {/* Flight Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            Flight Status Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of today&apos;s flights by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overview.flightStatusDistribution.length > 0 ? (
            <FlightStatusBars items={overview.flightStatusDistribution} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No flight data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Turnaround Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            Turnaround Performance
          </CardTitle>
          <CardDescription>
            Average time per event step vs SLA maximum.
            <span className="inline-flex items-center gap-1 ml-2 text-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />{" "}
              Actual
              <span className="inline-block h-2 w-0.5 bg-amber-500 ml-1" />{" "}
              SLA Max
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overview.turnaroundPerformance.length > 0 ? (
            <ComparisonBarChart
              items={overview.turnaroundPerformance.map((p) => ({
                label: p.label,
                actual: p.avgMinutes,
                slaMax: p.slaMaxMinutes,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No turnaround events logged today.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Station Comparison */}
      {overview.stationComparison.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              Station Comparison
            </CardTitle>
            <CardDescription>
              Today&apos;s performance across stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-50/50 border-b">
                    <th className="text-left font-semibold px-4 py-3">
                      Station
                    </th>
                    <th className="text-right font-semibold px-4 py-3">
                      Flights
                    </th>
                    <th className="text-right font-semibold px-4 py-3 hidden sm:table-cell">
                      On-Time Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.stationComparison.map((station) => (
                    <tr
                      key={station.stationId}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium">
                            {station.stationCode}
                          </span>
                          <span className="text-muted-foreground ml-1 hidden sm:inline">
                            {station.stationName}
                          </span>
                        </div>
                      </td>
                      <td className="text-right px-4 py-3 tabular-nums">
                        {station.totalFlights}
                      </td>
                      <td className="text-right px-4 py-3 tabular-nums hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            station.onTimeRate >= 90
                              ? "bg-green-100 text-green-800 border-green-200"
                              : station.onTimeRate >= 70
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          )}
                        >
                          {station.onTimeRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// =============================================================================
// Flight Status Bars (pure Tailwind horizontal bars)
// =============================================================================

function FlightStatusBars({
  items,
}: {
  items: AnalyticsOverview["flightStatusDistribution"];
}) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);
  const totalCount = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.count / maxCount) * 100);
        const share =
          totalCount > 0
            ? Math.round((item.count / totalCount) * 100)
            : 0;

        return (
          <div key={item.status} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={cn("h-3 w-3 rounded-full", item.color)}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium tabular-nums">{item.count}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {share}%
                </span>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  item.color
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Tab 2: SLA Report
// =============================================================================

function SlaReportTab({
  slaReport,
}: {
  slaReport: SlaReportSummary | null;
}) {
  if (!slaReport) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TableIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Unable to load SLA report.</p>
      </div>
    );
  }

  return (
    <>
      {/* SLA Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Total Flights
            </p>
            <p className="text-2xl font-bold mt-1">{slaReport.totalFlights}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Compliant
            </p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {slaReport.compliantCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              At Risk
            </p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">
              {slaReport.atRiskCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Breached
            </p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              {slaReport.breachedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500 col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Compliance Rate
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {slaReport.complianceRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA compliance visual bar */}
      {slaReport.totalFlights > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-4 w-full rounded-full overflow-hidden">
              {slaReport.compliantCount > 0 && (
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{
                    width: `${(slaReport.compliantCount / slaReport.totalFlights) * 100}%`,
                  }}
                  title={`Compliant: ${slaReport.compliantCount}`}
                />
              )}
              {slaReport.pendingCount > 0 && (
                <div
                  className="bg-gray-300 transition-all duration-500"
                  style={{
                    width: `${(slaReport.pendingCount / slaReport.totalFlights) * 100}%`,
                  }}
                  title={`Pending: ${slaReport.pendingCount}`}
                />
              )}
              {slaReport.atRiskCount > 0 && (
                <div
                  className="bg-yellow-500 transition-all duration-500"
                  style={{
                    width: `${(slaReport.atRiskCount / slaReport.totalFlights) * 100}%`,
                  }}
                  title={`At Risk: ${slaReport.atRiskCount}`}
                />
              )}
              {slaReport.breachedCount > 0 && (
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{
                    width: `${(slaReport.breachedCount / slaReport.totalFlights) * 100}%`,
                  }}
                  title={`Breached: ${slaReport.breachedCount}`}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Compliant
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                At Risk
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Breached
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLA Table */}
      <SlaTable flights={slaReport.flights} />
    </>
  );
}

// =============================================================================
// Tab 3: Export Center
// =============================================================================

function ExportCenterTab() {
  return (
    <>
      {/* Date range picker (UI only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            Report Parameters
          </CardTitle>
          <CardDescription>
            Select a date range for your reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="date-from"
                className="text-sm font-medium text-muted-foreground mb-1.5 block"
              >
                From
              </label>
              <Input
                id="date-from"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="border-purple-200 focus-visible:ring-purple-500"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="date-to"
                className="text-sm font-medium text-muted-foreground mb-1.5 block"
              >
                To
              </label>
              <Input
                id="date-to"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="border-purple-200 focus-visible:ring-purple-500"
              />
            </div>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Apply Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ExportCard
          title="Daily Operations Summary"
          description="Flights, turnaround events, and KPIs for the selected date range."
          icon={BarChart3}
        />
        <ExportCard
          title="Monthly SLA Compliance"
          description="SLA compliance rates, breaches, and trends by month."
          icon={ShieldCheck}
        />
        <ExportCard
          title="Damage Report History"
          description="All damage reports with approval status and resolution details."
          icon={AlertTriangle}
        />
        <ExportCard
          title="Grooming Performance"
          description="Work order completion rates, agent productivity, and cleaning times."
          icon={Sparkles}
        />
      </div>
    </>
  );
}
