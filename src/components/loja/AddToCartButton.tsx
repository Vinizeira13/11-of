"use client";

import { useState, useTransition, type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product, Variant } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { SizeSelector } from "@/components/loja/SizeSelector";
import { useCart } from "@/components/loja/cart/CartContext";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  className,
  sizeHeaderExtra,
}: {
  product: Product;
  className?: string;
  sizeHeaderExtra?: ReactNode;
}) {
  const firstAvailable =
    product.variants.find((v) => v.stockQty > 0) ?? null;
  const [variant, setVariant] = useState<Variant | null>(firstAvailable);
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

    startTransition(async () => {
      const ok =
        fromEl && imageSrc
          ? await addWithFlight(variant.id, 1, { fromEl, imageSrc })
          : await add(variant.id, 1);
      if (ok) {
        toast.success(`${product.name} (${variant.size}) adicionado`, {
          description: formatBRL(product.priceCents),
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
