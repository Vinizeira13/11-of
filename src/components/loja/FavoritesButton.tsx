"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

export function FavoritesButton() {
  const { count, mounted } = useWishlist();
  const showBadge = mounted && count > 0;

  return (
    <Link
      href="/favoritos"
      className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
      aria-label={
        showBadge
          ? `Favoritos (${count})`
          : "Favoritos"
      }
    >
      <Heart className="size-4" />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-turf px-1 text-[10px] font-semibold leading-none text-turf-foreground tabular-nums"
          style={{ height: 16 }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
