import { useMemo, useState } from "react";
import type { SalesOverTimePoint } from "@pos/shared";
import { formatLkr } from "@/lib/format";

const WIDTH = 600;
const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 16 };

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
  });
}

export function SalesTrendChart({ data }: { data: SalesOverTimePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, plotWidth, plotHeight } = useMemo(() => {
    const plotWidth = WIDTH - PAD.left - PAD.right;
    const plotHeight = HEIGHT - PAD.top - PAD.bottom;
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const points = data.map((d, i) => ({
      x: PAD.left + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth),
      y: PAD.top + plotHeight - (d.revenue / maxRevenue) * plotHeight,
      ...d,
    }));
    return { points, maxRevenue, plotWidth, plotHeight };
  }, [data]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${PAD.top + plotHeight} L ${points[0]?.x ?? 0} ${PAD.top + plotHeight} Z`;

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = relX / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Sales revenue over the last 7 days"
      >
        {/* recessive baseline */}
        <line
          x1={PAD.left}
          y1={PAD.top + plotHeight}
          x2={WIDTH - PAD.right}
          y2={PAD.top + plotHeight}
          className="stroke-border"
          strokeWidth={1}
        />

        <path d={areaPath} className="fill-primary/10" />
        <path
          d={linePath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) => (
          <g key={p.date}>
            {i === hoverIndex && (
              <line
                x1={p.x}
                y1={PAD.top}
                x2={p.x}
                y2={PAD.top + plotHeight}
                className="stroke-muted-foreground/40"
                strokeWidth={1}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={i === hoverIndex ? 5 : 4}
              className="fill-primary stroke-card"
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {shortDate(p.date)}
            </text>
          </g>
        ))}

        {/* transparent hit-area for the whole chart, drives the crosshair */}
        <rect
          x={PAD.left}
          y={0}
          width={plotWidth}
          height={HEIGHT}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border bg-popover px-2 py-1 text-xs shadow-md"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            transform:
              hovered.x > WIDTH * 0.75 ? "translateX(-100%)" : "translateX(-50%)",
          }}
        >
          <div className="font-semibold text-popover-foreground">
            {formatLkr(hovered.revenue)}
          </div>
          <div className="text-muted-foreground">
            {shortDate(hovered.date)} · {hovered.transactionCount} sale
            {hovered.transactionCount === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
