import { cn } from "../../lib/cn.js";

/**
 * Labeled progress bar (occupancy, capacity, completion).
 * @param {object} props
 * @param {number} props.value 0–100
 * @param {string} props.label accessible label
 * @param {"primary"|"success"|"danger"} [props.tone="primary"]
 * @param {string} [props.className]
 */
export function ProgressBar({ value, label, tone = "primary", className }) {
  const pct = Math.max(0, Math.min(100, value));
  const toneClasses = {
    primary: "bg-gradient-to-r from-[#087CC9] to-[#0866A8]",
    success: "bg-[#16865A]",
    danger: "bg-[#B43B3B]",
  };

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[#E8EDF0]", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          toneClasses[tone] ?? toneClasses.primary,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
