import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-purple-100 animate-pulse rounded-lg" />
            <div className="h-8 w-56 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-7 w-36 bg-muted animate-pulse rounded-full" />
      </div>

      {/* Stats bar skeleton */}
      <div className="rounded-lg bg-purple-600/20 animate-pulse h-[88px]" />

      {/* Tabs skeleton */}
      <div className="h-10 w-80 bg-muted animate-pulse rounded-md" />

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] bg-muted animate-pulse rounded-lg border-t-4 border-t-purple-300"
          />
        ))}
      </div>

      <LoadingSpinner className="py-8" />
    </div>
  );
}
