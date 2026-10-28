import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

const ToastContext = createContext(() => {});

/**
 * Push a toast notification. Tone is one of "success", "error" or "info".
 * @returns {Function} push(tone, title, description)
 */
export function useToast() {
  return useContext(ToastContext);
}

const TONE_STYLES = {
  success: { icon: CheckCircle2, bar: "bg-[#2F855A]", iconCls: "text-[#2F855A]", bg: "bg-[#E5F2E9]/40" },
  error: { icon: AlertTriangle, bar: "bg-[#B5483B]", iconCls: "text-[#B5483B]", bg: "bg-[#FBEAE6]/40" },
  info: { icon: Info, bar: "bg-[#3E5BA9]", iconCls: "text-[#3E5BA9]", bg: "bg-[#ECEFF8]/40" },
};

function ToastCard({ item, onDismiss }) {
  const style = TONE_STYLES[item.tone] ?? TONE_STYLES.info;
  const Icon = style.icon;
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full items-start gap-3 overflow-hidden rounded-xl border border-[#E8E2D7] bg-white pr-2.5 shadow-pop animate-toast-in"
    >
      <span className={cn("w-1.5 self-stretch shrink-0", style.bar)} aria-hidden="true" />
      <span className={cn("py-3", style.iconCls)} aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 py-2.5">
        <p className="text-sm font-bold text-[#24221F]">{item.title}</p>
        {item.description && <p className="mt-0.5 text-xs text-[#6F6A62] leading-relaxed">{item.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="mt-2.5 rounded-lg p-1 text-[#6F6A62] transition-colors hover:bg-[#F7F4EE] hover:text-[#24221F]"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone, title, description) => {
      const id = nextId.current++;
      setItems((prev) => [...prev.slice(-3), { id, tone, title, description }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
        >
          {items.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
