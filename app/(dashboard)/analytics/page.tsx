import { getAuthenticatedUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import { actionGetAnalyticsOverview, actionGetSlaReport } from "./actions";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const [overviewResult, slaResult] = await Promise.all([
    actionGetAnalyticsOverview(),
    actionGetSlaReport(),
  ]);

  return (
    <AnalyticsClient
      overview={overviewResult.data}
      slaReport={slaResult.data}
    />
  );
}
