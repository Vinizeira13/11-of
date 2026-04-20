import { Flame } from "lucide-react";
import type { Variant } from "@/lib/catalog";

/**
 * Honest stock indicator. Shows ONLY real, verifiable signals derived from
 * the actual `variants[i].stockQty` numbers. No invented capacity, no fake
 * "X% sold" math — if stock is plentiful across the board, nothing renders.
 *
 * Triggers:
 *   - any variant at 0 in a set of 4 → "Esgotado em <size>"
 *   - any variant ≤ 3 → "Apenas X em <size>"
 *   - total stock across sizes ≤ 8 → "Últimas 8 unidades no total"
 */
export function StockProgress({ variants }: { variants: Variant[] }) {
  if (variants.length === 0) return null;
  const total = variants.reduce((s, v) => s + v.stockQty, 0);
  const low = variants.filter((v) => v.stockQty > 0 && v.stockQty <= 3);
  const gone = variants.filter((v) => v.stockQty === 0);

  const hasSignal = total === 0 || total <= 8 || low.length > 0 || gone.length > 0;
  if (!hasSignal) return null;

  if (total === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-xs font-medium text-orange-300">
        <Flame className="size-3.5" aria-hidden />
        Esgotado em todos os tamanhos — entre pra lista de espera.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {total <= 8 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-400/10 px-2.5 py-1 font-medium text-orange-300">
          <Flame className="size-3" aria-hidden />
          Últimas {total} unidades no total
        </span>
      )}
      {low.map((v) => (
        <span
          key={v.id}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-foreground/80"
        >
          <span className="font-medium text-foreground">Tam. {v.size}</span>
          <span className="text-muted-foreground">
            · apenas {v.stockQty}
          </span>
        </span>
      ))}
      {gone.map((v) => (
        <span
          key={v.id}
          className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-2.5 py-1 text-muted-foreground line-through"
        >
          Tam. {v.size}
        </span>
      ))}
    </div>
  );
}
