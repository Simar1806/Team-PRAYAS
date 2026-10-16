import { cn } from "../../lib/cn";

/**
 * @param {object} props
 * @param {boolean} [props.hoverable=false] adds a subtle elevation lift on hover
 */
export function Card({ hoverable = false, className, ...rest }) {
  return (
    <div
      className={cn(
        "haven-card rounded-2xl border border-[#E8EDF0] bg-white shadow-card",
        hoverable && "is-hoverable cursor-pointer",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ title, subtitle, action, icon, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="min-w-0 flex items-start gap-2.5">
        {icon && (
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E6F3FC] text-[#087CC9]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-[#17191D]">
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-xs sm:text-sm text-[#696B70]">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }) {
  return <div className={cn("px-5 py-5 sm:px-6 sm:py-6", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-[#E8EDF0] bg-[#F3FAFC]/50 px-5 py-3.5 sm:px-6 rounded-b-2xl",
        className,
      )}
      {...rest}
    />
  );
}
