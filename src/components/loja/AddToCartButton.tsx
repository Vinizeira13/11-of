"use client";

import { useState, useTransition, type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product, Variant } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { SizeSelector } from "@/components/loja/SizeSelector";
import {
  PlayerNamePicker,
  type PlayerNamePickerValue,
} from "@/components/loja/PlayerNamePicker";
import { useCart } from "@/components/loja/cart/CartContext";
import { formatBRL } from "@/lib/money";
import {
  formatPersonalization,
  type PlayerOption,
} from "@/lib/personalization";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  className,
  sizeHeaderExtra,
  playerOptions,
}: {
  product: Product;
  className?: string;
  sizeHeaderExtra?: ReactNode;
  playerOptions?: readonly PlayerOption[];
}) {
  const firstAvailable =
    product.variants.find((v) => v.stockQty > 0) ?? null;
  const [variant, setVariant] = useState<Variant | null>(firstAvailable);
  const [picker, setPicker] = useState<PlayerNamePickerValue>({ player: null });
  const [isPending, startTransition] = useTransition();
  const { add, addWithFlight } = useCart();

  const allOutOfStock = product.variants.every((v) => v.stockQty === 0);
  const disabled = !variant || variant.stockQty === 0 || allOutOfStock;

  function handleAdd() {
    if (!variant) return;
    const fromEl = document.querySelector<HTMLElement>(
      '[data-fly-source="product-gallery"]',
    );
    const imageSrc = product.images[0];
    const personalization = picker.player
      ? formatPersonalization(picker.player)
      : undefined;

    startTransition(async () => {
      const ok =
        fromEl && imageSrc
          ? await addWithFlight(
              variant.id,
              1,
              { fromEl, imageSrc },
              personalization,
            )
          : await add(variant.id, 1, personalization);
      if (ok) {
        toast.success(`${product.name} (${variant.size}) adicionado`, {
          description: personalization
            ? `Nome: ${personalization} · ${formatBRL(product.priceCents)}`
            : formatBRL(product.priceCents),
        });
      }
    });
  }

  return (
    <div className={cn("space-y-5", className)}>
      <SizeSelector
        variants={product.variants}
        onChange={setVariant}
        headerExtra={sizeHeaderExtra}
      />

      {playerOptions && playerOptions.length > 0 && (
        <PlayerNamePicker
          options={playerOptions}
          value={picker}
          onChange={setPicker}
        />
      )}

      <Button
        type="button"
        size="lg"
        onClick={handleAdd}
        disabled={disabled || isPending}
        className="h-14 w-full rounded-full bg-turf text-base font-semibold text-turf-foreground hover:bg-turf/90 disabled:bg-muted"
      >
        {allOutOfStock ? (
          "Esgotado"
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4" />
            {isPending ? "Adicionando…" : "Adicionar ao carrinho"}
          </>
        )}
      </Button>
    </div>
  );
}
