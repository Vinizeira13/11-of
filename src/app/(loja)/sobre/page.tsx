import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Shield, Zap, Flag, Package, Heart } from "lucide-react";
import { BRAND_NAME, BRAND_MANIFESTO } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Por que a 11 Of existe, o que a gente defende, como trabalhamos.",
};

const VALUES = [
  {
    icon: Flag,
    title: "Uma coleção. Um torneio.",
    body: "Curadoria vertical: só camisas oficiais Nike da Copa 2026. Nada de camisa de treino, nada de Retro. Foco total.",
  },
  {
    icon: Shield,
    title: "100% autêntico",
    body: "Toda peça vem direto de distribuidor Nike autorizado, com tag holográfica e embalagem original. Se não for Nike, não tá aqui.",
  },
  {
    icon: Zap,
    title: "PIX primeiro",
    body: "Ofereça pro cliente brasileiro o que ele realmente quer. PIX é 15% OFF direto, confirmação em segundos, zero taxa absurda de cartão.",
  },
  {
    icon: Package,
    title: "Despacho em 24h",
    body: "Pedidos antes das 15h saem no mesmo dia. Correios e Jadlog, rastreio automático por email. Simples.",
  },
  {
    icon: Heart,
    title: "Torcer é pertencer",
    body: "A gente acredita que camisa de seleção é o ponto de encontro entre religião, arte e território. Por isso a 11 Of existe.",
  },
];

const HERO_BG =
  "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/bra/005_nike-football-2026-federation-kits-brasil-vini-jr.jpg";

export default function SobrePage() {
  return (
    <article className="mx-auto max-w-[1440px] px-6 pb-24 pt-8 md:pt-10">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40">
        <div className="absolute inset-0 -z-10">
          <Image
            src={HERO_BG}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50"
          />
        </div>
        <div className="relative px-8 py-20 md:px-16 md:py-28">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Manifesto · {BRAND_NAME}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.5rem,10vw,8rem)] font-semibold leading-[0.92] tracking-[-0.03em]">
            Torcer é{" "}
            <span className="italic font-editorial font-normal text-turf">
              pertencer.
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg font-editorial italic leading-relaxed text-foreground/80">
            &ldquo;{BRAND_MANIFESTO}&rdquo;
          </p>
        </div>
      </header>

      {/* Origin story */}
      <section className="mt-20 grid grid-cols-1 gap-10 border-b border-border/60 pb-20 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Capítulo 01
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Por que a gente abriu essa loja.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:col-span-8">
          <p>
            Em 2022 a gente percebeu uma coisa óbvia: toda Copa do Mundo, os
            brasileiros correm atrás da camisa oficial da Nike e acabam
            comprando em importadora que cobra câmbio dólar, atende em inglês e
            demora 20 dias pra entregar. Ou pior: ficam com camisa falsa.
          </p>
          <p>
            A gente achou que dava pra fazer diferente. Tiragem controlada,
            curadoria editorial, embalagem que não parece de marketplace
            genérico, despacho em 24h e PIX no checkout com 15% de desconto.
            Tudo oficial Nike, direto de distribuidor autorizado, sem câmbio
            dólar e sem drama.
          </p>
          <p className="font-editorial italic text-xl text-foreground">
            A 11 Of nasceu dessa irritação.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mt-20">
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Capítulo 02
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              O que a gente{" "}
              <span className="italic font-editorial font-normal">defende.</span>
            </h2>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <li
              key={v.title}
              className="rounded-2xl border border-border/60 bg-card/30 p-6"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-turf/40 bg-turf/10 text-turf">
                <v.icon className="size-4" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {v.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Stats */}
      <section className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/60 md:grid-cols-4">
        {[
          ["08", "Seleções oficiais"],
          ["24h", "Despacho útil"],
          ["15%", "OFF no PIX"],
          ["100%", "Autenticidade Nike"],
        ].map(([v, l]) => (
          <div key={l} className="bg-background px-6 py-10 text-center md:py-14">
            <p className="font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
              {v}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {l}
            </p>
          </div>
        ))}
      </section>

      {/* Closing */}
      <section className="mt-20 border-t border-border/60 pt-16 text-center">
        <span
          aria-hidden
          className="block font-display font-bold leading-none tracking-[-0.04em] text-[clamp(4rem,18vw,14rem)] text-foreground/5"
        >
          11 · Of
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          Falta pouco
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Escolha a sua antes de esgotar.
        </h2>
        <Link
          href="/produtos"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-turf px-8 py-4 text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
        >
          Ver todas as camisas <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </article>
  );
}
