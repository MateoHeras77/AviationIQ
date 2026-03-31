/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createDamageReportSchema,
  type CreateDamageReportFormValues,
  rejectDamageReportSchema,
} from "@/lib/validations/damage";

async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" as const };
  }

  const organizationId = (user as any).user_metadata?.organization_id as
    | string
    | undefined;

  if (!organizationId) {
    return { error: "No organization found" as const };
  }

  const { data: profileData } = await (supabase as any)
    .from("profiles")
    .select("station_id, role, full_name")
    .eq("id", user.id)
    .single();

  return {
    supabase: supabase as any,
    user,
    organizationId,
    stationId: profileData?.station_id as string | null,
    userRole: profileData?.role as string | null,
    userName: profileData?.full_name as string | null,
  };
}

export async function actionCreateDamageReport(
  data: CreateDamageReportFormValues
) {
  const parsed = createDamageReportSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, organizationId, stationId } = ctx;

  if (!stationId) {
    return { error: "No station assigned to your profile" };
  }

  const { data: report, error } = await supabase
    .from("damage_reports")
    .insert({
      organization_id: organizationId,
      flight_id: parsed.data.flightId || null,
      aircraft_registration: parsed.data.aircraftRegistration || null,
      station_id: stationId,
      damage_location: parsed.data.damageLocation,
      description: parsed.data.description,
      severity: parsed.data.severity,
      status: "draft",
      reported_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/damage");
  return { success: true, data: report };
}

export async function actionSubmitDamageReport(reportId: string) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase } = ctx;

  const { error } = await supabase
    .from("damage_reports")
    .update({ status: "submitted" })
    .eq("id", reportId)
    .eq("status", "draft");

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/damage/${reportId}`);
  revalidatePath("/damage");
  return { success: true };
}

export async function actionApproveDamageReport(
  reportId: string,
  comments?: string
) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, userRole } = ctx;

  // Get current report status
  const { data: report } = await supabase
    .from("damage_reports")
    .select("status")
    .eq("id", reportId)
    .single();

  if (!report) {
    return { error: "Report not found" };
  }

  const currentStatus = report.status;

  // Supervisor approves submitted reports
  if (
    currentStatus === "submitted" &&
    (userRole === "supervisor" || userRole === "station_manager" || userRole === "admin")
  ) {
    const { error } = await supabase
      .from("damage_reports")
      .update({
        status: "supervisor_reviewed",
        supervisor_id: user.id,
        supervisor_comments: comments || null,
        supervisor_reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) return { error: error.message };
  }
  // Station manager gives final approval
  else if (
    currentStatus === "supervisor_reviewed" &&
    (userRole === "station_manager" || userRole === "admin")
  ) {
    const { error } = await supabase
      .from("damage_reports")
      .update({
        status: "approved",
        manager_id: user.id,
        manager_comments: comments || null,
        manager_approved_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) return { error: error.message };
  } else {
    return { error: "You do not have permission to approve this report at its current stage" };
  }

  revalidatePath(`/damage/${reportId}`);
  revalidatePath("/damage");
  return { success: true };
}

export async function actionRejectDamageReport(
  reportId: string,
  reason: string
) {
  const parsed = rejectDamageReportSchema.safeParse({
    reportId,
    reason,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, userRole } = ctx;

  // Get current report status
  const { data: report } = await supabase
    .from("damage_reports")
    .select("status")
    .eq("id", reportId)
    .single();

  if (!report) {
    return { error: "Report not found" };
  }

  const updateData: Record<string, unknown> = {
    status: "rejected",
  };

  if (
    report.status === "submitted" &&
    (userRole === "supervisor" || userRole === "station_manager" || userRole === "admin")
  ) {
    updateData.supervisor_id = user.id;
    updateData.supervisor_comments = parsed.data.reason;
    updateData.supervisor_reviewed_at = new Date().toISOString();
  } else if (
    report.status === "supervisor_reviewed" &&
    (userRole === "station_manager" || userRole === "admin")
  ) {
    updateData.manager_id = user.id;
    updateData.manager_comments = parsed.data.reason;
    updateData.manager_approved_at = new Date().toISOString();
  } else {
    return { error: "You do not have permission to reject this report at its current stage" };
  }

  const { error } = await supabase
    .from("damage_reports")
    .update(updateData)
    .eq("id", reportId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/damage/${reportId}`);
  revalidatePath("/damage");
  return { success: true };
}

export async function actionUploadDamagePhoto(
  reportId: string,
  fileName: string,
  storagePath: string,
  fileSize?: number,
  gpsLatitude?: number,
  gpsLongitude?: number
) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, organizationId } = ctx;

  const { error } = await supabase.from("damage_report_photos").insert({
    organization_id: organizationId,
    damage_report_id: reportId,
    storage_path: storagePath,
    file_name: fileName,
    file_size: fileSize || null,
    uploaded_by: user.id,
    gps_latitude: gpsLatitude || null,
    gps_longitude: gpsLongitude || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/damage/${reportId}`);
  return { success: true };
}

export async function actionGetDamageReports(filters?: {
  status?: string;
}) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  let query = supabase
    .from("damage_reports")
    .select(
      "*, flights(flight_number), reporter:profiles!damage_reports_reported_by_fkey(full_name), stations(airport_code)"
    )
    .order("created_at", { ascending: false });

  if (stationId) {
    query = query.eq("station_id", stationId);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  const reports = (data || []).map((r: any) => ({
    ...r,
    flight_number: r.flights?.flight_number,
    reported_by_name: r.reporter?.full_name,
    station_code: r.stations?.airport_code,
  }));

  return { data: reports };
}

export async function actionGetDamageReportDetail(reportId: string) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase } = ctx;

  const { data: report, error: reportError } = await supabase
    .from("damage_reports")
    .select(
      "*, flights(flight_number), reporter:profiles!damage_reports_reported_by_fkey(full_name), supervisor:profiles!damage_reports_supervisor_id_fkey(full_name), manager:profiles!damage_reports_manager_id_fkey(full_name), stations(airport_code)"
    )
    .eq("id", reportId)
    .single();

  if (reportError) {
    return { error: reportError.message };
  }

  const { data: photos } = await supabase
    .from("damage_report_photos")
    .select("*")
    .eq("damage_report_id", reportId)
    .order("created_at", { ascending: true });

  // Build status history from the report data
  const statusHistory: Array<{
    status: string;
    changed_by_name: string;
    changed_at: string;
    comments: string | null;
  }> = [];

  statusHistory.push({
    status: "draft",
    changed_by_name: (report as any).reporter?.full_name ?? "Unknown",
    changed_at: report.created_at,
    comments: null,
  });

  if (
    report.status !== "draft"
  ) {
    statusHistory.push({
      status: "submitted",
      changed_by_name: (report as any).reporter?.full_name ?? "Unknown",
      changed_at: report.updated_at,
      comments: null,
    });
  }

  if (report.supervisor_reviewed_at) {
    statusHistory.push({
      status: report.status === "rejected" && !report.manager_approved_at
        ? "rejected"
        : "supervisor_reviewed",
      changed_by_name: (report as any).supervisor?.full_name ?? "Unknown",
      changed_at: report.supervisor_reviewed_at,
      comments: report.supervisor_comments,
    });
  }

  if (report.manager_approved_at) {
    statusHistory.push({
      status: report.status === "rejected" ? "rejected" : "approved",
      changed_by_name: (report as any).manager?.full_name ?? "Unknown",
      changed_at: report.manager_approved_at,
      comments: report.manager_comments,
    });
  }

  return {
    data: {
      ...report,
      flight_number: (report as any).flights?.flight_number,
      reported_by_name: (report as any).reporter?.full_name,
      supervisor_name: (report as any).supervisor?.full_name,
      manager_name: (report as any).manager?.full_name,
      station_code: (report as any).stations?.airport_code,
      photos: photos || [],
      status_history: statusHistory,
    },
  };
}

export async function actionGetFlightsForDamageReport() {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  // Get today's flights
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let query = supabase
    .from("flights")
    .select("id, flight_number, aircraft_registration, origin, destination")
    .gte("scheduled_departure", todayStart.toISOString())
    .lte("scheduled_departure", todayEnd.toISOString())
    .order("scheduled_departure", { ascending: true });

  if (stationId) {
    query = query.eq("station_id", stationId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
