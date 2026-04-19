import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedProducts } from "@/lib/catalog";
import { splitImages } from "@/lib/images";
import { TEAMS, teamBySlug } from "@/lib/teams";
import { Marquee } from "@/components/loja/Marquee";

export const metadata: Metadata = {
  title: "Editorial",
  description:
    "Lookbook da coleção Copa 2026 — em campo, fora de campo, e nos nossos editoriais.",
};

export default async function EditorialPage() {
  const products = await getPublishedProducts();

  type Shot = {
    src: string;
    productSlug: string;
    productName: string;
    teamCode: string;
    teamShort: string;
    player?: string;
    index: number;
  };

  const shots: Shot[] = [];
  for (const p of products) {
    const team = teamBySlug(p.slug);
    const { editorial } = splitImages(p.images);
    editorial.forEach((src, i) => {
      shots.push({
        src,
        productSlug: p.slug,
        productName: p.name,
        teamCode: team?.code ?? "",
        teamShort: team?.shortName ?? p.name,
        player: team?.star.name,
        index: i,
      });
    });
  }

  // Asymmetric bento: every 7 shots, inject a pull-quote card.
  const quotes = [
    { title: "Onze de linha", body: "Um torneio. Uma coleção. 132 seleções convidadas." },
    { title: "Curadoria", body: "Cada peça escolhida pra resistir ao tempo — e ao gramado." },
    { title: "Oficial", body: "Cada escudo vem de distribuidor autorizado. Cada tag confere." },
  ];

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
            Mais de 40 fotos dos 8 times oficiais que a 11 Of carrega pra Copa
            2026. Nos editoriais da Nike, nas capitais europeias e nos próximos
            jogos — a mesma camisa que sai daqui pro teu armário.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEAMS.map((t) => (
            <Link
              key={t.code}
              href={`/produtos/${t.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium hover:border-foreground transition"
            >
              <span aria-hidden>{t.flag}</span>
              {t.shortName}
            </Link>
          ))}
        </div>
      </header>

      {/* Mood marquee of non-player editorial lines */}
      <section aria-label="Capítulos" className="mb-10 border-y border-border/60">
        <Marquee duration={50} className="py-6">
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo I · Abertura 11.jun
          </span>
          <span aria-hidden className="text-turf">◆</span>
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo II · Fase de grupos
          </span>
          <span aria-hidden className="text-turf">◆</span>
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo III · Mata-mata
          </span>
          <span aria-hidden className="text-turf">◆</span>
          <span className="mx-8 font-editorial italic text-2xl text-foreground/80">
            Capítulo IV · Final 19.jul
          </span>
          <span aria-hidden className="text-turf">◆</span>
        </Marquee>
      </section>

      {/* Bento grid */}
      <section className="grid grid-cols-12 gap-3 md:gap-4">
        {shots.map((s, i) => {
          const pattern = i % 6;
          const span =
            pattern === 0
              ? "col-span-12 md:col-span-8 aspect-[16/10]"
              : pattern === 1
                ? "col-span-6 md:col-span-4 aspect-[4/5]"
                : pattern === 2
                  ? "col-span-6 md:col-span-5 aspect-[4/5]"
                  : pattern === 3
                    ? "col-span-12 md:col-span-3 aspect-[4/5]"
                    : pattern === 4
                      ? "col-span-6 md:col-span-4 aspect-[4/5]"
                      : "col-span-12 md:col-span-8 aspect-[16/9]";

          return (
            <Fragment key={`${s.src}-${i}`}>
              <Link
                href={`/produtos/${s.productSlug}`}
                className={`group relative overflow-hidden rounded-2xl bg-muted ${span}`}
              >
                <Image
                  src={s.src}
                  alt={`${s.teamShort} editorial ${s.index}`}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                      {s.teamCode}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-white">
                      {s.player ?? s.teamShort}
                    </p>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition group-hover:bg-turf group-hover:border-turf group-hover:text-turf-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>

              {i > 0 && (i + 1) % 7 === 0 && quotes[Math.floor(i / 7) % quotes.length] && (
                <QuoteCard
                  title={quotes[Math.floor(i / 7) % quotes.length].title}
                  body={quotes[Math.floor(i / 7) % quotes.length].body}
                />
              )}
            </Fragment>
          );
        })}
      </section>

      {/* Closing CTA */}
      <section className="mt-16 border-t border-border/60 pt-14 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          Próximo capítulo
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          É só escolher a tua.
        </h2>
        <Link
          href="/produtos"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-turf px-7 py-3.5 text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
        >
          Ver todas as camisas <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </article>
  );
}

function QuoteCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="col-span-12 flex flex-col justify-between rounded-2xl border border-turf/30 bg-turf/5 p-6 md:col-span-4 aspect-[4/5]">
      <span aria-hidden className="text-5xl text-turf">◆</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          {title}
        </p>
        <p className="mt-3 font-editorial italic text-2xl leading-tight">
          &ldquo;{body}&rdquo;
        </p>
      </div>
    </div>
  );
}
