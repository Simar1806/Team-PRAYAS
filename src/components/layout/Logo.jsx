import { cn } from "../../lib/cn";

export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#087CC9] to-[#0866A8] shadow-md shadow-[#087CC9]/20",
        className,
      )}
      aria-hidden="true"
    >
      <span className="relative z-10 font-display text-lg font-extrabold tracking-tight text-white">
        H
      </span>
      <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[#F2C316] ring-2 ring-white/30" />
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
              "block font-display text-[21px] font-bold tracking-tight",
              onDark ? "text-white" : "text-[#17191D]",
            )}
          >
            Haven
            <span className="text-[#087CC9]">.</span>
          </span>
          <span
            className={cn(
              "block text-[10px] font-bold tracking-[0.16em] uppercase",
              onDark ? "text-white/60" : "text-[#696B70]",
            )}
          >
            Hostel Management
          </span>
        </span>
      )}
    </span>
  );
}
