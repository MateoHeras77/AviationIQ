import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";

export default function SlaConfigurationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="SLA Configuration"
        description="Set maximum turnaround event durations per airline client"
      />
      <EmptyState
        title="No SLA configurations yet"
        description="Configure SLA thresholds for each airline client and turnaround event type."
      />
    </div>
  );
}
