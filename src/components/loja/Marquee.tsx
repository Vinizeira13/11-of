import { cn } from "@/lib/utils";

/**
 * Pure-CSS infinite horizontal marquee. Duplicates children so the loop is
 * seamless. Respects prefers-reduced-motion via `--marquee-duration: 0s` fallback.
 */
export function Marquee({
  children,
  duration = 40,
  className,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-max shrink-0 items-center animate-marquee-x",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
