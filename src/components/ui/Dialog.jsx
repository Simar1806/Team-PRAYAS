import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Accessible dialog: Escape closes, overlay click closes, focus moves into
 * the dialog on open and is trapped while open, body scroll is locked.
 * Renders as a bottom sheet on small screens.
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]
 * @param {boolean} [props.wide=false]
 */
export function Dialog({ open, onClose, title, description, children, footer, wide = false }) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  // Parents pass a new onClose function on every render (e.g. while typing in
  // a form). Keep the latest one in a ref so the open/focus effect runs only
  // when the dialog actually opens, instead of stealing focus on each keystroke.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusables?.[0] ?? panel)?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key === "Tab" && panel) {
        const items = Array.from(
          panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = "";
      if (previousFocus.current && previousFocus.current.focus) previousFocus.current.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-[#1A1815]/40 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90dvh] w-full flex-col overflow-hidden border border-[#E8E2D7] bg-white shadow-pop outline-none",
          "rounded-t-2xl sm:rounded-2xl animate-drawer-in sm:animate-fade-in",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7 sm:pt-6 border-b border-[#E8E2D7]/60 pb-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#24221F]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-xs sm:text-sm text-[#6F6A62]">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[#6F6A62] transition-colors hover:bg-[#F7F4EE] hover:text-[#24221F]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 sm:px-7 sm:py-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2.5 border-t border-[#E8E2D7] bg-[#F7F4EE]/50 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
