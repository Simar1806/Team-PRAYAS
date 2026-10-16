import { cn } from "../../lib/cn";

const TONES = {
  pine: "bg-[#E6F3FC] text-[#0866A8] border border-[#087CC9]/20",
  mint: "bg-[#E2F6ED] text-[#16865A] border border-[#16865A]/20",
  sand: "bg-[#F3FAFC] text-[#696B70] border border-[#E8EDF0]",
  clay: "bg-[#F3E1F0] text-[#7E296A] border border-[#7E296A]/20",
  brass: "bg-[#FEFAEB] text-[#8C6D04] border border-[#F2C316]/35",
  danger: "bg-[#FDE8E8] text-[#B43B3B] border border-[#B43B3B]/20",
  neutral: "bg-[#F3FAFC] text-[#696B70] border border-[#E8EDF0]",
  ok: "bg-[#E2F6ED] text-[#16865A] border border-[#16865A]/20",
  info: "bg-[#E6F3FC] text-[#087CC9] border border-[#087CC9]/20",
  warn: "bg-[#FEFAEB] text-[#8C6D04] border border-[#F2C316]/35",
  lavender: "bg-[#EDE5F7] text-[#5B3A8C] border border-[#5B3A8C]/20",
  pink: "bg-[#F3E1F0] text-[#7E296A] border border-[#7E296A]/20",
  gold: "bg-[#FEFAEB] text-[#8C6D04] border border-[#F2C316]/40",
};

const DOT_TONES = {
  pine: "bg-[#0866A8]",
  mint: "bg-[#16865A]",
  sand: "bg-[#93969C]",
  clay: "bg-[#7E296A]",
  brass: "bg-[#C2990B]",
  danger: "bg-[#B43B3B]",
  neutral: "bg-[#93969C]",
  ok: "bg-[#16865A]",
  info: "bg-[#087CC9]",
  warn: "bg-[#C2990B]",
  lavender: "bg-[#5B3A8C]",
  pink: "bg-[#7E296A]",
  gold: "bg-[#F2C316]",
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
        "inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide whitespace-nowrap",
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
