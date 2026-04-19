"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  size = "md",
  className,
}: {
  productId: string;
  productName?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { has, toggle, mounted } = useWishlist();
  const active = mounted && has(productId);

  const sizing =
    size === "sm" ? "size-7" : "size-9";
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggle(productId);
    if (nowActive) {
      toast.success("Adicionado aos favoritos", {
        description: productName,
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "inline-flex items-center justify-center rounded-full border backdrop-blur transition",
        sizing,
        active
          ? "border-turf bg-turf/15 text-turf hover:bg-turf/25"
          : "border-white/20 bg-black/40 text-white/80 hover:border-white hover:text-white",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, active && "fill-current")}
      />
    </button>
  );
}
