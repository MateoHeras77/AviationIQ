import { LoadingSpinner } from "@/components/modules/shared/loading-spinner";

export default function DamageReportDetailLoading() {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-48 bg-muted animate-pulse rounded" />
      <LoadingSpinner className="py-12" />
    </div>
  );
}
