import { cn } from "../../lib/cn";

const TONES = {
  pine: "bg-[#ECEFF8] text-[#2F4785] border border-[#3E5BA9]/20",
  mint: "bg-[#E5F2E9] text-[#2F855A] border border-[#2F855A]/20",
  sand: "bg-[#F7F4EE] text-[#6F6A62] border border-[#E8E2D7]",
  clay: "bg-[#F8E7DE] text-[#9A4A2E] border border-[#9A4A2E]/20",
  brass: "bg-[#FDF6E6] text-[#87600F] border border-[#E2A93B]/35",
  danger: "bg-[#FBEAE6] text-[#B5483B] border border-[#B5483B]/20",
  neutral: "bg-[#F7F4EE] text-[#6F6A62] border border-[#E8E2D7]",
  ok: "bg-[#E5F2E9] text-[#2F855A] border border-[#2F855A]/20",
  info: "bg-[#ECEFF8] text-[#3E5BA9] border border-[#3E5BA9]/20",
  warn: "bg-[#FDF6E6] text-[#87600F] border border-[#E2A93B]/35",
  lavender: "bg-[#EEE9F6] text-[#5B4590] border border-[#5B4590]/20",
  pink: "bg-[#F8E7DE] text-[#9A4A2E] border border-[#9A4A2E]/20",
  gold: "bg-[#FDF6E6] text-[#87600F] border border-[#E2A93B]/40",
};

const DOT_TONES = {
  pine: "bg-[#2F4785]",
  mint: "bg-[#2F855A]",
  sand: "bg-[#A39D92]",
  clay: "bg-[#9A4A2E]",
  brass: "bg-[#B9862A]",
  danger: "bg-[#B5483B]",
  neutral: "bg-[#A39D92]",
  ok: "bg-[#2F855A]",
  info: "bg-[#3E5BA9]",
  warn: "bg-[#B9862A]",
  lavender: "bg-[#5B4590]",
  pink: "bg-[#9A4A2E]",
  gold: "bg-[#E2A93B]",
};

/**
 * Status badge with paired color and optional dot.
 * @param {object} props
 * @param {"pine"|"mint"|"sand"|"clay"|"brass"|"danger"|"neutral"|"ok"|"info"|"warn"|"lavender"|"pink"|"gold"} [props.tone="neutral"]
 * @param {boolean} [props.dot=false]
 * @param {"sm"|"md"} [props.size="sm"]
 * @param {React.ReactNode} props.children
 */
export function Badge({ tone = "neutral", dot = false, size = "sm", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", DOT_TONES[tone] ?? DOT_TONES.neutral)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
