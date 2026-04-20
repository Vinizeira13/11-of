import { Flame } from "lucide-react";
import type { Variant } from "@/lib/catalog";

const INITIAL_STOCK_PER_SIZE = 10; // baseline used to derive "% sold" visual

export function StockProgress({ variants }: { variants: Variant[] }) {
  if (variants.length === 0) return null;
  const total = variants.reduce((s, v) => s + v.stockQty, 0);
  const capacity = variants.length * INITIAL_STOCK_PER_SIZE;
  const sold = Math.max(0, capacity - total);
  const soldPct = Math.min(100, Math.round((sold / capacity) * 100));
  const remainingPct = 100 - soldPct;

  let intent: "hot" | "warm" | "cold" = "cold";
  if (remainingPct <= 30) intent = "hot";
  else if (remainingPct <= 55) intent = "warm";

  const label =
    total === 0
      ? "Esgotado"
      : total <= 5
        ? `Apenas ${total} restantes da tiragem`
        : total <= 15
          ? `${total} unidades restantes · ${soldPct}% vendido`
          : `${soldPct}% da tiragem já saiu`;

  const color =
    intent === "hot"
      ? "bg-orange-400"
      : intent === "warm"
        ? "bg-gold"
        : "bg-turf";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
          {intent === "hot" && (
            <Flame className="size-3.5 text-orange-400" aria-hidden />
          )}
          {label}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {sold}/{capacity}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60"
        role="progressbar"
        aria-valuenow={soldPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${soldPct}%` }}
        />
      </div>
    </div>
  );
}
