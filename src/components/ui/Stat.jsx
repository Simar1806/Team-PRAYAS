import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { Card } from "./Card";

const TONES = {
  pine: "bg-[#E6F3FC] text-[#087CC9] border border-[#087CC9]/20",
  mint: "bg-[#E2F6ED] text-[#16865A] border border-[#16865A]/20",
  clay: "bg-[#F3E1F0] text-[#7E296A] border border-[#7E296A]/20",
  brass: "bg-[#FEFAEB] text-[#8C6D04] border border-[#F2C316]/35",
  lavender: "bg-[#EDE5F7] text-[#5B3A8C] border border-[#5B3A8C]/20",
  danger: "bg-[#FDE8E8] text-[#B43B3B] border border-[#B43B3B]/20",
};

const TREND_STYLES = {
  up: { icon: TrendingUp, cls: "text-[#16865A]" },
  down: { icon: TrendingDown, cls: "text-[#B43B3B]" },
  flat: { icon: Minus, cls: "text-[#696B70]" },
};

/**
 * Dashboard stat card.
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {React.ComponentType} props.icon
 * @param {{direction: "up"|"down"|"flat", text: string}} [props.trend]
 * @param {"pine"|"mint"|"clay"|"brass"|"lavender"|"danger"} [props.tone="pine"]
 */
export function Stat({ label, value, icon: Icon, trend, tone = "pine", className }) {
  const trendStyle = trend ? TREND_STYLES[trend.direction] : null;
  const TrendIcon = trendStyle?.icon;
  return (
    <Card hoverable className={cn("stat-card p-5 sm:p-5.5 flex flex-col justify-between", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#696B70] uppercase">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              TONES[tone] ?? TONES.pine,
            )}
            aria-hidden="true"
          >
            <Icon className="size-4.5" />
          </span>
        )}
      </div>

      <div className="mt-2.5">
        <p className="font-display text-2xl sm:text-[1.85rem] font-bold tracking-tight text-[#17191D] tabular-nums">
          {value}
        </p>
        {trend && TrendIcon && (
          <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs font-semibold", trendStyle.cls)}>
            <TrendIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{trend.text}</span>
          </p>
        )}
      </div>
    </Card>
  );
}
