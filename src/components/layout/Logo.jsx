import { cn } from "../../lib/cn";

export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#4A66B5] to-[#2F4785] shadow-md shadow-[#1C2742]/25",
        className,
      )}
      aria-hidden="true"
    >
      <span className="relative z-10 font-display text-lg font-semibold text-white">
        H
      </span>
      <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[#E2A93B] ring-2 ring-white/30" />
      <span className="absolute -bottom-2 -left-2 size-6 rounded-full bg-white/10 blur-[1px]" />
    </span>
  );
}

export function Logo({ onDark = false, compact = false }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span
            className={cn(
              "block font-display text-[22px] font-semibold tracking-tight",
              onDark ? "text-white" : "text-[#24221F]",
            )}
          >
            Haven
            <span className="text-[#E2A93B]">.</span>
          </span>
          <span
            className={cn(
              "block text-[11px] font-semibold",
              onDark ? "text-white/45" : "text-[#6F6A62]",
            )}
          >
            Hostel Management
          </span>
        </span>
      )}
    </span>
  );
}
