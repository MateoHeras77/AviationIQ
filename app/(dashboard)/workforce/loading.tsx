import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";

export default function WorkforceLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-56 bg-muted animate-pulse rounded" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-cyan-200/50 bg-cyan-50/30 p-3 h-16 animate-pulse" />
        ))}
      </div>
      <LoadingSpinner className="py-12" />
    </div>
  );
}
