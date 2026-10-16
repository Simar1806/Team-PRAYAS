import { createContext, forwardRef, useContext, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

const FieldContext = createContext(null);

/**
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} [props.required]
 * @param {string} [props.hint]
 * @param {string} [props.error]
 */
export function Field({ label, required, hint, error, className, children }) {
  const uid = useId();
  const inputId = `field-${uid}`;
  const hintId = `field-${uid}-hint`;
  const errorId = `field-${uid}-error`;
  return (
    <FieldContext.Provider value={{ inputId, hintId, errorId, hasError: Boolean(error) }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={inputId} className="text-[11px] font-bold tracking-[0.08em] text-[#17191D] uppercase">
          {label}
          {required && (
            <span className="ml-1 text-[#B43B3B]" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
        {children}
        {hint && !error && (
          <p id={hintId} className="text-xs text-[#696B70]">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-semibold text-[#B43B3B]">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

function useField() {
  const ctx = useContext(FieldContext);
  const fallbackId = useId();
  return ctx ?? { inputId: fallbackId, hintId: "", errorId: "", hasError: false };
}

function describedBy(ctx, hint) {
  const ids = [];
  if (hint) ids.push(ctx.hintId);
  if (ctx.hasError) ids.push(ctx.errorId);
  return ids.length ? ids.join(" ") : undefined;
}

const inputClasses = (hasError) =>
  cn(
    "h-10.5 w-full rounded-xl border bg-white px-3.5 text-sm text-[#17191D] transition-all duration-150 outline-none",
    "placeholder:text-[#696B70]/60",
    hasError
      ? "border-[#B43B3B] focus:border-[#B43B3B] focus:ring-3 focus:ring-[#B43B3B]/15"
      : "border-[#E8EDF0] hover:border-[#087CC9]/40 focus:border-[#087CC9] focus:ring-3 focus:ring-[#087CC9]/15",
    "disabled:cursor-not-allowed disabled:bg-[#F3FAFC] disabled:text-[#696B70]/60",
  );

export const TextInput = forwardRef(function TextInput({ hint, className, id, ...rest }, ref) {
  const ctx = useField();
  return (
    <input
      ref={ref}
      id={id ?? ctx.inputId}
      aria-invalid={ctx.hasError || undefined}
      aria-describedby={describedBy(ctx, hint)}
      className={cn(inputClasses(ctx.hasError), className)}
      {...rest}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ hint, className, id, rows = 4, ...rest }, ref) {
  const ctx = useField();
  return (
    <textarea
      ref={ref}
      id={id ?? ctx.inputId}
      rows={rows}
      aria-invalid={ctx.hasError || undefined}
      aria-describedby={describedBy(ctx, hint)}
      className={cn(inputClasses(ctx.hasError), "h-auto min-h-24 py-2.5 leading-relaxed", className)}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select({ hint, className, id, children, ...rest }, ref) {
  const ctx = useField();
  return (
    <div className="relative">
      <select
        ref={ref}
        id={id ?? ctx.inputId}
        aria-invalid={ctx.hasError || undefined}
        aria-describedby={describedBy(ctx, hint)}
        className={cn(inputClasses(ctx.hasError), "cursor-pointer appearance-none pr-10", className)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#696B70]"
        aria-hidden="true"
      />
    </div>
  );
});
