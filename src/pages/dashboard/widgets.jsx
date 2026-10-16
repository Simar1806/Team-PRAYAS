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
  complaint: "bg-[#B43B3B]",
  room: "bg-[#087CC9]",
  announcement: "bg-[#F2C316]",
  mess: "bg-[#16865A]",
  maintenance: "bg-[#7E296A]",
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
            <span className="absolute top-5 left-[6.5px] h-[calc(100%-8px)] w-px bg-[#E8EDF0]" aria-hidden="true" />
          )}
          <span
            className={cn(
              "mt-1.5 size-3.5 shrink-0 rounded-full ring-3 ring-white",
              KIND_DOTS[item.kind] ?? "bg-[#696B70]",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#17191D] leading-snug">
              <span className="font-semibold text-[#17191D]">{item.actor}</span>{" "}
              <span className="text-[#52555B]">{item.text.charAt(0).toLowerCase() + item.text.slice(1)}</span>
            </p>
            <p className="mt-0.5 text-xs text-[#696B70]">{timeAgo(item.at)}</p>
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
              className="group rounded-xl border border-[#E8EDF0] bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#087CC9]/40 hover:shadow-card hover:bg-[#F3FAFC]"
            >
              <span
                className="inline-flex size-9 items-center justify-center rounded-xl bg-[#E6F3FC] text-[#087CC9] transition-all duration-200 group-hover:bg-[#087CC9] group-hover:text-white"
                aria-hidden="true"
              >
                <Icon className="size-4.5" />
              </span>
              <span className="mt-2.5 block text-sm font-semibold text-[#17191D] group-hover:text-[#0866A8]">
                {label}
              </span>
              <span className="mt-0.5 block text-xs text-[#696B70] line-clamp-1">{hint}</span>
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
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087CC9] transition-all duration-150 hover:gap-2 hover:text-[#0866A8]"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
