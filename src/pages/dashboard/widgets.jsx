import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn.js";
import { timeAgo } from "../../data/selectors.js";
import { Card, CardBody, CardHeader } from "../../components/ui/index.js";

/* Shared building blocks for both dashboards. Exact palette mappings. */

export const STATUS_TONES = { submitted: "warn", in_progress: "info", resolved: "ok" };
export const STATUS_LABELS = { submitted: "Submitted", in_progress: "In Progress", resolved: "Resolved" };
export const PRIORITY_TONES = { low: "neutral", medium: "info", high: "clay", urgent: "danger" };
export const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

const KIND_DOTS = {
  complaint: "bg-[#B5483B]",
  room: "bg-[#3E5BA9]",
  announcement: "bg-[#E2A93B]",
  mess: "bg-[#2F855A]",
  maintenance: "bg-[#9A4A2E]",
};

/**
 * @param {object} props
 * @param {Array<{id: string, at: Date, actor: string, text: string, kind: string}>} props.items
 */
export function ActivityTimeline({ items }) {
  return (
    <ol className="relative space-y-4">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3.5 items-start">
          {i < items.length - 1 && (
            <span className="absolute top-5 left-[6.5px] h-[calc(100%-8px)] w-px bg-[#E8E2D7]" aria-hidden="true" />
          )}
          <span
            className={cn(
              "mt-1.5 size-3.5 shrink-0 rounded-full ring-3 ring-white",
              KIND_DOTS[item.kind] ?? "bg-[#6F6A62]",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#24221F] leading-snug">
              <span className="font-semibold text-[#24221F]">{item.actor}</span>{" "}
              <span className="text-[#58534B]">{item.text.charAt(0).toLowerCase() + item.text.slice(1)}</span>
            </p>
            <p className="mt-0.5 text-xs text-[#6F6A62]">{timeAgo(item.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Grid of navigation tiles.
 * @param {object} props
 * @param {Array<{to: string, icon: React.ComponentType, label: string, hint: string}>} props.actions
 */
export function QuickActionTiles({ actions }) {
  return (
    <Card>
      <CardHeader title="Quick actions" subtitle="Jump straight to what you need" />
      <CardBody>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(({ to, icon: Icon, label, hint }) => (
            <Link
              key={to + label}
              to={to}
              className="group rounded-xl border border-[#E8E2D7] bg-white p-3.5 transition-colors duration-150 hover:border-[#DCD4C6] hover:bg-[#FAF8F3]"
            >
              <span
                className="inline-flex size-9 items-center justify-center rounded-lg bg-[#F0ECE4] text-[#58534B] transition-colors duration-150 group-hover:bg-[#ECEFF8] group-hover:text-[#3E5BA9]"
                aria-hidden="true"
              >
                <Icon className="size-4.5" />
              </span>
              <span className="mt-2.5 block text-sm font-medium text-[#24221F]">
                {label}
              </span>
              <span className="mt-0.5 block text-xs text-[#6F6A62] line-clamp-1">{hint}</span>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/** "View all →" footer link used inside cards. */
export function CardMoreLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3E5BA9] transition-colors duration-150 hover:text-[#2F4785]"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
