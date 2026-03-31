import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";

export default function EventLogLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <LoadingSpinner className="py-12" />
    </div>
  );
}
