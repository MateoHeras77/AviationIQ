"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AnalyticsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
        <AlertTriangle className="h-6 w-6 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Failed to load the analytics dashboard. Please try again.
      </p>
      <Button
        onClick={reset}
        className="mt-4 bg-purple-600 hover:bg-purple-700"
      >
        Try Again
      </Button>
    </div>
  );
}
