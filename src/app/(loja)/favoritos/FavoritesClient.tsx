"use client";

import Link from "next/link";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/loja/ProductCard";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/components/loja/cart/CartContext";

export function FavoritesClient({ products }: { products: Product[] }) {
  const { ids, mounted, clear } = useWishlist();
  const { add } = useCart();
  const [isPending, startTransition] = useTransition();

  const favorites = useMemo(() => {
    return products.filter((p) => ids.includes(p.id));
  }, [products, ids]);

  function addAllDefault() {
    if (favorites.length === 0) return;
    startTransition(async () => {
      let added = 0;
      let missed = 0;
      for (const p of favorites) {
        const variant = p.variants.find((v) => v.stockQty > 0);
        if (!variant) {
          missed++;
          continue;
        }
        const ok = await add(variant.id, 1);
        if (ok) added++;
        else missed++;
      }
      if (added > 0) {
        toast.success(
          `${added} ${added === 1 ? "camisa adicionada" : "camisas adicionadas"} ao carrinho`,
          missed > 0
            ? { description: `${missed} não tinha(m) estoque disponível.` }
            : undefined,
        );
      } else {
        toast.error("Nenhum favorito tem estoque agora.");
      }
    });
  }

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {favorites.length}{" "}
          {favorites.length === 1 ? "camisa salva" : "camisas salvas"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addAllDefault}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-turf px-4 py-2 text-xs font-semibold text-turf-foreground transition hover:bg-turf/90 disabled:opacity-60"
          >
            <ShoppingBag className="size-3.5" />
            {isPending ? "Adicionando…" : "Adicionar tudo ao carrinho"}
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Limpar favoritos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {favorites.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
