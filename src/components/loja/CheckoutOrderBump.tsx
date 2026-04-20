"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Check, Flame, Truck } from "lucide-react";
import { toast } from "sonner";
import { addToCartAction } from "@/app/_actions/cart";
import { formatBRL } from "@/lib/money";
import { BLUR_DATA_URL } from "@/lib/images";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";
import { cn } from "@/lib/utils";

export type BumpItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  imageUrl: string;
  priceCents: number;
  size: string;
  reason: "sibling" | "free-shipping";
  reasonLabel: string;
  flag?: string;
};

/**
 * Shopify-style one-click order bump. Two triggers:
 *   - **sibling**: user has Home of team X → suggest Away of same team (or
 *     vice-versa). Most natural cross-sell in an apparel store.
 *   - **free-shipping**: cart subtotal is below the free-shipping gate →
 *     highlight an item that, once added, unlocks free shipping.
 *
 * Each item adds with one tap. On success, the server action revalidates
 * the layout which propagates the updated cart + summary.
 */
export function CheckoutOrderBump({ items }: { items: BumpItem[] }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (items.length === 0) return null;

  function handleAdd(item: BumpItem) {
    setPendingId(item.productId);
    startTransition(async () => {
      const res = await addToCartAction(item.variantId, 1);
      setPendingId(null);
      if (res.ok) {
        setAdded((prev) => new Set([...prev, item.productId]));
        toast.success("Adicionado ao pedido", {
          description: `${item.name} · Tam. ${item.size}`,
        });
        // Refresh so the summary + totals pick up the new line
        setTimeout(() => window.location.reload(), 400);
      } else {
        toast.error(res.error ?? "Não foi possível adicionar.");
      }
    });
  }

  return (
    <section
      aria-labelledby="bump-heading"
      className="rounded-2xl border border-turf/30 bg-gradient-to-br from-turf/[0.10] via-turf/[0.03] to-transparent p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-turf text-turf-foreground">
          <Flame className="size-3.5" aria-hidden />
        </span>
        <h2
          id="bump-heading"
          className="text-sm font-semibold uppercase tracking-[0.18em] text-turf"
        >
          Leva junto — adiciona em 1 clique
        </h2>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const isAdded = added.has(item.productId);
          const isPending = pendingId === item.productId;
          const pixCents = Math.round(
            item.priceCents * (1 - PIX_DISCOUNT_PCT / 100),
          );
          return (
            <li
              key={item.productId}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3"
            >
              <div className="relative size-16 flex-none overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-turf">
                  {item.reason === "free-shipping" ? (
                    <>
                      <Truck className="size-3" aria-hidden />
                      {item.reasonLabel}
                    </>
                  ) : (
                    <>
                      <span aria-hidden>{item.flag ?? "★"}</span>
                      {item.reasonLabel}
                    </>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm font-semibold leading-tight">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Tam. {item.size} · {formatBRL(item.priceCents)}{" "}
                  <span className="text-turf">
                    · {formatBRL(pixCents)} PIX
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => !isAdded && handleAdd(item)}
                disabled={isAdded || isPending}
                aria-label={
                  isAdded
                    ? `${item.name} adicionado`
                    : `Adicionar ${item.name} ao pedido`
                }
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
                  isAdded
                    ? "bg-turf/20 text-turf"
                    : "bg-turf text-turf-foreground hover:bg-turf/90",
                  isPending && "opacity-70",
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="size-3.5" /> Adicionado
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    {isPending ? "Adicionando…" : "Adicionar"}
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
