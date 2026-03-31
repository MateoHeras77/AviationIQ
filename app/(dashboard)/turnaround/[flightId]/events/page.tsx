/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EventLogTable } from "@/components/modules/turnaround/event-log-table";
import { ArrowLeft } from "lucide-react";

interface EventLogPageProps {
  params: Promise<{ flightId: string }>;
}

export default async function EventLogPage({ params }: EventLogPageProps) {
  const { flightId } = await params;
  const supabase = await createClient();

  // Fetch flight for title
  const { data: flight } = await (supabase as any)
    .from("flights")
    .select("flight_number")
    .eq("id", flightId)
    .single();

  if (!flight) {
    notFound();
  }

  // Fetch events
  const { data: events } = await (supabase as any)
    .from("turnaround_events")
    .select("*, profiles(full_name)")
    .eq("flight_id", flightId)
    .order("event_sequence", { ascending: true });

  const mappedEvents = (events || []).map((e: any) => ({
    ...e,
    logged_by_name: e.profiles?.full_name,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Event Log - ${flight.flight_number}`}
        description="Complete history of turnaround events"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/turnaround/${flightId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tracker
            </Link>
          </Button>
        }
      />

      <EventLogTable events={mappedEvents} />
    </div>
  );
}
