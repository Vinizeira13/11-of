"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, MapPin } from "lucide-react";
import { estimateDelivery, formatDeliveryRange } from "@/lib/delivery";
import { loadDraft } from "@/lib/checkout-draft";

type Eta = {
  range: string;
  city: string;
  uf: string;
} | null;

/**
 * Surfaces the per-CEP delivery estimate inside the order summary.
 *
 * Reads the buyer's CEP + UF from the checkout draft (which `CheckoutForm`
 * persists on every change) and re-runs `estimateDelivery` on updates.
 *
 * Renders nothing when we don't have enough data yet, so the sidebar stays
 * clean until the buyer fills the CEP / picks a city.
 */
export function CheckoutDeliveryEta() {
  const [eta, setEta] = useState<Eta>(null);

  function recompute() {
    const d = loadDraft();
    if (!d.uf || !d.cidade) {
      setEta(null);
      return;
    }
    const e = estimateDelivery(d.uf, d.cidade);
    setEta({ range: formatDeliveryRange(e), city: d.cidade, uf: d.uf });
  }

  useEffect(() => {
    recompute();
    const onDraft = () => recompute();
    // React to typing in any field of the form (we save on every change)
    window.addEventListener("storage", onDraft);
    const id = window.setInterval(recompute, 1500);
    return () => {
      window.removeEventListener("storage", onDraft);
      window.clearInterval(id);
    };
  }, []);

  if (!eta) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-turf/30 bg-turf/10 px-3.5 py-2.5 text-xs">
      <CalendarCheck className="mt-0.5 size-4 shrink-0 text-turf" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-turf">Chega entre {eta.range}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3" aria-hidden />
          {eta.city} · {eta.uf}
        </p>
      </div>
    </div>
  );
}
