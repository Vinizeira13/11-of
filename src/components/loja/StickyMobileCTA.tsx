"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
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

  return (
    <div
      data-visible={visible}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-200 data-[visible=false]:translate-y-full lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-lg font-semibold leading-none tabular-nums">
            {formatBRL(priceCents)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {compareAtCents && compareAtCents > priceCents ? (
              <>
                <span className="line-through">
                  {formatBRL(compareAtCents)}
                </span>{" "}
                ·{" "}
              </>
            ) : null}
            PIX {PIX_DISCOUNT_PCT}% OFF
          </p>
        </div>
        <Button
          onClick={scrollToCTA}
          disabled={isSoldOut}
          size="lg"
          className="h-11 flex-1 rounded-full text-base font-medium"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isSoldOut ? "Esgotado" : "Escolher tamanho"}
        </Button>
      </div>
    </div>
  );
}
