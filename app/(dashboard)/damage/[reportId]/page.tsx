/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DamageReportDetailClient } from "./report-detail-client";

interface DamageReportDetailPageProps {
  params: Promise<{ reportId: string }>;
}

export default async function DamageReportDetailPage({
  params,
}: DamageReportDetailPageProps) {
  const { reportId } = await params;
  const supabase = await createClient();

  // Fetch report with joins
  const { data: report, error: reportError } = await (supabase as any)
    .from("damage_reports")
    .select(
      "*, flights(flight_number), reporter:profiles!damage_reports_reported_by_fkey(full_name), supervisor:profiles!damage_reports_supervisor_id_fkey(full_name), manager:profiles!damage_reports_manager_id_fkey(full_name), stations(airport_code)"
    )
    .eq("id", reportId)
    .single();

  if (reportError || !report) {
    notFound();
  }

  // Fetch photos
  const { data: photos } = await (supabase as any)
    .from("damage_report_photos")
    .select("*")
    .eq("damage_report_id", reportId)
    .order("created_at", { ascending: true });

  // Get user profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  // Build status history
  const statusHistory: Array<{
    status: string;
    changed_by_name: string;
    changed_at: string;
    comments: string | null;
  }> = [];

  statusHistory.push({
    status: "draft",
    changed_by_name: report.reporter?.full_name ?? "Unknown",
    changed_at: report.created_at,
    comments: null,
  });

  if (report.status !== "draft") {
    statusHistory.push({
      status: "submitted",
      changed_by_name: report.reporter?.full_name ?? "Unknown",
      changed_at: report.updated_at,
      comments: null,
    });
  }

  if (report.supervisor_reviewed_at) {
    statusHistory.push({
      status:
        report.status === "rejected" && !report.manager_approved_at
          ? "rejected"
          : "supervisor_reviewed",
      changed_by_name: report.supervisor?.full_name ?? "Unknown",
      changed_at: report.supervisor_reviewed_at,
      comments: report.supervisor_comments,
    });
  }

  if (report.manager_approved_at) {
    statusHistory.push({
      status: report.status === "rejected" ? "rejected" : "approved",
      changed_by_name: report.manager?.full_name ?? "Unknown",
      changed_at: report.manager_approved_at,
      comments: report.manager_comments,
    });
  }

  const mappedReport = {
    ...report,
    flight_number: report.flights?.flight_number,
    reported_by_name: report.reporter?.full_name,
    supervisor_name: report.supervisor?.full_name,
    manager_name: report.manager?.full_name,
    station_code: report.stations?.airport_code,
    photos: photos || [],
    status_history: statusHistory,
  };

  return (
    <DamageReportDetailClient
      report={mappedReport}
      userRole={userRole}
    />
  );
}
