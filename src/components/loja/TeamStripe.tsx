import { Marquee } from "./Marquee";
import { TEAMS } from "@/lib/teams";

/**
 * Horizontal marquee of team flags + codes. Acts as decorative yet functional
 * transition strip between home sections. Clickable — each entry links to the
 * product.
 */
export function TeamStripe() {
  const items = [...TEAMS, ...TEAMS];
  return (
    <section
      aria-label="Seleções participantes"
      className="border-y border-border/60 bg-card/30"
    >
      <Marquee duration={60} className="py-6">
        {items.map((t, i) => (
          <a
            key={`${t.code}-${i}`}
            href={`/produtos/${t.slug}`}
            className="mx-8 inline-flex items-center gap-3 text-foreground/80 hover:text-foreground transition"
          >
            <span aria-hidden className="text-2xl">
              {t.flag}
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              {t.shortName}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t.code} · {t.confederation}
            </span>
          </a>
        ))}
      </Marquee>
    </section>
  );
}
