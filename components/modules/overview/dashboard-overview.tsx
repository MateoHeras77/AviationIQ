"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { DashboardStats } from "@/app/(dashboard)/overview/actions";
import type { UserRole } from "@/lib/supabase/types";
import {
  Plane,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface DashboardOverviewProps {
  userName: string;
  userRole?: UserRole;
  stationId: string | null;
  organizationId?: string;
  initialStats: DashboardStats | null;
}

// =============================================================================
// Helpers
// =============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// =============================================================================
// Component
// =============================================================================

export function DashboardOverview({
  userName,
  stationId,
  initialStats,
}: DashboardOverviewProps) {
  const [stationName, setStationName] = useState<string>("");

  useEffect(() => {
    if (!stationId) return;

    const supabase = createClient();
    supabase
      .from("stations")
      .select("airport_code, airport_name")
      .eq("id", stationId)
      .single()
      .then(({ data }) => {
        if (data) {
          setStationName(`${data.airport_code} - ${data.airport_name}`);
        }
      });
  }, [stationId]);

  const stats = initialStats;
  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {formatDate()}
          {stationName && (
            <span className="ml-2 text-foreground font-medium">
              — {stationName}
            </span>
          )}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">
              Active Flights
            </CardDescription>
            <Plane className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.activeFlights ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Today&apos;s scheduled flights
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">
              Grooming Orders
            </CardDescription>
            <Sparkles className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.groomingOrders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending + in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">
              Damage Reports
            </CardDescription>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.damageReports ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Needing review
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">
              SLA Compliance
            </CardDescription>
            <ShieldCheck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.slaCompliance !== null && stats?.slaCompliance !== undefined
                ? `${stats.slaCompliance}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall compliance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>
            Latest turnaround events across all flights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 border-b last:border-b-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {item.flightNumber}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {formatEventType(item.eventType)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {item.loggedByName}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(item.loggedAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/turnaround" className="group">
            <Card className="border-t-4 border-t-blue-500 transition-shadow hover:shadow-md h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Plus className="h-5 w-5 text-blue-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">New Flight</CardTitle>
                <CardDescription className="mt-1">
                  Add a new flight to the turnaround board
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/grooming" className="group">
            <Card className="border-t-4 border-t-green-500 transition-shadow hover:shadow-md h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                    <Plus className="h-5 w-5 text-green-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">New Work Order</CardTitle>
                <CardDescription className="mt-1">
                  Create a grooming work order
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/damage/new" className="group">
            <Card className="border-t-4 border-t-amber-500 transition-shadow hover:shadow-md h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                    <Plus className="h-5 w-5 text-amber-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">New Damage Report</CardTitle>
                <CardDescription className="mt-1">
                  Report a new aircraft damage incident
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
