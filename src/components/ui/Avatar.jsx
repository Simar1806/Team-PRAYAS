import { cn } from "../../lib/cn";

const PALETTE = [
  "bg-[#ECEFF8] text-[#2F4785] ring-1 ring-[#3E5BA9]/20",
  "bg-[#E5F2E9] text-[#2F855A] ring-1 ring-[#2F855A]/20",
  "bg-[#EEE9F6] text-[#5B4590] ring-1 ring-[#5B4590]/20",
  "bg-[#F8E7DE] text-[#9A4A2E] ring-1 ring-[#9A4A2E]/20",
  "bg-[#FDF6E6] text-[#87600F] ring-1 ring-[#E2A93B]/35",
  "bg-[#3E5BA9] text-white ring-1 ring-[#2F4785]/30",
];

const SIZES = {
  xs: "size-6.5 text-[10px]",
  sm: "size-8.5 text-xs",
  md: "size-10 text-xs font-bold",
  lg: "size-13 text-sm font-bold",
};

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pick(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/**
 * @param {object} props
 * @param {string} props.name
 * @param {"xs"|"sm"|"md"|"lg"} [props.size="md"]
 */
export function Avatar({ name, size = "md", className }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold shadow-xs select-none",
        SIZES[size],
        pick(name),
        className,
      )}
      role="img"
      aria-label={name}
    >
      <span aria-hidden="true">{initials(name)}</span>
    </span>
  );
}
