"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { AlertCard } from "@/components/modules/turnaround/alert-card";
import type { TurnaroundAlert } from "@/app/(dashboard)/turnaround/turnaround.types";
import { ArrowLeft, Bell } from "lucide-react";

interface AlertCenterClientProps {
  initialAlerts: TurnaroundAlert[];
}

export function AlertCenterClient({
  initialAlerts,
}: AlertCenterClientProps) {
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filteredAlerts = showAcknowledged
    ? initialAlerts
    : initialAlerts.filter((a) => !a.is_read);

  const unreadCount = initialAlerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Alert Center"
        description={`${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/turnaround">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Board
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Button
          variant={showAcknowledged ? "secondary" : "default"}
          size="sm"
          onClick={() => setShowAcknowledged(false)}
          className="min-h-[40px]"
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={showAcknowledged ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowAcknowledged(true)}
          className="min-h-[40px]"
        >
          All ({initialAlerts.length})
        </Button>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            showAcknowledged
              ? "No alerts"
              : "No unread alerts"
          }
          description={
            showAcknowledged
              ? "There are no alerts for your station."
              : "All alerts have been acknowledged."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
