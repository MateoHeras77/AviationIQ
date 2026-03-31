"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import {
  actionApproveDamageReport,
  actionRejectDamageReport,
} from "@/app/(dashboard)/damage/actions";
import type {
  DamageReportStatus,
  DamageStatusChange,
} from "@/app/(dashboard)/damage/damage.types";
import {
  DAMAGE_STATUS_LABELS,
  DAMAGE_STATUS_VARIANT,
} from "@/app/(dashboard)/damage/damage.types";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  FileText,
  Eye,
  Shield,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalWorkflowProps {
  reportId: string;
  currentStatus: DamageReportStatus;
  statusHistory: DamageStatusChange[];
  userRole: string | null;
}

export function ApprovalWorkflow({
  reportId,
  currentStatus,
  statusHistory,
  userRole,
}: ApprovalWorkflowProps) {
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [comments, setComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Determine if the current user can take action
  const canSupervisorApprove =
    currentStatus === "submitted" &&
    (userRole === "supervisor" ||
      userRole === "station_manager" ||
      userRole === "admin");

  const canManagerApprove =
    currentStatus === "supervisor_reviewed" &&
    (userRole === "station_manager" || userRole === "admin");

  const canApprove = canSupervisorApprove || canManagerApprove;

  async function handleApprove() {
    setIsApproving(true);
    try {
      const result = await actionApproveDamageReport(
        reportId,
        comments.trim() || undefined
      );
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Approved",
          description: "The damage report has been approved.",
        });
        setComments("");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve report.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    try {
      const result = await actionRejectDamageReport(reportId, rejectReason);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Rejected",
          description: "The damage report has been rejected.",
        });
        setRejectReason("");
        setShowRejectForm(false);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject report.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  // Approval chain steps with icons
  const approvalSteps = [
    {
      label: "Reported",
      sublabel: "Agent",
      icon: FileText,
      status: "draft" as DamageReportStatus,
      reached:
        currentStatus !== "draft" ||
        statusHistory.some((h) => h.status === "draft"),
    },
    {
      label: "Submitted",
      sublabel: "For Review",
      icon: Eye,
      status: "submitted" as DamageReportStatus,
      reached: ["submitted", "supervisor_reviewed", "approved"].includes(
        currentStatus
      ),
    },
    {
      label: "Supervisor",
      sublabel: "Review",
      icon: CheckCircle2,
      status: "supervisor_reviewed" as DamageReportStatus,
      reached: ["supervisor_reviewed", "approved"].includes(currentStatus),
    },
    {
      label: "Manager",
      sublabel: "Approval",
      icon: Shield,
      status: "approved" as DamageReportStatus,
      reached: currentStatus === "approved",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Approval chain visualization — vertical stepper */}
      <Card className="border-amber-200/50">
        <CardHeader>
          <CardTitle className="text-base text-amber-700">
            Approval Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStatus === "rejected" ? (
            <div className="flex items-center gap-2 text-red-600 mb-4 bg-red-50 rounded-lg p-3">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium text-sm">This report has been rejected</p>
            </div>
          ) : null}

          <div className="space-y-0">
            {approvalSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive =
                (currentStatus === step.status) ||
                (currentStatus === "rejected" && !step.reached && index === approvalSteps.findIndex(s => !s.reached));
              const isLast = index === approvalSteps.length - 1;

              return (
                <div key={step.label}>
                  <div className="flex items-center gap-3">
                    {/* Step circle with icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center h-9 w-9 rounded-full border-2 flex-shrink-0 transition-all",
                        step.reached
                          ? "bg-amber-500 border-amber-500 text-white"
                          : isActive
                            ? "bg-amber-50 border-amber-400 text-amber-600"
                            : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {step.reached ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Step text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          step.reached
                            ? "text-foreground"
                            : isActive
                              ? "text-amber-700"
                              : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {step.sublabel}
                      </p>
                    </div>

                    {/* Status indicator */}
                    {step.reached && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                        Done
                      </span>
                    )}
                    {isActive && !step.reached && currentStatus !== "rejected" && (
                      <span className="text-[10px] font-medium text-orange-600 bg-orange-50 rounded-full px-2 py-0.5 animate-pulse">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Connecting arrow */}
                  {!isLast && (
                    <div className="flex items-center ml-[17px] py-1">
                      <div
                        className={cn(
                          "flex flex-col items-center",
                          step.reached ? "text-amber-400" : "text-muted-foreground/20"
                        )}
                      >
                        <div
                          className={cn(
                            "w-0.5 h-3",
                            step.reached ? "bg-amber-400" : "bg-muted-foreground/20"
                          )}
                        />
                        <ArrowDown className="h-3 w-3 -mt-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      {canApprove && (
        <Card className="border-amber-300/50 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-base text-amber-700">
              {canSupervisorApprove
                ? "Supervisor Review"
                : "Manager Final Approval"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional comments..."
              rows={2}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 min-h-[44px] bg-amber-600 hover:bg-amber-700"
              >
                {isApproving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="flex-1 min-h-[44px]"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>

            {showRejectForm && (
              <div className="space-y-2 pt-2 border-t">
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (required)..."
                  rows={3}
                />
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isRejecting || !rejectReason.trim()}
                  className="w-full min-h-[44px]"
                >
                  {isRejecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Confirm Rejection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      {statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="mt-1">
                    <StatusBadge
                      status={
                        DAMAGE_STATUS_LABELS[
                          entry.status as DamageReportStatus
                        ] ?? entry.status
                      }
                      variant={
                        DAMAGE_STATUS_VARIANT[
                          entry.status as DamageReportStatus
                        ] ?? "neutral"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {entry.changed_by_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>
                    {entry.comments && (
                      <p className="text-muted-foreground mt-1 italic">
                        {entry.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
