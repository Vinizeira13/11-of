import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Full-bleed in-flow banner used mid-scroll on home/catalog.
 */
export function MidBanner({
  href = "/produtos/camisa-brasil-home-2026",
  image,
  kicker = "Capítulo I",
  title = "Rumo ao hexa.",
  subtitle = "A nova camisa da Seleção Brasileira chegou. Tiragem controlada — quando esgotar, acabou.",
  cta = "Comprar agora",
}: {
  href?: string;
  image?: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
}) {
  const img =
    image ??
    "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/bra/005_nike-football-2026-federation-kits-brasil-vini-jr.webp";

  return (
    <section className="mx-auto max-w-[1440px] px-0 py-10 md:px-6 md:py-14">
      <Link
        href={href}
        className="group relative block h-[520px] overflow-hidden bg-muted md:rounded-3xl md:h-[520px]"
      >
        <Image
          src={img}
          alt={title}
          fill
          sizes="(min-width:1440px) 1408px, 100vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
        />
        <div className="relative flex h-full flex-col justify-end gap-6 p-8 md:justify-center md:p-16">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
              {kicker}
            </p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
              {subtitle}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-turf px-6 py-3 text-sm font-semibold text-turf-foreground transition group-hover:bg-turf/90">
              {cta}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
