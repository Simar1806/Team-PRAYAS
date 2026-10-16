import { cn } from "../../lib/cn";

const PALETTE = [
  "bg-[#E6F3FC] text-[#0866A8] ring-1 ring-[#087CC9]/20",
  "bg-[#E2F6ED] text-[#16865A] ring-1 ring-[#16865A]/20",
  "bg-[#EDE5F7] text-[#5B3A8C] ring-1 ring-[#5B3A8C]/20",
  "bg-[#F3E1F0] text-[#7E296A] ring-1 ring-[#7E296A]/20",
  "bg-[#FEFAEB] text-[#8C6D04] ring-1 ring-[#F2C316]/35",
  "bg-[#087CC9] text-white ring-1 ring-[#0866A8]/30",
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
