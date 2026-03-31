import { cn } from "@/lib/utils";

interface BarChartItem {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  suffix?: string;
}

interface BarChartProps {
  items: BarChartItem[];
  className?: string;
}

/**
 * Pure Tailwind horizontal bar chart -- no chart library.
 * Each bar scales to maxValue across the items.
 */
export function BarChart({ items, className }: BarChartProps) {
  const globalMax = Math.max(...items.map((i) => i.maxValue), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const percentage = Math.min(
          Math.round((item.value / globalMax) * 100),
          100
        );

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">
                {item.label}
              </span>
              <span className="font-medium tabular-nums whitespace-nowrap">
                {item.value}
                {item.suffix}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", item.color)}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Variant with SLA comparison (actual vs max)
interface ComparisonBarItem {
  label: string;
  actual: number;
  slaMax: number | null;
}

interface ComparisonBarChartProps {
  items: ComparisonBarItem[];
  className?: string;
}

export function ComparisonBarChart({
  items,
  className,
}: ComparisonBarChartProps) {
  const maxVal = Math.max(
    ...items.map((i) => Math.max(i.actual, i.slaMax ?? 0)),
    1
  );

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => {
        const actualPct = Math.min(
          Math.round((item.actual / maxVal) * 100),
          100
        );
        const slaPct = item.slaMax
          ? Math.min(Math.round((item.slaMax / maxVal) * 100), 100)
          : null;
        const isOverSla = item.slaMax !== null && item.actual > item.slaMax;

        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">
                {item.label}
              </span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    isOverSla ? "text-red-600" : "text-foreground"
                  )}
                >
                  {item.actual} min
                </span>
                {item.slaMax !== null && (
                  <span className="text-xs text-muted-foreground">
                    / {item.slaMax} max
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isOverSla ? "bg-red-500" : "bg-purple-500"
                )}
                style={{ width: `${actualPct}%` }}
              />
              {slaPct !== null && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-amber-500"
                  style={{ left: `${slaPct}%` }}
                  title={`SLA max: ${item.slaMax} min`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
