"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { ShiftTimeline } from "@/components/modules/workforce/shift-timeline";
import { StaffCard } from "@/components/modules/workforce/staff-card";
import { HandoverCard } from "@/components/modules/workforce/handover-card";
import {
  Users,
  UserCheck,
  Calendar,
  ClipboardList,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ShiftSchedule,
  StaffMember,
  HandoverLog,
  WorkforceStats,
} from "./workforce.types";

interface WorkforceClientProps {
  shifts: ShiftSchedule[];
  staff: StaffMember[];
  handovers: HandoverLog[];
  stats: WorkforceStats;
}

export function WorkforceClient({
  shifts,
  staff,
  handovers,
  stats,
}: WorkforceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staff;
    const q = searchQuery.toLowerCase();
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.replace(/_/g, " ").toLowerCase().includes(q) ||
        s.station.toLowerCase().includes(q)
    );
  }, [staff, searchQuery]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workforce Management"
        description="Shifts, staff directory, and handover logs"
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="On Duty Now"
          value={stats.onDutyNow}
          icon={<UserCheck className="h-4 w-4 text-cyan-600" />}
          accentClass="border-cyan-200 bg-cyan-50/50"
        />
        <StatCard
          label="Total Staff"
          value={stats.totalStaff}
          icon={<Users className="h-4 w-4 text-teal-600" />}
          accentClass="border-teal-200 bg-teal-50/50"
        />
        <StatCard
          label="Shifts Today"
          value={stats.shiftsToday}
          icon={<Calendar className="h-4 w-4 text-cyan-700" />}
          accentClass="border-cyan-200 bg-cyan-50/30"
        />
        <StatCard
          label="Pending Handovers"
          value={stats.pendingHandovers}
          icon={<ClipboardList className="h-4 w-4 text-teal-700" />}
          accentClass="border-teal-200 bg-teal-50/30"
          highlight={stats.pendingHandovers > 0}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="w-full sm:w-auto bg-cyan-50 border border-cyan-200/60">
          <TabsTrigger
            value="shifts"
            className="min-h-[44px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-cyan-800"
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Today&apos;s </span>Shifts
          </TabsTrigger>
          <TabsTrigger
            value="directory"
            className="min-h-[44px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-cyan-800"
          >
            <Users className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Staff </span>Directory
          </TabsTrigger>
          <TabsTrigger
            value="handover"
            className="min-h-[44px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-cyan-800"
          >
            <ClipboardList className="h-4 w-4 mr-1.5" />
            Handover
            {stats.pendingHandovers > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold">
                {stats.pendingHandovers}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Today's Shifts */}
        <TabsContent value="shifts">
          {shifts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No shifts scheduled"
              description="There are no shifts configured for today."
            />
          ) : (
            <ShiftTimeline shifts={shifts} />
          )}
        </TabsContent>

        {/* Tab 2: Staff Directory */}
        <TabsContent value="directory">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 border-cyan-200 focus-visible:ring-cyan-500"
                aria-label="Search staff directory"
              />
            </div>

            {filteredStaff.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No staff found"
                description={
                  searchQuery
                    ? "Try adjusting your search terms."
                    : "No staff members in the directory."
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStaff.map((member) => (
                  <StaffCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Handover Log */}
        <TabsContent value="handover">
          {handovers.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No handover logs"
              description="No shift handover entries recorded today."
            />
          ) : (
            <div className="space-y-3">
              {handovers.map((handover) => (
                <HandoverCard key={handover.id} handover={handover} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accentClass,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentClass: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 flex items-center gap-3",
        accentClass,
        highlight && "ring-1 ring-yellow-400"
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
