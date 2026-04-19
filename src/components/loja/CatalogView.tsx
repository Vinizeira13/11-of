"use client";

import { useMemo, useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDownUp, Check, Filter, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { TEAMS, CONFEDERATIONS, teamBySlug } from "@/lib/teams";
import { ProductCard } from "./ProductCard";
import { MidBanner } from "./MidBanner";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

const SORT_LABEL: Record<Sort, string> = {
  featured: "Em destaque",
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  name: "A–Z",
};

const VALID_SORTS: Sort[] = ["featured", "price-asc", "price-desc", "name"];

function parseConfs(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => CONFEDERATIONS.some((c) => c.id === s));
}

export function CatalogView({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [confs, setConfs] = useState<string[]>(() =>
    parseConfs(searchParams.get("conf")),
  );
  const [sizeFilter, setSizeFilter] = useState<string | null>(
    () => searchParams.get("size"),
  );
  const [inStockOnly, setInStockOnly] = useState(
    () => searchParams.get("stock") === "1",
  );
  const [sort, setSort] = useState<Sort>(() => {
    const s = searchParams.get("sort");
    return (VALID_SORTS as readonly string[]).includes(s ?? "")
      ? (s as Sort)
      : "featured";
  });
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync state → URL (without adding to history stack)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (confs.length > 0) params.set("conf", confs.join(","));
    else params.delete("conf");
    if (sizeFilter) params.set("size", sizeFilter);
    else params.delete("size");
    if (inStockOnly) params.set("stock", "1");
    else params.delete("stock");
    if (sort !== "featured") params.set("sort", sort);
    else params.delete("sort");

    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.replace(target, { scroll: false });
    });
    // We intentionally don't depend on router/searchParams/pathname to avoid
    // loops; the effect only writes when user-driven filter state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confs, sizeFilter, inStockOnly, sort]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (confs.length > 0) {
      list = list.filter((p) => {
        const t = teamBySlug(p.slug);
        return t ? confs.includes(t.confederation) : false;
      });
    }
    if (sizeFilter) {
      list = list.filter((p) =>
        p.variants.some((v) => v.size === sizeFilter && v.stockQty > 0),
      );
    }
    if (inStockOnly) {
      list = list.filter((p) =>
        p.variants.some((v) => v.stockQty > 0),
      );
    }
    list.sort((a, b) => {
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      if (sort === "price-desc") return b.priceCents - a.priceCents;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [products, confs, sizeFilter, inStockOnly, sort]);

  const sizes = ["P", "M", "G", "GG"] as const;

  function toggleConf(id: string) {
    setConfs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  const clearAll = useCallback(() => {
    setConfs([]);
    setSizeFilter(null);
    setInStockOnly(false);
    setSort("featured");
  }, []);

  const activeFilters =
    confs.length + (sizeFilter ? 1 : 0) + (inStockOnly ? 1 : 0);

  const half = Math.ceil(filtered.length / 2);
  const firstHalf = filtered.slice(0, Math.max(half, 4));
  const secondHalf = filtered.slice(Math.max(half, 4));

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-16 z-30 -mx-6 border-y border-border/60 bg-background/85 px-6 py-3 backdrop-blur-xl md:mx-0 md:rounded-xl md:border md:px-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 px-3.5 py-1.5 text-xs font-medium transition hover:border-foreground md:hidden"
          >
            <Filter className="size-3.5" />
            Filtros {activeFilters > 0 && `(${activeFilters})`}
          </button>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {CONFEDERATIONS.map((c) => {
              const active = confs.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleConf(c.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/80 hover:border-foreground",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
            <div className="mx-2 h-4 w-px bg-border/60" />
            {sizes.map((s) => {
              const active = sizeFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSizeFilter(active ? null : s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/80 hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setInStockOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                inStockOnly
                  ? "border-turf bg-turf text-turf-foreground"
                  : "border-border/80 hover:border-foreground",
              )}
            >
              {inStockOnly && <Check className="size-3" />}
              Em estoque
            </button>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" /> Limpar
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 px-3.5 py-1.5 text-xs font-medium transition hover:border-foreground"
            >
              <ArrowDownUp className="size-3.5" />
              {SORT_LABEL[sort]}
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl">
                {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition hover:bg-muted",
                      sort === s && "bg-muted",
                    )}
                  >
                    {SORT_LABEL[s]}
                    {sort === s && <Check className="size-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile filters */}
        {mobileOpen && (
          <div className="mt-3 space-y-3 border-t border-border/60 pt-3 md:hidden">
            <div className="flex flex-wrap gap-2">
              {CONFEDERATIONS.map((c) => {
                const active = confs.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleConf(c.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/80",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const active = sizeFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSizeFilter(active ? null : s)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/80",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInStockOnly((v) => !v)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition",
                  inStockOnly
                    ? "border-turf bg-turf text-turf-foreground"
                    : "border-border/80",
                )}
              >
                Somente em estoque
              </button>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 rounded-full border border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" /> Limpar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border/70 px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma camisa bate com esses filtros. Tente outra combinação.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 text-xs font-medium underline underline-offset-4"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1 ? "camisa" : "camisas"} · atualizado em
            tempo real
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {firstHalf.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
          {secondHalf.length > 0 && (
            <>
              <div className="my-14">
                <MidBanner
                  kicker="Drop · Abril"
                  title="A parte que ninguém conta."
                  subtitle="Primeiros 100 pedidos recebem patch de coleção exclusivo 11 Of. Já vai."
                  cta="Ver Seleção Brasileira"
                  href="/produtos/camisa-brasil-home-2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {secondHalf.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Team list at bottom */}
      <TeamList />
    </div>
  );
}

function TeamList() {
  return (
    <section className="mt-24 border-t border-border/60 pt-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
        Todas as seleções na coleção
      </p>
      <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Escolha pelo escudo.
      </h3>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
        {TEAMS.map((t) => (
          <a
            key={t.code}
            href={`/produtos/${t.slug}`}
            className="group flex flex-col items-start gap-1.5 rounded-xl border border-border/60 p-4 transition hover:border-foreground"
          >
            <span aria-hidden className="text-3xl">
              {t.flag}
            </span>
            <span className="font-display text-sm font-semibold">
              {t.shortName}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.star.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
