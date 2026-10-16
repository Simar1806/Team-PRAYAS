import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary:
    "bg-[#087CC9] text-white shadow-xs shadow-[#087CC9]/20 hover:bg-[#0866A8] hover:-translate-y-px hover:shadow-md hover:shadow-[#087CC9]/25 active:translate-y-0 active:bg-[#054D80]",
  secondary:
    "bg-white text-[#17191D] border border-[#E8EDF0] shadow-xs hover:border-[#087CC9] hover:bg-[#F3FAFC] hover:text-[#0866A8] hover:-translate-y-px hover:shadow-xs active:translate-y-0 active:bg-[#EBF4F8]",
  ghost:
    "text-[#696B70] hover:text-[#087CC9] hover:bg-[#E6F3FC] active:bg-[#D2EAF8]",
  danger:
    "bg-[#B43B3B] text-white shadow-xs shadow-[#B43B3B]/20 hover:bg-[#962E2E] hover:-translate-y-px hover:shadow-md hover:shadow-[#B43B3B]/25 active:translate-y-0",
  mint:
    "bg-[#16865A] text-white shadow-xs hover:bg-[#126E4A] hover:-translate-y-px active:translate-y-0",
  lavender:
    "bg-[#EDE5F7] text-[#5B3A8C] hover:bg-[#E1D4F2] hover:-translate-y-px active:translate-y-0",
};

const SIZES = {
  sm: "h-8.5 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11.5 px-5 text-sm gap-2.5 rounded-xl font-bold",
};

/**
 * Haven button.
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"|"danger"|"mint"|"lavender"} [props.variant="primary"]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {boolean} [props.loading=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {boolean} [props.fullWidth=false]
 * @param {React.ReactNode} props.children
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087CC9] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {!loading && rightIcon && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
