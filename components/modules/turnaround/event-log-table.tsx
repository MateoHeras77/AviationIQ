"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/modules/shared/empty-state";
import {
  EVENT_LABELS,
  type TurnaroundEvent,
} from "@/app/(dashboard)/turnaround/turnaround.types";
import { ClipboardList } from "lucide-react";

interface EventLogTableProps {
  events: TurnaroundEvent[];
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function EventLogTable({ events }: EventLogTableProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No events logged yet"
        description="Turnaround events will appear here as they are logged."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="hidden sm:table-cell">Logged By</TableHead>
            <TableHead className="hidden md:table-cell">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                {EVENT_LABELS[event.event_type] ?? event.event_type}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(event.logged_at)}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {event.logged_by_name ?? "Unknown"}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                {event.notes ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
