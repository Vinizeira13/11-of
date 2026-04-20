import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type KitOption = {
  slug: string;
  kind: "home" | "away";
  label: string;
  /** Thumbnail URL of the kit's packshot. */
  thumbUrl: string;
  /** Whether this is the product currently being viewed. */
  current: boolean;
};

/**
 * Kit switcher — replaces the old fake "Away / Third coming soon" teaser
 * with real links to the sibling kit (home ↔ away) when it exists.
 *
 * Renders nothing when the team only has a single kit listed.
 */
export function ColorSwatches({
  options,
  teamCode,
}: {
  options: KitOption[];
  teamCode: string;
}) {
  if (options.length < 2) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">
          Versão{" "}
          <span className="text-muted-foreground font-normal">· {teamCode}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {options.find((o) => o.current)?.kind === "home"
            ? "Home · visualizando"
            : "Away · visualizando"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {options.map((o) => {
          const content = (
            <div
              className={cn(
                "relative size-16 overflow-hidden rounded-xl border-2 transition",
                o.current
                  ? "border-turf shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--turf)]"
                  : "border-border/60 hover:border-foreground/80",
              )}
            >
              <Image
                src={o.thumbUrl}
                alt={`${o.label} ${teamCode}`}
                fill
                sizes="64px"
                className="object-cover"
              />
              {o.current && (
                <span className="absolute inset-0 flex items-center justify-center bg-turf/25 backdrop-blur-[1px]">
                  <Check className="size-5 text-white drop-shadow" />
                </span>
              )}
            </div>
          );
          return (
            <div key={o.slug} className="flex flex-col items-center gap-1.5">
              {o.current ? (
                <span aria-current="page" className="cursor-default">
                  {content}
                </span>
              ) : (
                <Link href={`/produtos/${o.slug}`} aria-label={`Ver ${o.label}`}>
                  {content}
                </Link>
              )}
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  o.current ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {o.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
