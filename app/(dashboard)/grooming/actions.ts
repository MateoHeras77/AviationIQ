/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormValues,
  updateWorkOrderStatusSchema,
  type UpdateWorkOrderStatusFormValues,
} from "@/lib/validations/grooming";
import type { GroomingWorkOrderStatus } from "./grooming.types";

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

export async function actionCreateWorkOrder(data: CreateWorkOrderFormValues) {
  const parsed = createWorkOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, user, organizationId } = ctx;

  const { data: workOrder, error } = await supabase
    .from("grooming_work_orders")
    .insert({
      organization_id: organizationId,
      flight_id: parsed.data.flightId,
      aircraft_type_id: parsed.data.aircraftTypeId || null,
      cleaning_level: parsed.data.cleaningLevel,
      standard_duration_min: parsed.data.standardDurationMin,
      required_agents: parsed.data.requiredAgents,
      status: "pending",
      supervisor_id: user.id,
      notes: parsed.data.notes || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/grooming");
  return { success: true, data: workOrder };
}

export async function actionAssignAgent(
  workOrderId: string,
  agentId: string
) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase, organizationId } = ctx;

  // Check if agent is already assigned
  const { data: existing } = await supabase
    .from("grooming_assignments")
    .select("id")
    .eq("work_order_id", workOrderId)
    .eq("agent_id", agentId)
    .single();

  if (existing) {
    return { error: "Agent is already assigned to this work order" };
  }

  const { error } = await supabase.from("grooming_assignments").insert({
    organization_id: organizationId,
    work_order_id: workOrderId,
    agent_id: agentId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/grooming/${workOrderId}`);
  return { success: true };
}

export async function actionUnassignAgent(
  workOrderId: string,
  agentId: string
) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase } = ctx;

  const { error } = await supabase
    .from("grooming_assignments")
    .delete()
    .eq("work_order_id", workOrderId)
    .eq("agent_id", agentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/grooming/${workOrderId}`);
  return { success: true };
}

export async function actionUpdateWorkOrderStatus(
  data: UpdateWorkOrderStatusFormValues
) {
  const parsed = updateWorkOrderStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase } = ctx;

  const updateData: Record<string, unknown> = {
    status: parsed.data.status,
  };

  if (parsed.data.status === "in_progress") {
    updateData.started_at = new Date().toISOString();
  }

  if (parsed.data.status === "completed") {
    updateData.completed_at = new Date().toISOString();

    // Calculate actual duration
    const { data: workOrder } = await supabase
      .from("grooming_work_orders")
      .select("started_at")
      .eq("id", parsed.data.workOrderId)
      .single();

    if (workOrder?.started_at) {
      const start = new Date(workOrder.started_at);
      const end = new Date();
      updateData.actual_duration_min = Math.round(
        (end.getTime() - start.getTime()) / 60000
      );
    }
  }

  const { error } = await supabase
    .from("grooming_work_orders")
    .update(updateData)
    .eq("id", parsed.data.workOrderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/grooming/${parsed.data.workOrderId}`);
  revalidatePath("/grooming");
  return { success: true };
}

export async function actionGetWorkOrders(filters?: {
  status?: string;
  cleaningLevel?: string;
}) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  let query = supabase
    .from("grooming_work_orders")
    .select(
      "*, flights(flight_number, station_id, stations(airport_code)), aircraft_types(code), profiles(full_name), grooming_assignments(id)"
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status as GroomingWorkOrderStatus);
  }

  if (filters?.cleaningLevel && filters.cleaningLevel !== "all") {
    query = query.eq("cleaning_level", filters.cleaningLevel);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  // Filter by station and map joined data
  const workOrders = (data || [])
    .filter(
      (wo: any) => !stationId || wo.flights?.station_id === stationId
    )
    .map((wo: any) => ({
      ...wo,
      flight_number: wo.flights?.flight_number,
      station_code: wo.flights?.stations?.airport_code,
      aircraft_type_code: wo.aircraft_types?.code,
      supervisor_name: wo.profiles?.full_name,
      assigned_agents_count: wo.grooming_assignments?.length ?? 0,
    }));

  return { data: workOrders };
}

export async function actionGetWorkOrderDetail(workOrderId: string) {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const { supabase } = ctx;

  const { data: workOrder, error: woError } = await supabase
    .from("grooming_work_orders")
    .select(
      "*, flights(flight_number, stations(airport_code)), aircraft_types(code, name), profiles(full_name)"
    )
    .eq("id", workOrderId)
    .single();

  if (woError) {
    return { error: woError.message };
  }

  const { data: assignments, error: assignError } = await supabase
    .from("grooming_assignments")
    .select("*, profiles(full_name, email)")
    .eq("work_order_id", workOrderId)
    .order("created_at", { ascending: true });

  if (assignError) {
    return { error: assignError.message };
  }

  const mappedAssignments = (assignments || []).map((a: any) => ({
    ...a,
    agent_name: a.profiles?.full_name,
    agent_email: a.profiles?.email,
  }));

  return {
    data: {
      ...workOrder,
      flight_number: (workOrder as any).flights?.flight_number,
      station_code: (workOrder as any).flights?.stations?.airport_code,
      aircraft_type_code: (workOrder as any).aircraft_types?.code,
      supervisor_name: (workOrder as any).profiles?.full_name,
      grooming_assignments: mappedAssignments,
    },
  };
}

export async function actionGetAvailableAgents() {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  let query = supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .in("role", ["agent", "supervisor"])
    .order("full_name");

  if (stationId) {
    query = query.eq("station_id", stationId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function actionGetFlightsForSelect() {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error, data: [] };

  const { supabase, stationId } = ctx;

  let query = supabase
    .from("flights")
    .select("id, flight_number, origin, destination, scheduled_departure")
    .in("status", ["scheduled", "on_track", "at_risk"])
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
