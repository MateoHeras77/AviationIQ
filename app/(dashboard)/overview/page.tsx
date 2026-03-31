import { getAuthenticatedUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import { actionGetDashboardStats } from "./actions";
import { DashboardOverview } from "@/components/modules/overview/dashboard-overview";

export default async function OverviewPage() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const { data: stats } = await actionGetDashboardStats();

  return (
    <DashboardOverview
      userName={user.profile.full_name}
      userRole={user.role}
      stationId={user.profile.station_id}
      organizationId={user.organizationId}
      initialStats={stats}
    />
  );
}
