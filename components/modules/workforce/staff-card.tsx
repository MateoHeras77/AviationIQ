"use client";

import type { StaffMember } from "@/app/(dashboard)/workforce/workforce.types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffCardProps {
  member: StaffMember;
}

const ROLE_COLORS: Record<string, string> = {
  ramp_agent: "bg-cyan-100 text-cyan-800 border-cyan-200",
  wing_walker: "bg-teal-100 text-teal-800 border-teal-200",
  marshaller: "bg-sky-100 text-sky-800 border-sky-200",
  cabin_cleaner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  customer_service_agent: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const STATUS_STYLES: Record<string, { dot: string; label: string; textClass: string }> = {
  on_shift: { dot: "bg-green-500", label: "On Shift", textClass: "text-green-700" },
  off_shift: { dot: "bg-gray-400", label: "Off Shift", textClass: "text-gray-500" },
  on_break: { dot: "bg-yellow-500", label: "On Break", textClass: "text-yellow-700" },
};

export function StaffCard({ member }: StaffCardProps) {
  const status = STATUS_STYLES[member.status] ?? STATUS_STYLES.off_shift;
  const roleColor = ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-cyan-100 text-cyan-700 font-semibold text-sm">
              {member.initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm truncate">{member.name}</h4>
              <div className="flex items-center gap-1.5">
                <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
                <span className={cn("text-xs font-medium", status.textClass)}>
                  {status.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleColor)}>
                {member.role.replace(/_/g, " ")}
              </Badge>
              <span className="text-xs text-muted-foreground">{member.station}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-1.5 mt-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <a
                href={`tel:${member.phone}`}
                className="text-xs text-cyan-700 hover:underline font-mono"
                aria-label={`Call ${member.name} at ${member.phone}`}
              >
                {member.phone}
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
