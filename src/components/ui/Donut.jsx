import { useId } from "react";

/**
 * Hand-rolled SVG donut chart.
 * @param {object} props
 * @param {number} props.value 0–100
 * @param {number} [props.size=128] px
 * @param {number} [props.stroke=12] px ring thickness
 * @param {string} props.label accessible label, e.g. "Occupancy"
 * @param {string} [props.sublabel] small caption under the value
 */
export function Donut({ value, size = 132, stroke = 12, label, sublabel }) {
  const gradId = useId();
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (pct / 100) * c;

  return (
    <div
      role="img"
      aria-label={`${label}: ${Math.round(pct)} percent`}
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E5BA9" />
            <stop offset="100%" stopColor="#2F4785" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E8E2D7"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          className="transition-colors duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-semibold text-[#24221F] tabular-nums tracking-tight">
          {Math.round(pct)}%
        </span>
        {sublabel && (
          <span className="mt-0.5 px-2 text-[11px] font-medium text-[#6F6A62] leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
