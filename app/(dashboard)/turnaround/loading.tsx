import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";

export default function TurnaroundLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-11 bg-muted animate-pulse rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-20 bg-muted animate-pulse rounded-full" />
        ))}
      </div>
      <LoadingSpinner className="py-12" />
    </div>
  );
}
