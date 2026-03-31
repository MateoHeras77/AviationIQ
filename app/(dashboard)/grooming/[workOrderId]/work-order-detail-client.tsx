"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { PageHeader } from "@/components/modules/shared/page-header";
import { AgentAssignment } from "@/components/modules/grooming/agent-assignment";
import { actionUpdateWorkOrderStatus } from "@/app/(dashboard)/grooming/actions";
import type {
  GroomingWorkOrder,
  GroomingAssignment,
  CleaningLevel,
} from "@/app/(dashboard)/grooming/grooming.types";
import {
  CLEANING_LEVEL_LABELS,
  WORK_ORDER_STATUS_VARIANT,
} from "@/app/(dashboard)/grooming/grooming.types";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Timer,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkOrderDetailClientProps {
  workOrder: GroomingWorkOrder;
  assignments: GroomingAssignment[];
  userRole: string | null;
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const CLEANING_LEVEL_TAG_STYLES: Record<CleaningLevel, string> = {
  transit_clean: "bg-emerald-100 text-emerald-800 border-emerald-300",
  full_clean: "bg-green-100 text-green-800 border-green-300",
  deep_clean: "bg-teal-100 text-teal-800 border-teal-300",
};

/** Cleaning checklist items per level */
const CLEANING_CHECKLISTS: Record<CleaningLevel, string[]> = {
  transit_clean: [
    "Seatbelt check and straighten",
    "Tray tables wiped and stowed",
    "Seat pockets cleared",
    "Floor quick sweep",
    "Lavatory quick clean",
    "Trash removal",
  ],
  full_clean: [
    "Seatbelt check and straighten",
    "Tray tables wiped and stowed",
    "Seat pockets cleared",
    "Floor vacuum all aisles",
    "Lavatory full clean and restock",
    "Trash removal",
    "Overhead bins wiped",
    "Galley surfaces wiped",
    "Armrests and headrests wiped",
    "Window shades positioned",
  ],
  deep_clean: [
    "Seatbelt check and straighten",
    "Tray tables deep clean",
    "Seat pockets cleared and wiped",
    "Floor vacuum and mop",
    "Lavatory deep sanitize and restock",
    "Trash removal",
    "Overhead bins deep clean",
    "Galley full deep clean",
    "Armrests and headrests sanitize",
    "Window shades cleaned",
    "Seat cushions inspected and cleaned",
    "Carpet stain treatment",
    "Air vent covers wiped",
    "Under-seat area cleaned",
  ],
};

function formatElapsed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }
  return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  const calculateElapsed = useCallback(() => {
    const start = new Date(startedAt).getTime();
    return Math.max(0, Math.floor((Date.now() - start) / 1000));
  }, [startedAt]);

  useEffect(() => {
    setElapsed(calculateElapsed());
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateElapsed]);

  return (
    <div className="flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <Timer className="h-6 w-6 text-emerald-600 animate-pulse" />
      <div className="text-center">
        <p className="text-3xl font-mono font-bold text-emerald-800 tracking-wider">
          {formatElapsed(elapsed)}
        </p>
        <p className="text-xs text-emerald-600 mt-0.5">Cleaning in progress</p>
      </div>
    </div>
  );
}

export function WorkOrderDetailClient({
  workOrder,
  assignments,
  userRole,
}: WorkOrderDetailClientProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const canManage =
    userRole === "admin" ||
    userRole === "station_manager" ||
    userRole === "supervisor";

  const checklistItems = CLEANING_CHECKLISTS[workOrder.cleaning_level];
  const isCompleted = workOrder.status === "completed";

  async function handleStatusChange(
    newStatus: "pending" | "in_progress" | "completed" | "cancelled"
  ) {
    setIsUpdating(true);
    try {
      const result = await actionUpdateWorkOrderStatus({
        workOrderId: workOrder.id,
        status: newStatus,
      });
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Status Updated",
          description: `Work order status changed to ${formatStatus(newStatus)}.`,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Work Order - ${workOrder.flight_number ?? "No Flight"}`}
        description="Grooming work order details"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/grooming">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Elapsed timer for in-progress */}
      {workOrder.status === "in_progress" && workOrder.started_at && (
        <ElapsedTimer startedAt={workOrder.started_at} />
      )}

      {/* Work order details card */}
      <Card className="border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Details</CardTitle>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block text-xs font-semibold px-2.5 py-1 rounded-md border",
                  CLEANING_LEVEL_TAG_STYLES[workOrder.cleaning_level]
                )}
              >
                {CLEANING_LEVEL_LABELS[workOrder.cleaning_level]}
              </span>
              <StatusBadge
                status={formatStatus(workOrder.status)}
                variant={WORK_ORDER_STATUS_VARIANT[workOrder.status]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Flight</p>
              <p className="font-medium">{workOrder.flight_number ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Aircraft</p>
              <p className="font-medium">
                {workOrder.aircraft_type_code ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Standard Duration</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                {workOrder.standard_duration_min} min
              </p>
            </div>
            {workOrder.actual_duration_min !== null && (
              <div>
                <p className="text-muted-foreground">Actual Duration</p>
                <p className="font-medium text-emerald-700">
                  {workOrder.actual_duration_min} min
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Required Agents</p>
              <p className="font-medium">{workOrder.required_agents}</p>
            </div>
            {workOrder.supervisor_name && (
              <div>
                <p className="text-muted-foreground">Supervisor</p>
                <p className="font-medium">{workOrder.supervisor_name}</p>
              </div>
            )}
            {workOrder.started_at && (
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">
                  {new Date(workOrder.started_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>
            )}
            {workOrder.completed_at && (
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-medium">
                  {new Date(workOrder.completed_at).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )}
                </p>
              </div>
            )}
          </div>

          {workOrder.notes && (
            <div className="mt-4 pt-4 border-t border-green-100">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm mt-1">{workOrder.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleaning checklist */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Cleaning Checklist -{" "}
            {CLEANING_LEVEL_LABELS[workOrder.cleaning_level]}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {checklistItems.length} items required for{" "}
            {CLEANING_LEVEL_LABELS[workOrder.cleaning_level].toLowerCase()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checklistItems.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  isCompleted
                    ? "bg-green-50 text-green-800"
                    : "bg-gray-50 text-gray-700"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-gray-300"
                  )}
                >
                  {isCompleted && <Check className="h-3 w-3" />}
                </div>
                <span className={isCompleted ? "line-through opacity-70" : ""}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status actions */}
      {canManage &&
        workOrder.status !== "completed" &&
        workOrder.status !== "cancelled" && (
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {workOrder.status === "pending" && (
                  <Button
                    onClick={() => handleStatusChange("in_progress")}
                    disabled={isUpdating}
                    className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Start Cleaning
                  </Button>
                )}
                {workOrder.status === "in_progress" && (
                  <Button
                    onClick={() => handleStatusChange("completed")}
                    disabled={isUpdating}
                    className="min-h-[44px] bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isUpdating}
                  className="min-h-[44px]"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Agent assignments */}
      <AgentAssignment
        workOrderId={workOrder.id}
        assignments={assignments}
        requiredAgents={workOrder.required_agents}
        workOrderStatus={workOrder.status}
      />
    </div>
  );
}
