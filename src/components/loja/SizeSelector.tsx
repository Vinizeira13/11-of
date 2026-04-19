"use client";

import { useState, type ReactNode } from "react";
import type { Variant } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 3;

export function SizeSelector({
  variants,
  onChange,
  headerExtra,
}: {
  variants: Variant[];
  onChange?: (variant: Variant | null) => void;
  headerExtra?: ReactNode;
}) {
  const firstAvailable = variants.find((v) => v.stockQty > 0) ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(
    firstAvailable?.id ?? null,
  );

  const selected = variants.find((v) => v.id === selectedId) ?? null;

  function pick(v: Variant) {
    if (v.stockQty === 0) return;
    setSelectedId(v.id);
    onChange?.(v);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <p className="text-sm font-medium">Tamanho</p>
          {selected && (
            <p className="text-xs text-muted-foreground">
              {stockLabel(selected)}
            </p>
          )}
        </div>
        {headerExtra}
      </div>

      <div
        role="radiogroup"
        aria-label="Tamanho"
        className="flex flex-wrap gap-2"
      >
        {variants.map((v) => {
          const isSelected = v.id === selectedId;
          const isOutOfStock = v.stockQty === 0;

          return (
            <button
              key={v.id}
              role="radio"
              aria-checked={isSelected}
              type="button"
              onClick={() => pick(v)}
              disabled={isOutOfStock}
              className={cn(
                "relative inline-flex h-12 min-w-14 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                isSelected
                  ? "border-turf bg-turf text-turf-foreground"
                  : "border-border/70 hover:border-foreground",
                isOutOfStock &&
                  "cursor-not-allowed border-border/40 text-muted-foreground line-through opacity-50 hover:border-border/40",
              )}
            >
              {v.size}
              {!isOutOfStock && v.stockQty <= LOW_STOCK_THRESHOLD && !isSelected && (
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 size-2 rounded-full bg-orange-400"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function stockLabel(v: Variant): string {
  if (v.stockQty === 0) return "Esgotado";
  if (v.stockQty <= LOW_STOCK_THRESHOLD) {
    return v.stockQty === 1
      ? `Última em ${v.size}`
      : `Últimas ${v.stockQty} em ${v.size}`;
  }
  return "Em estoque";
}
