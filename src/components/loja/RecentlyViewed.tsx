"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, Clock } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { teamBySlug } from "@/lib/teams";
import { splitImages } from "@/lib/images";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { formatBRL } from "@/lib/money";

export function RecentlyViewed({
  products,
  excludeSlug,
  limit = 6,
  title = "Você viu recentemente",
}: {
  products: Product[];
  excludeSlug?: string;
  limit?: number;
  title?: string;
}) {
  const { items, mounted, clear } = useRecentlyViewed(excludeSlug);

  const resolved = useMemo(() => {
    return items
      .map((i) => products.find((p) => p.slug === i.slug))
      .filter((p): p is Product => Boolean(p))
      .slice(0, limit);
  }, [items, products, limit]);

  if (!mounted) return null;
  if (resolved.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] border-t border-border/60 px-6 py-16">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            <Clock className="size-3" /> Últimos vistos
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Limpar histórico
        </button>
      </div>

      <ul className="flex gap-3 overflow-x-auto pb-2 no-scrollbar md:gap-5">
        {resolved.map((p) => {
          const team = teamBySlug(p.slug);
          const { product: shots } = splitImages(p.images);
          const img = shots[0] ?? p.images[0];
          return (
            <li
              key={p.id}
              className="w-44 flex-none sm:w-52 md:w-56"
            >
              <Link
                href={`/produtos/${p.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                  {img && (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                  {team && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                      <span aria-hidden>{team.flag}</span> {team.code}
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-medium">
                    {team?.shortName ?? p.name}
                  </span>
                  <span className="text-xs font-semibold tabular-nums">
                    {formatBRL(p.priceCents)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          Ver catálogo inteiro <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
