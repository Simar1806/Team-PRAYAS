import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { Card } from "./Card";

const TONES = {
  pine: "bg-[#ECEFF8] text-[#3E5BA9]",
  mint: "bg-[#E5F2E9] text-[#2F855A]",
  clay: "bg-[#F8E7DE] text-[#9A4A2E]",
  brass: "bg-[#FDF6E6] text-[#87600F]",
  lavender: "bg-[#EEE9F6] text-[#5B4590]",
  danger: "bg-[#FBEAE6] text-[#B5483B]",
};

const TREND_STYLES = {
  up: { icon: TrendingUp, cls: "text-[#2F855A]" },
  down: { icon: TrendingDown, cls: "text-[#B5483B]" },
  flat: { icon: Minus, cls: "text-[#6F6A62]" },
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
    <Card className={cn("stat-card flex items-start gap-4 p-5", className)}>
      {Icon && (
        <span
          className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", TONES[tone] ?? TONES.pine)}
          aria-hidden="true"
        >
          <Icon className="size-[18px]" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#6F6A62]">{label}</p>
        <p className="mt-1 font-display text-2xl xl:text-[1.6rem] leading-tight font-semibold tracking-tight text-[#24221F] tabular-nums">
          {value}
        </p>
        {trend && TrendIcon && (
          <p className={cn("mt-2.5 flex items-center gap-1.5 text-[12px] font-medium", trendStyle.cls)}>
            <TrendIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{trend.text}</span>
          </p>
        )}
      </div>
    </Card>
  );
}
