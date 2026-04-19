import { cn } from "@/lib/utils";

/**
 * 11 Of wordmark — the "11" is shown stacked and bold (like a jersey number)
 * next to "Of" set in italic serif for editorial contrast.
 */
export function BrandMark({
  className,
  size = "md",
  showDot = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}) {
  const scale = {
    sm: { base: "text-[13px]", num: "text-base" },
    md: { base: "text-sm", num: "text-lg" },
    lg: { base: "text-xl", num: "text-3xl" },
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-display font-semibold tracking-tight",
        scale.base,
        className,
      )}
      aria-label="11 Of"
    >
      <span
        className={cn(
          "font-display font-bold leading-none tabular-nums",
          scale.num,
        )}
      >
        11
      </span>
      {showDot && (
        <span aria-hidden className="size-1 rounded-full bg-turf" />
      )}
      <span className="font-editorial italic leading-none">Of</span>
    </span>
  );
}
