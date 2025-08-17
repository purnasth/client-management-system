import { useRef, useState } from "react";

export function DonutChart({
  value,
  total,
  size = 140,
  label,
}: {
  value: number;
  total: number;
  size?: number;
  label?: string;
}) {
  const radius = size / 2;
  const stroke = 16;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = total > 0 ? value / total : 0;
  const strokeDashoffset = circumference - percent * circumference;

  const ref = useRef<SVGSVGElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const showTip = (e: React.MouseEvent<SVGCircleElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0);
    const y = e.clientY - (rect?.top ?? 0);
    setTip({ x, y });
  };
  const hideTip = () => setTip(null);

  return (
    <div className="relative inline-block">
      <svg ref={ref} height={size} width={size} className="block">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#111827"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          onMouseEnter={showTip}
          onMouseMove={showTip}
          onMouseLeave={hideTip}
        >
          <title>{`${label ?? "Progress"}: ${Math.round(
            percent * 100
          )}% (${value}/${total})`}</title>
        </circle>
        <text
          x="50%"
          y="48%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-gray-900 text-base font-semibold"
        >
          {Math.round(percent * 100)}%
        </text>
        {label && (
          <text
            x="50%"
            y="63%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="fill-gray-500 text-xs"
          >
            {label}
          </text>
        )}
      </svg>
      {tip && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-md"
          style={{ left: tip.x, top: Math.max(0, tip.y - 8) }}
          role="tooltip"
          aria-label={`${label ?? "Progress"}: ${Math.round(percent * 100)}%`}
        >
          <div className="font-medium text-gray-900">{label ?? "Progress"}</div>
          <div className="text-gray-600">
            {Math.round(percent * 100)}% ({value}/{total})
          </div>
        </div>
      )}
    </div>
  );
}
