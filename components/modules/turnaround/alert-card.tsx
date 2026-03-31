"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { actionAcknowledgeAlert } from "@/app/(dashboard)/turnaround/actions";
import type { TurnaroundAlert } from "@/app/(dashboard)/turnaround/turnaround.types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  AlertOctagon,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: TurnaroundAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const { toast } = useToast();
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const isCritical = alert.alert_message
    .toLowerCase()
    .includes("critical");

  async function handleAcknowledge() {
    setIsAcknowledging(true);
    try {
      const result = await actionAcknowledgeAlert(alert.id);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Alert Acknowledged",
          description: "The alert has been marked as acknowledged.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert.",
        variant: "destructive",
      });
    } finally {
      setIsAcknowledging(false);
    }
  }

  return (
    <Card
      className={cn(
        "transition-colors",
        !alert.is_read && isCritical && "border-red-300 bg-red-50",
        !alert.is_read && !isCritical && "border-yellow-300 bg-yellow-50",
        alert.is_read && "opacity-60"
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {isCritical ? (
            <AlertOctagon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                {alert.flight_number && (
                  <span className="font-bold text-sm mr-2">
                    {alert.flight_number}
                  </span>
                )}
                <StatusBadge
                  status={isCritical ? "Critical" : "Warning"}
                  variant={isCritical ? "danger" : "warning"}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(alert.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>

            <p className="text-sm">{alert.alert_message}</p>

            {alert.is_read ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="h-3 w-3" />
                Acknowledged
                {alert.acknowledged_by_name && ` by ${alert.acknowledged_by_name}`}
              </p>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                className="min-h-[40px]"
              >
                {isAcknowledging ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Check className="mr-2 h-3 w-3" />
                )}
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
