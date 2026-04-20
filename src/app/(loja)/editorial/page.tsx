import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedProducts } from "@/lib/catalog";
import { splitImages } from "@/lib/images";
import { TEAMS, teamBySlug, type TeamMeta } from "@/lib/teams";
import { Marquee } from "@/components/loja/Marquee";

export const metadata: Metadata = {
  title: "Editorial",
  description:
    "Lookbook da coleção Copa 2026 — um capítulo por seleção. Camisa oficial Nike, narrativa e a estrela que vai vesti-la.",
};

type Chapter = {
  team: TeamMeta;
  productSlug: string;
  productName: string;
  cover: string;
  editorialCount: number;
  totalImages: number;
};

export default async function EditorialPage() {
  const products = await getPublishedProducts();

  const chapters: Chapter[] = [];
  for (const p of products) {
    const team = teamBySlug(p.slug);
    if (!team) continue;
    const { editorial, product } = splitImages(p.images);
    const cover = editorial[0] ?? product[0] ?? p.images[0];
    if (!cover) continue;
    chapters.push({
      team,
      productSlug: p.slug,
      productName: p.name,
      cover,
      editorialCount: editorial.length,
      totalImages: p.images.length,
    });
  }

  const totalImages = chapters.reduce((acc, c) => acc + c.totalImages, 0);

  const quotes = [
    {
      title: "Onze de linha",
      body: "Um torneio. Uma coleção. Dezesseis seleções que escrevem a próxima linha da história.",
    },
    {
      title: "Oficial",
      body: "Cada escudo vem de distribuidor autorizado. Cada tag confere. Cada camisa é a mesma que vai pro gramado.",
    },
  ];

  const [featured, ...rest] = chapters;

  return (
    <article className="mx-auto max-w-[1440px] px-6 pb-24 pt-8 md:pt-10">
      {/* Hero */}
      <header className="relative mb-12 grid grid-cols-1 items-end gap-8 border-b border-border/60 pb-10 md:grid-cols-[1fr_auto] md:gap-12 md:pb-14">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Editorial · Lookbook Copa 2026
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-[clamp(4rem,8vw,7.5rem)]">
            Em campo.{" "}
            <span className="italic font-editorial font-normal">
              E fora dele.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {TEAMS.length} seleções, {chapters.length} capítulos (home e away),{" "}
            {totalImages} imagens. Cada camisa oficial Nike da coleção 2026 —
            com a estrela que vai vesti-la e a narrativa que a acompanha.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEAMS.map((t) => (
            <Link
              key={t.code}
              href={`/editorial/${t.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium hover:border-turf hover:bg-turf/10 hover:text-turf transition"
            >
              <span aria-hidden>{t.flag}</span>
              {t.shortName}
            </Link>
          ))}
        </div>
      </header>

      {/* Chapters marquee */}
      <section
        aria-label="Capítulos da temporada"
        className="mb-10 border-y border-border/60"
      >
        <Marquee duration={50} className="py-6">
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo I · Abertura 11.jun
          </span>
          <span aria-hidden className="text-turf">
            ◆
          </span>
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo II · Fase de grupos
          </span>
          <span aria-hidden className="text-turf">
            ◆
          </span>
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo III · Mata-mata
          </span>
          <span aria-hidden className="text-turf">
            ◆
          </span>
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo IV · Final 19.jul
          </span>
          <span aria-hidden className="text-turf">
            ◆
          </span>
        </Marquee>
      </section>

      {/* Featured chapter (first team, full-width) */}
      {featured && (
        <section className="mb-4">
          <ChapterCard chapter={featured} featured index={0} />
        </section>
      )}

      {/* Remaining chapters — bento with interspersed quotes */}
      <section className="grid grid-cols-12 gap-3 md:gap-4">
        {rest.map((c, i) => {
          const bentoSize =
            i % 5 === 0
              ? "col-span-12 md:col-span-8 aspect-[16/10]"
              : i % 5 === 1
                ? "col-span-6 md:col-span-4 aspect-[4/5]"
                : i % 5 === 2
                  ? "col-span-6 md:col-span-4 aspect-[4/5]"
                  : i % 5 === 3
                    ? "col-span-12 md:col-span-4 aspect-[4/5]"
                    : "col-span-12 md:col-span-4 aspect-[4/5]";
          const showQuote = i === 2 && quotes[0];
          const showQuote2 = i === 5 && quotes[1];
          return (
            <Fragment key={c.productSlug}>
              <ChapterCard chapter={c} index={i + 1} className={bentoSize} />
              {showQuote && (
                <QuoteCard title={quotes[0].title} body={quotes[0].body} />
              )}
              {showQuote2 && (
                <QuoteCard title={quotes[1].title} body={quotes[1].body} />
              )}
            </Fragment>
          );
        })}
      </section>

      {/* Closing */}
      <section className="mt-20 border-t border-border/60 pt-16 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          Próximo capítulo
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          A tua seleção, na tua coleção.
        </h2>
        <Link
          href="/produtos"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-turf px-7 py-3.5 text-sm font-semibold text-turf-foreground transition hover:bg-turf/90"
        >
          Ver todas as camisas <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </article>
  );
}

function ChapterCard({
  chapter,
  featured = false,
  index,
  className,
}: {
  chapter: Chapter;
  featured?: boolean;
  index: number;
  className?: string;
}) {
  const { team, productSlug, cover, editorialCount, totalImages } = chapter;

  return (
    <Link
      href={`/editorial/${productSlug}`}
      className={`group relative block overflow-hidden rounded-3xl bg-muted ${
        featured ? "aspect-[16/7] w-full md:aspect-[21/9]" : className ?? ""
      }`}
    >
      <Image
        src={cover}
        alt={`${team.shortName} — editorial`}
        fill
        sizes={
          featured
            ? "(min-width:1440px) 1408px, 100vw"
            : "(min-width:1024px) 40vw, 100vw"
        }
        priority={featured}
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
      />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
          <span aria-hidden>{team.flag}</span>
          Cap. {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
          {totalImages} {totalImages === 1 ? "imagem" : "imagens"}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            {team.code} · {team.confederation}
          </p>
          <p
            className={`mt-2 font-display font-semibold leading-tight text-white ${
              featured
                ? "text-4xl md:text-6xl lg:text-7xl"
                : "text-2xl md:text-3xl"
            }`}
          >
            {team.shortName}
            <span className="text-turf">.</span>
          </p>
          <p
            className={`mt-2 font-editorial italic text-white/85 ${
              featured ? "text-lg md:text-2xl" : "text-sm md:text-base"
            }`}
          >
            {team.tagline}
          </p>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
            {totalImages} {totalImages === 1 ? "imagem" : "imagens"} · Home + Away
          </p>
        </div>
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition group-hover:bg-turf group-hover:border-turf group-hover:text-turf-foreground">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}

function QuoteCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="col-span-12 flex aspect-auto flex-col justify-between rounded-3xl border border-turf/30 bg-turf/5 p-8 md:col-span-4 md:aspect-[4/5]">
      <span aria-hidden className="text-5xl text-turf">
        ◆
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          {title}
        </p>
        <p className="mt-3 font-editorial italic text-2xl leading-tight md:text-3xl">
          &ldquo;{body}&rdquo;
        </p>
      </div>
    </div>
  );
}
