"use client";

import { useEffect, useRef } from "react";
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
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const sizing = size === "sm" ? "size-7" : "size-9";
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggle(productId);
    // Tiny pop micro-interaction on toggle.
    const el = btnRef.current;
    if (el) {
      el.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.18)" },
          { transform: "scale(1)" },
        ],
        { duration: 260, easing: "cubic-bezier(.32,.72,0,1.3)" },
      );
    }
    if (nowActive) {
      toast.success("Adicionado aos favoritos", {
        description: productName,
      });
    }
  }

  // Hint screen readers when status changes without spamming the live region
  useEffect(() => {
    if (!mounted) return;
    // no-op — reader will pick up aria-pressed change
  }, [active, mounted]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "inline-flex items-center justify-center rounded-full border backdrop-blur transition will-change-transform",
        sizing,
        active
          ? "border-turf bg-turf/15 text-turf hover:bg-turf/25"
          : "border-white/20 bg-black/40 text-white/80 hover:border-white hover:text-white",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, "transition-transform", active && "fill-current")}
      />
    </button>
  );
}
