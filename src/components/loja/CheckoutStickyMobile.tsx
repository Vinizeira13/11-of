"use client";

import { Zap } from "lucide-react";
import { formatBRL } from "@/lib/money";

/**
 * Mobile-only sticky bar at the bottom of the checkout flow. Keeps total +
 * PIX savings callout always visible, and hosts a secondary CTA that
 * scrolls to the submit button when the user is deep in the form.
 */
export function CheckoutStickyMobile({
  totalCents,
  pixSavingsCents,
  itemsCount,
}: {
  totalCents: number;
  pixSavingsCents: number;
  itemsCount: number;
}) {
  function scrollToPay() {
    const form = document.querySelector("form[action]");
    const btn = form?.querySelector("button[type='submit']");
    (btn ?? form)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total · {itemsCount} {itemsCount === 1 ? "item" : "itens"}
          </p>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tabular-nums leading-none">
              {formatBRL(totalCents)}
            </span>
            {pixSavingsCents > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-turf">
                <Zap className="size-3" />
                −{formatBRL(pixSavingsCents)} no PIX
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToPay}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-turf px-5 py-2.5 text-sm font-semibold text-turf-foreground transition hover:bg-turf/90"
        >
          Pagar PIX
        </button>
      </div>
    </div>
  );
}
