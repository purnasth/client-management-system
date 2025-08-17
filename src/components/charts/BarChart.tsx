import { useRef, useState } from "react";

type Datum = { label: string; value: number };

export function BarChart({
  data,
  height = 160,
  tooltipLabel,
}: {
  data: Datum[];
  height?: number;
  tooltipLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 28;
  const gap = 12;
  const width = data.length * (barWidth + gap) + gap;
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const showTip = (e: React.MouseEvent, label: string, value: number) => {
    const rect = ref.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0);
    const y = e.clientY - (rect?.top ?? 0);
    setTip({ x, y, label, value });
  };
  const hideTip = () => setTip(null);

  return (
    <div className="relative inline-block" ref={ref}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {data.map((d, i) => {
          const h = Math.round((d.value / max) * (height - 30));
          const x = gap + i * (barWidth + gap);
          const y = height - h - 20;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={6}
                className="fill-gray-900 cursor-pointer"
                onMouseEnter={(e) => showTip(e, d.label, d.value)}
                onMouseMove={(e) => showTip(e, d.label, d.value)}
                onMouseLeave={hideTip}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-gray-600 text-[10px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {tip && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-md"
          style={{ left: tip.x, top: Math.max(0, tip.y - 8) }}
          role="tooltip"
          aria-label={`${tip.label}: ${tip.value}`}
        >
          <div className="font-medium text-gray-900">
            {tooltipLabel ? `${tooltipLabel} — ${tip.label}` : tip.label}
          </div>
          <div className="text-gray-600">{tip.value}</div>
        </div>
      )}
    </div>
  );
}
