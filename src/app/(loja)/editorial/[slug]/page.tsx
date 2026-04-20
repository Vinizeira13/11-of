import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProductBySlug, getPublishedProducts } from "@/lib/catalog";
import { teamBySlug } from "@/lib/teams";
import { splitImages } from "@/lib/images";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_LABEL } from "@/lib/brand";
import { pixDiscountCents } from "@/lib/pricing";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team) return { title: "Editorial" };
  return {
    title: `${team.shortName} · Editorial`,
    description: `${team.tagline} ${team.name} na Copa 2026 — lookbook, estrela e camisa oficial Nike.`,
  };
}

export default async function EditorialTeamPage({ params }: PageProps) {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team) notFound();

  const [product, products] = await Promise.all([
    getProductBySlug(slug),
    getPublishedProducts(),
  ]);
  if (!product) notFound();

  const idx = products.findIndex((p) => p.slug === slug);
  const nextProduct = products[(idx + 1) % products.length];
  const nextTeam = teamBySlug(nextProduct.slug);

  const split = splitImages(product.images);
  const heroImage = split.editorial[0] ?? split.product[0];
  const gallery = [...split.editorial, ...split.product].filter(
    (src) => src !== heroImage,
  );

  const pixCents = product.priceCents - pixDiscountCents(product.priceCents);
  const [firstPara, ...restParas] = product.description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const secondPara =
    restParas.join(" ") ||
    product.description.slice(Math.floor(product.description.length / 2));

  return (
    <article className="relative">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-6 pt-6">
        <Link
          href="/editorial"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5" /> Voltar ao lookbook
        </Link>
      </div>

      {/* Hero */}
      <header className="mx-auto mt-4 max-w-[1440px] px-0 md:px-6">
        <div className="relative h-[68vh] min-h-[520px] overflow-hidden md:rounded-3xl">
          <Image
            src={heroImage}
            alt={`${team.shortName} — editorial oficial Nike 2026`}
            fill
            priority
            sizes="(min-width:1440px) 1408px, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/60 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-14">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
              <span aria-hidden className="text-base leading-none">
                {team.flag}
              </span>
              {team.code} · {team.confederation}
            </div>
            <h1 className="mt-3 font-display font-semibold leading-[0.92] tracking-[-0.02em] text-[clamp(3.5rem,10vw,9rem)]">
              {team.shortName}
              <span className="text-turf">.</span>
            </h1>
            <p className="mt-4 max-w-xl font-editorial italic text-2xl leading-tight text-foreground/85 md:text-4xl">
              {team.tagline}
            </p>
          </div>
        </div>
      </header>

      {/* Intro paragraph */}
      <section className="mx-auto mt-16 grid max-w-[1440px] grid-cols-1 gap-6 px-6 md:grid-cols-[minmax(0,200px)_1fr] md:gap-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf md:pt-3">
          Capítulo {String(idx + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/85 md:text-lg md:leading-[1.75]">
          {firstPara}
        </p>
      </section>

      {/* Pull quote */}
      <section className="mx-auto mt-16 max-w-[1440px] border-y border-border/60 px-6 py-16">
        <p className="mx-auto max-w-4xl text-center font-editorial italic text-4xl leading-[1.05] md:text-7xl">
          &ldquo;{team.tagline}&rdquo;
        </p>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="mx-auto mt-16 max-w-[1440px] px-6">
          <div className="mb-8 flex items-end justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Galeria · {gallery.length + 1}{" "}
              {gallery.length === 0 ? "imagem" : "imagens"}
            </p>
            <p className="hidden text-[11px] text-muted-foreground md:block">
              Nike Football 2026 · Press kit oficial
            </p>
          </div>
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {gallery.map((src, i) => {
              const span =
                i % 3 === 0
                  ? "col-span-12 md:col-span-8 aspect-[16/10]"
                  : i % 3 === 1
                    ? "col-span-12 md:col-span-4 aspect-[4/5]"
                    : "col-span-12 md:col-span-6 aspect-[3/2]";
              return (
                <div
                  key={src + i}
                  className={`group relative overflow-hidden rounded-2xl bg-muted ${span}`}
                >
                  <Image
                    src={src}
                    alt={`${team.shortName} look ${i + 2}`}
                    fill
                    sizes="(min-width:1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Star player spotlight — image IS the player, caption is journalism */}
      <section className="mx-auto mt-20 max-w-[1440px] px-6">
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted md:col-span-7 md:aspect-auto">
            <Image
              src={heroImage}
              alt={`${team.star.name} vestindo ${team.name} Home 2026 — editorial Nike`}
              fill
              sizes="(min-width:1024px) 58vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent"
            />
            <div className="absolute inset-y-0 left-0 flex max-w-sm flex-col justify-end p-8 md:p-12">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
                Editorial · {team.code}
              </span>
              <p className="mt-2 font-display text-3xl font-semibold leading-tight text-white md:text-5xl">
                {team.star.name}
              </p>
              <p className="mt-2 font-mono text-base text-white/80 md:text-lg">
                #{team.star.number} · {team.star.position}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card/50 p-8 md:col-span-5 md:p-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
              Narrativa
            </span>
            <p className="mt-6 font-editorial italic text-2xl leading-snug md:text-3xl">
              {secondPara}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-5 border-t border-border/70 pt-6">
              <Stat label="Seleção" value={team.name} />
              <Stat label="Confederação" value={team.confederation} />
              <Stat label="Camisa" value={`#${team.star.number}`} />
              <Stat label="Posição" value={team.star.position} />
            </div>
          </div>
        </div>
      </section>

      {/* Buy CTA */}
      <section className="mx-auto mt-20 max-w-[1440px] px-6">
        <Link
          href={`/produtos/${product.slug}`}
          className="group relative block overflow-hidden rounded-3xl border border-turf/30 bg-gradient-to-br from-turf/[0.14] via-turf/[0.04] to-transparent p-8 md:p-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 animate-shimmer"
          />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
              Leva contigo
            </p>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
              <div>
                <h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">
                  {product.name}
                </h2>
                <p className="mt-3 max-w-md text-sm text-foreground/70 md:text-base">
                  Camisa oficial Nike · Tiragem controlada · Despacho em 24h
                  úteis
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/60">
                  À vista no PIX
                </p>
                <p className="mt-1 font-display text-3xl font-semibold md:text-4xl">
                  {formatBRL(pixCents)}
                </p>
                <p className="mt-1 text-xs text-foreground/55">
                  ou {formatBRL(product.priceCents)} · {PIX_DISCOUNT_LABEL}
                </p>
              </div>
            </div>
            <div className="mt-10 inline-flex items-center gap-2 rounded-full bg-turf px-7 py-3.5 text-sm font-semibold text-turf-foreground transition group-hover:bg-turf/90">
              Ver a camisa {team.shortName}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </Link>
      </section>

      {/* Next chapter */}
      {nextTeam && (
        <section className="mx-auto mt-20 max-w-[1440px] border-t border-border/60 px-6 pb-24 pt-14">
          <Link
            href={`/editorial/${nextTeam.slug}`}
            className="group flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Próximo capítulo
              </p>
              <h3 className="mt-3 font-display font-semibold leading-[0.95] text-5xl md:text-[clamp(3rem,6vw,6rem)]">
                <span className="mr-3" aria-hidden>
                  {nextTeam.flag}
                </span>
                {nextTeam.shortName}
                <span className="italic font-editorial font-normal text-turf/80">
                  .
                </span>
              </h3>
              <p className="mt-3 font-editorial italic text-lg text-foreground/65 md:text-2xl">
                {nextTeam.tagline}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border/70 px-6 py-3 text-sm font-medium transition group-hover:border-turf group-hover:bg-turf/10 group-hover:text-turf md:self-end">
              Continuar a leitura
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </section>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
