import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountdownTimer } from "@/components/loja/CountdownTimer";
import { RevealText } from "@/components/loja/animations/RevealText";
import { MaskReveal } from "@/components/loja/animations/MaskReveal";
import { PIX_DISCOUNT_PCT, WORLD_CUP_OPENING } from "@/lib/brand";
import { TEAMS } from "@/lib/teams";

const HERO_IMAGE =
  "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/bra/005_nike-football-2026-federation-kits-brasil-vini-jr.webp";

const HERO_ALT_IMAGE =
  "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/fra/015_nike-football-2026-federation-kits-france-kylian-mbappe.webp";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/60">
      {/* Ambient gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[900px] w-[1400px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.82_0.22_140/0.18),transparent_60%)] blur-3xl"
      />

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 px-6 pb-16 pt-10 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-16">
        {/* Left: editorial kicker + title + CTA */}
        <div className="lg:col-span-6 lg:pt-6">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border/80 bg-card/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/80 backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turf opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-turf" />
            </span>
            Coleção Copa 2026 · Abertura 11.jun
          </div>

          <h1 className="font-display text-[clamp(3.2rem,10vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.03em]">
            <span className="block">
              <RevealText as="span" delay={0.05} stagger={0.02}>
                Veste a tua
              </RevealText>
            </span>
            <span className="block italic font-editorial font-normal text-turf">
              <RevealText as="span" delay={0.4} stagger={0.02}>
                seleção.
              </RevealText>
            </span>
          </h1>

          <MaskReveal direction="up" delay={0.8}>
            <p className="mt-8 max-w-md text-base leading-relaxed text-foreground/70">
              {TEAMS.length} seleções, home e away. Coleção oficial Nike,
              tiragem controlada, despacho em 24h. Pague no PIX e ganhe{" "}
              <span className="font-semibold text-foreground">
                {PIX_DISCOUNT_PCT}% OFF
              </span>
              .
            </p>
          </MaskReveal>

          <MaskReveal direction="up" delay={1.0}>
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-border/70 bg-card/40 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Faltam para o pontapé inicial
                </p>
                <div className="mt-1">
                  <CountdownTimer to={WORLD_CUP_OPENING} label="" />
                </div>
              </div>
            </div>
          </MaskReveal>

          <MaskReveal direction="up" delay={1.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/produtos"
                className="group inline-flex items-center gap-2 rounded-full bg-turf px-7 py-3.5 text-sm font-semibold text-turf-foreground transition hover:bg-turf/90"
              >
                Ver todas as camisas
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/produtos/camisa-brasil-home-2026"
                className="inline-flex items-center gap-2 rounded-full border border-border/80 px-7 py-3.5 text-sm font-medium hover:border-foreground transition"
              >
                <span aria-hidden>🇧🇷</span> Brasil primeiro
              </Link>
            </div>
          </MaskReveal>
        </div>

        {/* Right: dual-image editorial montage */}
        <div className="relative lg:col-span-6">
          <MaskReveal direction="left" duration={1.2} delay={0.2}>
            <div className="relative grid grid-cols-12 grid-rows-6 gap-3 h-[640px] sm:h-[720px]">
              {/* Main tall image */}
              <div className="relative col-span-8 row-span-6 overflow-hidden rounded-3xl bg-muted">
                <Image
                  src={HERO_IMAGE}
                  alt="Camisa Brasil Copa 2026 - Vini Jr"
                  fill
                  priority
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/80">
                      Capa · Edição Brasil
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold text-white">
                      Vini Jr · 20
                    </p>
                  </div>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                    Home
                  </span>
                </div>
              </div>

              {/* Secondary square image */}
              <div className="relative col-span-4 row-span-3 overflow-hidden rounded-3xl bg-muted">
                <Image
                  src={HERO_ALT_IMAGE}
                  alt="Kylian Mbappé - França"
                  fill
                  sizes="(min-width:1024px) 16vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                  🇫🇷 Mbappé
                </div>
              </div>

              {/* Stat card */}
              <div className="col-span-4 row-span-3 flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Seleções
                  </p>
                  <p className="mt-1 font-display text-4xl font-semibold tabular-nums">
                    {String(TEAMS.length).padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Categorias
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    Home & Away · Oficial Nike
                  </p>
                </div>
                <p className="text-[10px] leading-snug text-muted-foreground">
                  Tiragem controlada. Quando esgotar, acabou.
                </p>
              </div>
            </div>
          </MaskReveal>
        </div>
      </div>
    </section>
  );
}
