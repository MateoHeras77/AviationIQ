"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { PageHeader } from "@/components/modules/shared/page-header";
import { CaseTimeline } from "@/components/modules/baggage/case-timeline";
import type { BaggageCaseWithTimeline } from "@/app/(dashboard)/baggage/baggage.types";
import {
  BAGGAGE_STATUS_LABELS,
  BAGGAGE_STATUS_VARIANT,
  BAGGAGE_STATUS_SEQUENCE,
  ISSUE_TYPE_LABELS,
  ISSUE_TYPE_COLOR,
} from "@/app/(dashboard)/baggage/baggage.types";
import type { BaggageCaseStatus } from "@/app/(dashboard)/baggage/baggage.types";
import { actionUpdateCaseStatus } from "@/app/(dashboard)/baggage/actions";
import {
  ArrowLeft,
  Plane,
  User,
  Phone,
  Mail,
  Tag,
  Luggage,
  MapPin,
  Truck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CaseDetailClientProps {
  baggageCase: BaggageCaseWithTimeline;
}

const STATUS_BANNER_BG: Record<BaggageCaseStatus, string> = {
  reported: "from-red-50 to-transparent border-red-200",
  located: "from-blue-50 to-transparent border-blue-200",
  in_transit: "from-amber-50 to-transparent border-amber-200",
  out_for_delivery: "from-violet-50 to-transparent border-violet-200",
  delivered: "from-green-50 to-transparent border-green-200",
  closed: "from-gray-50 to-transparent border-gray-200",
};

const STATUS_BANNER_TEXT: Record<BaggageCaseStatus, string> = {
  reported: "text-red-700",
  located: "text-blue-700",
  in_transit: "text-amber-700",
  out_for_delivery: "text-violet-700",
  delivered: "text-green-700",
  closed: "text-gray-700",
};

function getNextStatus(
  current: BaggageCaseStatus
): BaggageCaseStatus | null {
  const idx = BAGGAGE_STATUS_SEQUENCE.indexOf(current);
  if (idx < 0 || idx >= BAGGAGE_STATUS_SEQUENCE.length - 1) return null;
  return BAGGAGE_STATUS_SEQUENCE[idx + 1];
}

export function CaseDetailClient({ baggageCase }: CaseDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const nextStatus = getNextStatus(baggageCase.status);

  async function handleUpdateStatus(newStatus: BaggageCaseStatus) {
    setIsUpdating(true);
    try {
      const result = await actionUpdateCaseStatus({
        caseId: baggageCase.id,
        status: newStatus,
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status Updated",
        description: `Case moved to ${BAGGAGE_STATUS_LABELS[newStatus]}.`,
      });

      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update case status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Case ${baggageCase.pnr} - ${baggageCase.flight_number}`}
        description="Baggage incident details and tracking"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/baggage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Status banner */}
      <div
        className={cn(
          "rounded-lg border bg-gradient-to-r p-4 flex items-center justify-between gap-3",
          STATUS_BANNER_BG[baggageCase.status]
        )}
      >
        <div className="flex items-center gap-3">
          <Luggage
            className={cn("h-5 w-5 flex-shrink-0", STATUS_BANNER_TEXT[baggageCase.status])}
          />
          <div>
            <p
              className={cn(
                "text-sm font-bold",
                STATUS_BANNER_TEXT[baggageCase.status]
              )}
            >
              {BAGGAGE_STATUS_LABELS[baggageCase.status]}
            </p>
            <p className="text-xs text-muted-foreground">
              {baggageCase.bag_tag} -- {baggageCase.bag_color} bag
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs", ISSUE_TYPE_COLOR[baggageCase.issue_type])}
          >
            {ISSUE_TYPE_LABELS[baggageCase.issue_type]}
          </Badge>
          <StatusBadge
            status={BAGGAGE_STATUS_LABELS[baggageCase.status]}
            variant={BAGGAGE_STATUS_VARIANT[baggageCase.status]}
          />
        </div>
      </div>

      {/* Pipeline progress bar */}
      <Card className="border-indigo-200/50">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-1">
            {BAGGAGE_STATUS_SEQUENCE.map((status, idx) => {
              const currentIdx = BAGGAGE_STATUS_SEQUENCE.indexOf(
                baggageCase.status
              );
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={status} className="flex items-center flex-1 gap-1">
                  <div className="flex-1">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        isCompleted ? "bg-indigo-500" : "bg-muted-foreground/15",
                        isCurrent && "ring-1 ring-indigo-400 ring-offset-1"
                      )}
                    />
                    <p
                      className={cn(
                        "text-[9px] text-center mt-1 leading-tight",
                        isCompleted
                          ? "text-indigo-600 font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {BAGGAGE_STATUS_LABELS[status]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left column: info cards */}
        <div className="lg:col-span-3 space-y-4">
          {/* Passenger info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-indigo-700">
                Passenger Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    {baggageCase.passenger_name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">PNR</p>
                  <p className="font-medium font-mono">
                    {baggageCase.pnr}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-600" />
                    <a
                      href={`tel:${baggageCase.passenger_phone}`}
                      className="underline underline-offset-2"
                    >
                      {baggageCase.passenger_phone}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    <a
                      href={`mailto:${baggageCase.passenger_email}`}
                      className="underline underline-offset-2 truncate"
                    >
                      {baggageCase.passenger_email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Flight</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Plane className="h-3.5 w-3.5 text-indigo-600" />
                    {baggageCase.flight_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bag info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-indigo-700">
                Bag Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bag Tag</p>
                  <p className="font-medium font-mono flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-indigo-600" />
                    {baggageCase.bag_tag}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Color</p>
                  <p className="font-medium">{baggageCase.bag_color}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{baggageCase.bag_description}</p>
              </div>
              {baggageCase.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {baggageCase.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery info - shown when relevant */}
          {(baggageCase.status === "out_for_delivery" ||
            baggageCase.status === "delivered" ||
            baggageCase.delivery_address) && (
            <Card className="border-violet-200/50">
              <CardHeader>
                <CardTitle className="text-base text-violet-700 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {baggageCase.delivery_address && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-violet-600 flex-shrink-0" />
                        {baggageCase.delivery_address}
                      </p>
                    </div>
                  )}
                  {baggageCase.delivery_agent && (
                    <div>
                      <p className="text-muted-foreground">Delivery Agent</p>
                      <p className="font-medium flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-violet-600" />
                        {baggageCase.delivery_agent}
                      </p>
                    </div>
                  )}
                  {baggageCase.estimated_delivery && (
                    <div>
                      <p className="text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">
                        {new Date(baggageCase.estimated_delivery).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}
                  {baggageCase.actual_delivery && (
                    <div>
                      <p className="text-muted-foreground">Actual Delivery</p>
                      <p className="font-medium flex items-center gap-1.5 text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {new Date(baggageCase.actual_delivery).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: timeline + actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action buttons */}
          {nextStatus && (
            <Card className="border-indigo-200/50">
              <CardContent className="py-4 px-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </p>
                <Button
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={isUpdating}
                  className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Move to {BAGGAGE_STATUS_LABELS[nextStatus]}
                </Button>
                {baggageCase.status !== "delivered" &&
                  baggageCase.status !== "closed" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={isUpdating}
                      className="w-full min-h-[48px]"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Delivered
                    </Button>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-indigo-700">
                Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CaseTimeline entries={baggageCase.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
