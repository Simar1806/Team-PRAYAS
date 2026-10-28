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
    primary: "bg-gradient-to-r from-[#3E5BA9] to-[#2F4785]",
    success: "bg-[#2F855A]",
    danger: "bg-[#B5483B]",
  };

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#F0ECE4]", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-colors duration-500 ease-out",
          toneClasses[tone] ?? toneClasses.primary,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
