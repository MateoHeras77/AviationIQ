import { Plane } from "lucide-react";

export default function PortalPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Plane className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Airline Client Portal</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Read-only performance data and SLA compliance reports for airline clients. Coming in Phase 3.
      </p>
    </div>
  );
}
