import { cn } from "../../lib/cn";

/** Responsive page container — centers content with fluid gutters. */
export function Page({ className, children, ...rest }) {
  return (
    <div className={cn("mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-8", className)} {...rest}>
      {children}
    </div>
  );
}

/**
 * Consistent page heading: eyebrow, display title, description, actions.
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.actions]
 */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="page-eyebrow mb-1.5 text-[11px] font-bold tracking-[0.16em] text-[#087CC9] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#17191D] sm:text-3xl lg:text-[2rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#696B70]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
