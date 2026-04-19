"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { Minus, Plus, ShoppingBag, Trash2, Zap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Product, Variant } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";
import { splitImages } from "@/lib/images";
import { teamBySlug } from "@/lib/teams";
import { useCart } from "./CartContext";
import { FreeShippingBar } from "./FreeShippingBar";

type ResolvedLine = {
  variantId: string;
  qty: number;
  product: Product;
  variant: Variant;
  lineTotalCents: number;
};

function resolveLines(
  lines: { variantId: string; qty: number }[],
  products: Product[],
): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    for (const product of products) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (variant) {
        out.push({
          variantId: line.variantId,
          qty: line.qty,
          product,
          variant,
          lineTotalCents: product.priceCents * line.qty,
        });
        break;
      }
    }
  }
  return out;
}

export function CartDrawer() {
  const { lines, products, isOpen, close, updateQty, remove, add } = useCart();
  const resolved = useMemo(
    () => resolveLines(lines, products),
    [lines, products],
  );
  const subtotalCents = resolved.reduce((s, l) => s + l.lineTotalCents, 0);
  const isEmpty = resolved.length === 0;
  const pixTotalCents = Math.round(subtotalCents * (1 - PIX_DISCOUNT_PCT / 100));

  const inCart = new Set(resolved.map((l) => l.product.id));
  const crossSell = products
    .filter((p) => !inCart.has(p.id) && p.variants.some((v) => v.stockQty > 0))
    .slice(0, 4);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : close())}>
      <SheetContent className="flex w-full flex-col gap-0 border-l border-border/60 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle className="text-base font-semibold">
            Seu carrinho{" "}
            {!isEmpty && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {resolved.reduce((s, l) => s + l.qty, 0)}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Itens adicionados. Ajuste quantidades ou finalize a compra.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {isEmpty ? (
            <Empty className="border-0 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>Carrinho vazio</EmptyTitle>
                <EmptyDescription>
                  Comece escolhendo uma peça. Tamanhos limitados.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild onClick={close} className="bg-turf text-turf-foreground hover:bg-turf/90">
                  <Link href="/produtos">Ver produtos</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <ul className="flex flex-col gap-5">
                {resolved.map((line) => {
                  const team = teamBySlug(line.product.slug);
                  const { product: shots, editorial } = splitImages(line.product.images);
                  const image = shots[0] ?? editorial[0] ?? line.product.images[0];
                  return (
                    <li key={line.variantId} className="flex gap-3">
                      <Link
                        href={`/produtos/${line.product.slug}`}
                        onClick={close}
                        className="relative block size-20 flex-none overflow-hidden rounded-md bg-muted"
                      >
                        {image && (
                          <Image
                            src={image}
                            alt={line.product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                        {team && (
                          <span
                            aria-hidden
                            className="absolute left-1 top-1 rounded bg-black/55 px-1 py-0.5 text-[9px] font-semibold uppercase text-white backdrop-blur"
                          >
                            {team.code}
                          </span>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/produtos/${line.product.slug}`}
                              onClick={close}
                              className="block truncate text-sm font-medium hover:opacity-70"
                            >
                              {team ? team.name : line.product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              Tamanho {line.variant.size}
                            </p>
                          </div>
                          <p className="text-sm font-semibold tabular-nums">
                            {formatBRL(line.lineTotalCents)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-border/60">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={() => updateQty(line.variantId, line.qty - 1)}
                              aria-label="Diminuir quantidade"
                              disabled={line.qty <= 1}
                            >
                              <Minus />
                            </Button>
                            <span className="w-6 text-center text-sm tabular-nums">
                              {line.qty}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={() => updateQty(line.variantId, line.qty + 1)}
                              aria-label="Aumentar quantidade"
                              disabled={line.qty >= line.variant.stockQty}
                            >
                              <Plus />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-foreground"
                            onClick={() => remove(line.variantId)}
                          >
                            <Trash2 data-icon="inline-start" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {crossSell.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Complete o look
                  </p>
                  <ul className="flex gap-3 overflow-x-auto no-scrollbar">
                    {crossSell.map((p) => {
                      const team = teamBySlug(p.slug);
                      const { product: shots } = splitImages(p.images);
                      const image = shots[0] ?? p.images[0];
                      const firstAvailable = p.variants.find(
                        (v) => v.stockQty > 0,
                      );
                      return (
                        <li key={p.id} className="w-36 flex-none">
                          <Link
                            href={`/produtos/${p.slug}`}
                            onClick={close}
                            className="group block"
                          >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                              {image && (
                                <Image
                                  src={image}
                                  alt={p.name}
                                  fill
                                  sizes="144px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                />
                              )}
                            </div>
                            <p className="mt-2 truncate text-xs font-medium">
                              {team?.shortName ?? p.name}
                            </p>
                            <p className="text-xs font-semibold tabular-nums">
                              {formatBRL(p.priceCents)}
                            </p>
                          </Link>
                          {firstAvailable && (
                            <button
                              type="button"
                              onClick={() =>
                                add(firstAvailable.id, 1)
                              }
                              className="mt-1.5 w-full rounded-full border border-border/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-foreground hover:text-foreground transition"
                            >
                              + Adicionar
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {!isEmpty && (
          <SheetFooter className="gap-3 border-t border-border/60">
            <FreeShippingBar subtotalCents={subtotalCents} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatBRL(subtotalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-turf/10 px-3 py-2 text-sm text-turf">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Zap className="size-3.5" /> Com PIX ({PIX_DISCOUNT_PCT}% OFF)
              </span>
              <span className="font-semibold tabular-nums">
                {formatBRL(pixTotalCents)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Frete calculado no checkout · desconto aplicado automático
            </p>
            <Separator />
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full bg-turf text-base font-semibold text-turf-foreground hover:bg-turf/90"
            >
              <Link href="/checkout" onClick={close}>
                Finalizar compra
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
