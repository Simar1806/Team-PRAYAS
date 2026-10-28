import { cn } from "../../lib/cn";

/** Responsive page container — centers content with fluid gutters. */
export function Page({ className, children, ...rest }) {
  return (
    <div className={cn("mx-auto w-full max-w-[84rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10", className)} {...rest}>
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
    <div className="page-header mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#E8E2D7] pb-6 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="page-eyebrow mb-2 text-[13px] font-medium text-[#9A7B4F]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-tight text-[#24221F] sm:text-[2rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6F6A62]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
