import { cn } from "../../lib/cn";

/**
 * Polished empty state — no-data, no-results and phase placeholders.
 * @param {object} props
 * @param {React.ComponentType} [props.icon] Lucide icon component
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center sm:py-14", className)}>
      {Icon && (
        <span
          className="inline-flex size-13 items-center justify-center rounded-2xl bg-[#ECEFF8] text-[#3E5BA9] border border-[#3E5BA9]/15 shadow-xs"
          aria-hidden="true"
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </span>
      )}
      <h3 className="mt-4 font-display text-lg sm:text-xl font-semibold tracking-tight text-[#24221F]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#6F6A62]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
