/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { WorkOrderDetailClient } from "./work-order-detail-client";

interface WorkOrderDetailPageProps {
  params: Promise<{ workOrderId: string }>;
}

export default async function WorkOrderDetailPage({
  params,
}: WorkOrderDetailPageProps) {
  const { workOrderId } = await params;
  const supabase = await createClient();

  // Fetch work order
  const { data: workOrder, error: woError } = await (supabase as any)
    .from("grooming_work_orders")
    .select(
      "*, flights(flight_number, stations(airport_code)), aircraft_types(code, name), profiles(full_name)"
    )
    .eq("id", workOrderId)
    .single();

  if (woError || !workOrder) {
    notFound();
  }

  // Fetch assignments
  const { data: assignments } = await (supabase as any)
    .from("grooming_assignments")
    .select("*, profiles(full_name, email)")
    .eq("work_order_id", workOrderId)
    .order("created_at", { ascending: true });

  // Get user role
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

  const mappedWorkOrder = {
    ...workOrder,
    flight_number: workOrder.flights?.flight_number,
    station_code: workOrder.flights?.stations?.airport_code,
    aircraft_type_code: workOrder.aircraft_types?.code,
    supervisor_name: workOrder.profiles?.full_name,
  };

  const mappedAssignments = (assignments || []).map((a: any) => ({
    ...a,
    agent_name: a.profiles?.full_name,
    agent_email: a.profiles?.email,
  }));

  return (
    <WorkOrderDetailClient
      workOrder={mappedWorkOrder}
      assignments={mappedAssignments}
      userRole={userRole}
    />
  );
}
