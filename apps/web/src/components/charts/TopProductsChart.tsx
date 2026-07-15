import { useState } from "react";
import type { DashboardTopProduct } from "@pos/shared";
import { formatLkr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TopProductsChart({ data }: { data: DashboardTopProduct[] }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No sales in the last 7 days.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((product) => {
        const widthPct = Math.max((product.revenue / maxRevenue) * 100, 4);
        const isHovered = hoverId === product.productId;
        return (
          <div
            key={product.productId}
            className="group flex flex-col gap-1"
            onPointerEnter={() => setHoverId(product.productId)}
            onPointerLeave={() => setHoverId(null)}
            onFocus={() => setHoverId(product.productId)}
            onBlur={() => setHoverId(null)}
            tabIndex={0}
            role="img"
            aria-label={`${product.name}: ${formatLkr(product.revenue)}`}
          >
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{product.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatLkr(product.revenue)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-[width,opacity]",
                  isHovered ? "opacity-100" : "opacity-90",
                )}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            {isHovered && (
              <div className="text-xs text-muted-foreground">{product.qtySold} sold</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
