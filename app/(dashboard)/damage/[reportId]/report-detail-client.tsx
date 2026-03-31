"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/modules/shared/status-badge";
import { PageHeader } from "@/components/modules/shared/page-header";
import { ApprovalWorkflow } from "@/components/modules/damage/approval-workflow";
import { PhotoUpload } from "@/components/modules/damage/photo-upload";
import type { DamageReportWithDetails } from "@/app/(dashboard)/damage/damage.types";
import type { DamageSeverity } from "@/app/(dashboard)/damage/damage.types";
import {
  DAMAGE_STATUS_LABELS,
  DAMAGE_STATUS_VARIANT,
  SEVERITY_LABELS,
} from "@/app/(dashboard)/damage/damage.types";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plane,
  User,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DamageReportDetailClientProps {
  report: DamageReportWithDetails;
  userRole: string | null;
}

const SEVERITY_BANNER_BG: Record<DamageSeverity, string> = {
  minor: "from-slate-50 to-transparent border-slate-200",
  moderate: "from-amber-50 to-transparent border-amber-200",
  major: "from-orange-50 to-transparent border-orange-200",
  critical: "from-red-50 to-transparent border-red-200",
};

const SEVERITY_BANNER_TEXT: Record<DamageSeverity, string> = {
  minor: "text-slate-700",
  moderate: "text-amber-700",
  major: "text-orange-700",
  critical: "text-red-700",
};

const SEVERITY_DOT_COLOR: Record<DamageSeverity, string> = {
  minor: "bg-slate-400",
  moderate: "bg-amber-400",
  major: "bg-orange-500",
  critical: "bg-red-600",
};

export function DamageReportDetailClient({
  report,
  userRole,
}: DamageReportDetailClientProps) {
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Damage Report ${report.flight_number ? `- ${report.flight_number}` : ""}`}
        description="Incident details and approval workflow"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/damage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Severity banner */}
      <div
        className={cn(
          "rounded-lg border bg-gradient-to-r p-4 flex items-center justify-between gap-3",
          SEVERITY_BANNER_BG[report.severity]
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "h-3.5 w-3.5 rounded-full flex-shrink-0",
              SEVERITY_DOT_COLOR[report.severity],
              report.severity === "critical" &&
                "animate-pulse shadow-[0_0_8px_2px_rgba(220,38,38,0.4)]"
            )}
          />
          <div>
            <p className={cn("text-sm font-bold", SEVERITY_BANNER_TEXT[report.severity])}>
              {SEVERITY_LABELS[report.severity]} Severity Incident
            </p>
            <p className="text-xs text-muted-foreground">
              {report.aircraft_registration && `Aircraft ${report.aircraft_registration}`}
              {report.aircraft_registration && report.station_code && " at "}
              {report.station_code && `Station ${report.station_code}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={DAMAGE_STATUS_LABELS[report.status]}
            variant={DAMAGE_STATUS_VARIANT[report.status]}
          />
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left column: details + photos */}
        <div className="lg:col-span-3 space-y-4">
          {/* Report details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-amber-700">
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {report.flight_number && (
                  <div>
                    <p className="text-muted-foreground">Flight</p>
                    <p className="font-medium flex items-center gap-1">
                      <Plane className="h-3.5 w-3.5 text-amber-600" />
                      {report.flight_number}
                    </p>
                  </div>
                )}
                {report.aircraft_registration && (
                  <div>
                    <p className="text-muted-foreground">Aircraft</p>
                    <p className="font-medium">{report.aircraft_registration}</p>
                  </div>
                )}
                {report.station_code && (
                  <div>
                    <p className="text-muted-foreground">Station</p>
                    <p className="font-medium">{report.station_code}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Reported By</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {report.reported_by_name ?? "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(report.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Damage Location
                </p>
                <p className="text-sm font-medium">{report.damage_location}</p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Photos section as gallery grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-amber-700">
                Evidence Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Gallery grid */}
              {report.photos && report.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {report.photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setZoomedPhoto(photo.storage_path)}
                      className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer group"
                      aria-label={`View ${photo.file_name}`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center truncate bg-background/80 rounded px-1">
                          {photo.file_name}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="text-xs font-medium text-transparent group-hover:text-white transition-colors">
                          Click to enlarge
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <PhotoUpload
                reportId={report.id}
                existingPhotos={
                  report.photos && report.photos.length > 0
                    ? undefined
                    : report.photos
                }
                disabled={report.status !== "draft"}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: approval workflow + timeline */}
        <div className="lg:col-span-2">
          <ApprovalWorkflow
            reportId={report.id}
            currentStatus={report.status}
            statusHistory={report.status_history}
            userRole={userRole}
          />
        </div>
      </div>

      {/* Photo zoom overlay */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
          role="dialog"
          aria-label="Enlarged photo view"
        >
          <div
            className="relative max-w-3xl max-h-[80vh] w-full bg-background rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
              aria-label="Close enlarged view"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-full h-[60vh] flex items-center justify-center bg-muted">
              <div className="text-center space-y-2">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Photo preview will be available when Supabase Storage is connected
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
