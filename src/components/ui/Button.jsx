import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary: "bg-[#3E5BA9] text-white hover:bg-[#2F4785] active:bg-[#24376A]",
  secondary:
    "bg-white text-[#24221F] border border-[#E8E2D7] hover:border-[#DCD4C6] hover:bg-[#FAF8F3] active:bg-[#F0ECE4]",
  ghost: "text-[#6F6A62] hover:text-[#24221F] hover:bg-[#F0ECE4] active:bg-[#E8E2D7]",
  danger: "bg-[#B5483B] text-white hover:bg-[#953A2F]",
  mint: "bg-[#2F855A] text-white hover:bg-[#256D49]",
  lavender: "bg-[#EEE9F6] text-[#5B4590] hover:bg-[#E2D9F0]",
};

const SIZES = {
  sm: "h-8.5 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
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
        "inline-flex cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-colors duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E5BA9] focus-visible:ring-offset-2",
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
