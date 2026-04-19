"use client";

import { Progress } from "@/components/ui/progress";
import { Truck, CheckCircle2 } from "lucide-react";
import { formatBRL } from "@/lib/money";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  amountToFreeShipping,
} from "@/lib/shipping";

export function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  const remaining = amountToFreeShipping(subtotalCents);
  const reached = remaining === 0;
  const pct = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100),
  );

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs">
        {reached ? (
          <>
            <CheckCircle2 className="size-4 text-foreground" aria-hidden />
            <span className="font-medium">Frete grátis desbloqueado.</span>
          </>
        ) : (
          <>
            <Truck className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">
              Faltam{" "}
              <span className="font-medium text-foreground">
                {formatBRL(remaining)}
              </span>{" "}
              para frete grátis.
            </span>
          </>
        )}
      </div>
      <Progress value={subtotalCents === 0 ? 0 : Math.max(4, pct)} />
    </div>
  );
}
