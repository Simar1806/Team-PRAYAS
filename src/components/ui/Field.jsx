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
        <label htmlFor={inputId} className="text-[13px] font-medium text-[#24221F]">
          {label}
          {required && (
            <span className="ml-1 text-[#B5483B]" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
        {children}
        {hint && !error && (
          <p id={hintId} className="text-xs text-[#6F6A62]">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-semibold text-[#B5483B]">
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
    "h-10 w-full rounded-lg border bg-white px-3.5 text-sm text-[#24221F] transition-colors duration-150 outline-none",
    "placeholder:text-[#6F6A62]/60",
    hasError
      ? "border-[#B5483B] focus:border-[#B5483B] focus:ring-3 focus:ring-[#B5483B]/15"
      : "border-[#E8E2D7] hover:border-[#DCD4C6] focus:border-[#3E5BA9] focus:ring-3 focus:ring-[#3E5BA9]/15",
    "disabled:cursor-not-allowed disabled:bg-[#F7F4EE] disabled:text-[#6F6A62]/60",
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
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#6F6A62]"
        aria-hidden="true"
      />
    </div>
  );
});
