import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const BG =
  "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/eng/007_nike-football-2026-federation-kits-england-home-cole-palmer.webp";

export function Manifesto() {
  return (
    <section
      aria-label="Manifesto 11 Of"
      className="relative mx-auto max-w-[1440px] overflow-hidden px-0 py-0 md:px-6 md:py-8"
    >
      <div className="relative h-[560px] overflow-hidden bg-muted md:rounded-3xl md:h-[620px]">
        <Image
          src={BG}
          alt=""
          aria-hidden
          fill
          sizes="(min-width:1440px) 1408px, 100vw"
          className="object-cover object-[30%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-tr from-background via-background/75 to-transparent"
        />

        <div className="relative flex h-full flex-col justify-end p-8 md:p-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Manifesto · 11 Of
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            Onze de linha.{" "}
            <span className="italic font-editorial font-normal text-foreground/75">
              Dezesseis seleções oficiais. Um torneio. Uma coleção.
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-foreground/75 md:text-base">
            A gente acredita que camisa de seleção é o ponto de encontro entre
            religião, arte e território. Por isso a 11 Of existe: curadoria
            obsessiva, peças oficiais Nike, entrega no PIX. Pra quem sabe que
            torcer é sobre pertencer.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-background/30 px-6 py-3 text-sm font-medium backdrop-blur hover:border-foreground hover:bg-background/50 transition"
            >
              Leia o manifesto completo
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 rounded-full bg-turf px-6 py-3 text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
            >
              Ver a coleção
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
