"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog";
import { BLUR_DATA_URL } from "@/lib/images";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";

export type UpsellProduct = {
  slug: string;
  name: string;
  shortName?: string;
  flag?: string;
  priceCents: number;
  imageUrl: string;
};

/**
 * Shown right below the confirmed/pending order. Turns the "awaiting PIX"
 * dead time into a retention-engine: surfaces a one-shot coupon for the
 * next order + 4 curated complements based on what the buyer just got.
 *
 * Non-intrusive: everything goes to the PDP, never tries to mutate the
 * currently-paying order (complex + confusing in a PIX flow).
 */
export function PostPurchaseUpsell({
  products,
  couponCode,
  couponPct,
  couponExpiresAt,
}: {
  products: UpsellProduct[];
  couponCode: string;
  couponPct: number;
  couponExpiresAt: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      toast.success("Cupom copiado!", {
        description: `Cole ${couponCode} no próximo pedido.`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não rolou copiar — anota o código aí.");
    }
  }

  if (products.length === 0) return null;

  return (
    <section className="mx-auto mt-10 max-w-5xl px-4">
      {/* Coupon banner */}
      <div className="relative overflow-hidden rounded-2xl border border-turf/30 bg-gradient-to-br from-turf/[0.16] via-turf/[0.05] to-transparent p-5 md:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-shimmer opacity-30"
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-turf text-turf-foreground">
              <Gift className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-turf">
                Obrigado por comprar
              </p>
              <p className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">
                {couponPct}% OFF no próximo pedido.
              </p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Vale por {expiresInDays(couponExpiresAt)} dias em qualquer
                camisa da coleção. Cumula com o desconto PIX de{" "}
                {PIX_DISCOUNT_PCT}%.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyCode}
            aria-label={`Copiar código ${couponCode}`}
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-turf/60 bg-card/80 px-5 py-3 font-mono text-lg font-bold tracking-widest text-foreground transition hover:border-turf hover:bg-turf/10"
          >
            {couponCode}
            {copied ? (
              <Check className="size-4 text-turf" aria-hidden />
            ) : (
              <Copy className="size-4 text-muted-foreground transition group-hover:text-turf" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Related products grid */}
      <div className="mt-8 mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            <Sparkles className="inline size-3" /> Combina com teu pedido
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight md:text-3xl">
            Leva também.
          </h3>
        </div>
        <Link
          href="/produtos"
          className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground md:inline-flex"
        >
          Ver catálogo <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {products.map((p) => {
          const pix = Math.round(p.priceCents * (1 - PIX_DISCOUNT_PCT / 100));
          return (
            <Link
              key={p.slug}
              href={`/produtos/${p.slug}?ref=post-purchase&coupon=${couponCode}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 transition hover:border-foreground/60"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="(min-width:768px) 22vw, 45vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {p.flag && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    <span aria-hidden>{p.flag}</span>
                    {p.shortName}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-1 p-3">
                <p className="truncate text-sm font-medium leading-tight">
                  {p.name}
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatBRL(p.priceCents)}
                  </p>
                  <p className="text-[10px] font-medium text-turf">
                    PIX {formatBRL(pix)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function expiresInDays(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
}
