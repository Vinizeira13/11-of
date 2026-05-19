"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";
import {
  PDP_VARIANT_CHANGED,
  emitRequestAdd,
  type PdpVariantChangedDetail,
} from "@/lib/pdp-events";

export function StickyMobileCTA({
  priceCents,
  compareAtCents,
  isSoldOut,
}: {
  priceCents: number;
  compareAtCents: number | null;
  isSoldOut: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [sizeLabel, setSizeLabel] = useState<string | null>(null);

  useEffect(() => {
    const target = document.getElementById("pdp-cta");
    if (!target) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onChanged(e: Event) {
      const detail = (e as CustomEvent<PdpVariantChangedDetail>).detail;
      if (!detail) return;
      setReady(detail.ready);
      setSizeLabel(detail.sizeLabel);
    }
    window.addEventListener(PDP_VARIANT_CHANGED, onChanged);
    return () => window.removeEventListener(PDP_VARIANT_CHANGED, onChanged);
  }, []);

  function handleClick() {
    if (isSoldOut) return;
    if (ready) {
      emitRequestAdd();
      return;
    }
    document
      .getElementById("pdp-cta")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const pixCents = Math.round(priceCents * (1 - PIX_DISCOUNT_PCT / 100));
  const buttonLabel = isSoldOut
    ? "Esgotado"
    : ready
      ? "Adicionar ao carrinho"
      : "Escolher tamanho";

  return (
    <div
      data-visible={visible}
      data-mobile-cta-visible={visible}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-200 data-[visible=false]:translate-y-full pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-semibold leading-none tabular-nums">
              {formatBRL(priceCents)}
            </span>
            {compareAtCents && compareAtCents > priceCents && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatBRL(compareAtCents)}
              </span>
            )}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-turf">
            <Zap className="size-3" />
            {ready && sizeLabel ? (
              <>
                Tam. {sizeLabel} · PIX {formatBRL(pixCents)}
              </>
            ) : (
              <>
                PIX {PIX_DISCOUNT_PCT}% · {formatBRL(pixCents)}
              </>
            )}
          </p>
        </div>
        <Button
          onClick={handleClick}
          disabled={isSoldOut}
          size="lg"
          className="h-12 min-w-[160px] flex-1 rounded-full bg-turf text-sm font-semibold text-turf-foreground hover:bg-turf/90 disabled:bg-muted"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
