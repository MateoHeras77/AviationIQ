import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";

export default function TrackerLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-20 bg-muted animate-pulse rounded" />
      <LoadingSpinner className="py-12" />
    </div>
  );
}
