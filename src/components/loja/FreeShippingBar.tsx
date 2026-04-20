import { Truck, Check } from "lucide-react";
import { formatBRL } from "@/lib/money";
import {
  amountToFreeShipping,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "@/lib/shipping";

/**
 * Progress bar for free-shipping gate. When the cart is already above the
 * threshold, shows a confirmation pill. Below the threshold, shows the
 * amount remaining + a progress bar. Pure server-rendered — no state.
 */
export function FreeShippingBar({
  subtotalCents,
}: {
  subtotalCents: number;
}) {
  const gap = amountToFreeShipping(subtotalCents);
  const pct = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100),
  );

  if (gap === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-turf/40 bg-turf/10 px-4 py-3 text-sm font-medium text-turf">
        <Check className="size-4" aria-hidden />
        Frete grátis liberado no teu pedido.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/50 px-4 py-3">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 text-turf" aria-hidden />
        <span>
          Faltam{" "}
          <span className="font-semibold text-foreground">
            {formatBRL(gap)}
          </span>{" "}
          pra <span className="font-semibold text-turf">frete grátis</span>
        </span>
      </p>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso pro frete grátis"
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60"
      >
        <div
          className="h-full rounded-full bg-turf transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
