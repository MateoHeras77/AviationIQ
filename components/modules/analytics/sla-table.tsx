"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SlaReportFlight } from "@/app/(dashboard)/analytics/analytics.types";

interface SlaTableProps {
  flights: SlaReportFlight[];
}

const SLA_STATUS_CONFIG: Record<
  SlaReportFlight["slaStatus"],
  { label: string; badgeClass: string; rowClass: string }
> = {
  compliant: {
    label: "Compliant",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    rowClass: "",
  },
  at_risk: {
    label: "At Risk",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rowClass: "bg-yellow-50/50",
  },
  breached: {
    label: "Breached",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    rowClass: "bg-red-50/50",
  },
  pending: {
    label: "Pending",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
    rowClass: "",
  },
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function SlaTable({ flights }: SlaTableProps) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No flights found for today.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-purple-50/50">
            <TableHead className="font-semibold">Flight</TableHead>
            <TableHead className="font-semibold hidden sm:table-cell">
              Airline
            </TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">
              Events
            </TableHead>
            <TableHead className="font-semibold">SLA Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.map((flight) => {
            const config = SLA_STATUS_CONFIG[flight.slaStatus];
            return (
              <TableRow key={flight.id} className={config.rowClass}>
                <TableCell className="font-medium">
                  {flight.flightNumber}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {flight.airlineName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {formatStatus(flight.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="tabular-nums">
                    {flight.eventsCompleted}/{flight.totalEvents}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", config.badgeClass)}
                  >
                    {config.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
