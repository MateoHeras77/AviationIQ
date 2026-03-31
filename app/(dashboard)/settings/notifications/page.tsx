import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Configure alert thresholds and notification preferences"
      />
      <EmptyState
        title="No notification rules configured"
        description="Set up notification rules for turnaround events, damage reports, and more."
      />
    </div>
  );
}
