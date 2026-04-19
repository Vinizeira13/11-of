import { PRESS_QUOTES } from "@/data/press";
import { Marquee } from "./Marquee";

export function PressBand() {
  const items = [...PRESS_QUOTES, ...PRESS_QUOTES];
  return (
    <section
      aria-label="Na imprensa"
      className="mx-auto max-w-[1440px] px-6 py-16 md:py-20"
    >
      <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground text-center">
        Vista na imprensa
      </p>
      <Marquee duration={60}>
        {items.map((q, i) => (
          <div
            key={`${q.source}-${i}`}
            className="mx-10 flex max-w-md items-center gap-4 py-2"
          >
            <span className="font-display text-xl font-semibold text-muted-foreground">
              {q.source}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-border" />
            <span className="font-editorial italic text-lg text-foreground/80">
              &ldquo;{q.quote}&rdquo;
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
