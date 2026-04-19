"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Heart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/loja/ProductCard";
import { useWishlist } from "@/lib/wishlist";

export function FavoritesClient({ products }: { products: Product[] }) {
  const { ids, mounted, clear } = useWishlist();

  const favorites = useMemo(() => {
    return products.filter((p) => ids.includes(p.id));
  }, [products, ids]);

  if (!mounted) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="size-6 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border/70 px-8 py-20 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full border border-border/70 bg-card/40 text-turf">
          <Heart className="size-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold">
          Nenhum favorito ainda.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Toque o coração em qualquer camisa e ela vai aparecer por aqui.
        </p>
        <Link
          href="/produtos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-turf px-6 py-3 text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
        >
          Ver seleções <ArrowUpRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-6">
        <p className="text-sm text-muted-foreground">
          {favorites.length}{" "}
          {favorites.length === 1 ? "camisa salva" : "camisas salvas"}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Limpar favoritos
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {favorites.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
