import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Truck } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { splitImages, pickBackImage } from "@/lib/images";
import { teamBySlug } from "@/lib/teams";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_CENTS, PIX_DISCOUNT_PCT } from "@/lib/brand";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({
  product,
  priority = false,
  showBestseller = false,
}: {
  product: Product;
  priority?: boolean;
  showBestseller?: boolean;
}) {
  const totalStock = product.variants.reduce((s, v) => s + v.stockQty, 0);
  const isSoldOut = totalStock === 0;
  const isLowStock = !isSoldOut && totalStock <= 6;

  const { product: productShots } = splitImages(product.images);
  const front = productShots[0] ?? product.images[0];
  const back = pickBackImage(product.images) ?? front;

  const hasDiscount =
    product.compareAtCents !== null &&
    product.compareAtCents > product.priceCents;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceCents / product.compareAtCents!) * 100)
    : 0;
  const hasFreeShipping = product.priceCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const pixCents = Math.round(
    product.priceCents * (1 - PIX_DISCOUNT_PCT / 100),
  );

  const team = teamBySlug(product.slug);

  return (
    <div className="group relative">
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton
          productId={product.id}
          productName={product.name}
          size="sm"
        />
      </div>

      <Link
        href={`/produtos/${product.slug}`}
        className="block focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={front}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className={cn(
              "object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-[1.02]",
              isSoldOut && "opacity-60",
            )}
          />
          <Image
            src={back}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              "object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.02]",
              isSoldOut && "group-hover:opacity-40",
            )}
          />

          {team && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              <span aria-hidden>{team.flag}</span>
              {team.code}
            </div>
          )}

          <div className="absolute bottom-14 left-3 flex flex-wrap gap-1.5">
            {showBestseller && !isSoldOut && (
              <span className="rounded-full bg-turf px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-turf-foreground">
                ★ mais vendida
              </span>
            )}
            {hasDiscount && !isSoldOut && !showBestseller && (
              <span className="rounded-full bg-turf px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-turf-foreground">
                −{discountPct}%
              </span>
            )}
            {isLowStock && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black">
                últimas {totalStock}
              </span>
            )}
            {hasFreeShipping && !isSoldOut && !isLowStock && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                <Truck className="size-2.5" /> frete grátis
              </span>
            )}
            {isSoldOut && (
              <span className="rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
                esgotado
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="inline-flex flex-1 items-center justify-between gap-2 rounded-full bg-turf px-4 py-2.5 text-xs font-semibold text-turf-foreground">
              Ver detalhes
              <ArrowUpRight className="size-3.5" />
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tracking-tight">
              {team ? team.name : product.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Home 2026 · Nike · PIX {formatBRL(pixCents)}
            </p>
          </div>
          <div className="flex shrink-0 items-baseline gap-1.5 text-right">
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatBRL(product.compareAtCents!)}
              </span>
            )}
            <span className="text-sm font-semibold tabular-nums">
              {formatBRL(product.priceCents)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
