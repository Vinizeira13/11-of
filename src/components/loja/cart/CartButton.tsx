"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "./CartContext";

export function CartButton({ className }: { className?: string }) {
  const { count, toggle, cartButtonRef } = useCart();

  return (
    <button
      ref={cartButtonRef}
      type="button"
      onClick={toggle}
      aria-label={
        count > 0
          ? `Abrir carrinho com ${count} ${count === 1 ? "item" : "itens"}`
          : "Abrir carrinho"
      }
      className={cn(
        "relative inline-flex items-center justify-center rounded-full p-2 transition hover:bg-muted origin-center",
        className,
      )}
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-turf px-1 text-[10px] font-semibold leading-none text-turf-foreground tabular-nums"
          style={{ height: 16 }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
