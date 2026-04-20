"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";

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

  function scrollToCTA() {
    document
      .getElementById("pdp-cta")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const pixCents = Math.round(priceCents * (1 - PIX_DISCOUNT_PCT / 100));
  const hasOldPrice = compareAtCents && compareAtCents > priceCents;

  return (
    <div
      data-visible={visible}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-200 data-[visible=false]:translate-y-full lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-semibold leading-none tabular-nums">
              {formatBRL(priceCents)}
            </span>
            {hasOldPrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatBRL(compareAtCents!)}
              </span>
            )}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-turf">
            <Zap className="size-3" />
            PIX {PIX_DISCOUNT_PCT}% · {formatBRL(pixCents)}
          </p>
        </div>
        <Button
          onClick={scrollToCTA}
          disabled={isSoldOut}
          size="lg"
          className="h-11 flex-1 rounded-full bg-turf text-base font-semibold text-turf-foreground hover:bg-turf/90 disabled:bg-muted"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isSoldOut ? "Esgotado" : "Escolher tamanho"}
        </Button>
      </div>
    </div>
  );
}
