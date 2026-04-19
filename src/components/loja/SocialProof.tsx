"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp } from "lucide-react";

/**
 * Lightweight social proof widget for the PDP. Generates a stable pseudo-random
 * "viewers right now" count derived from the product ID + current hour, so
 * every user looking at the same product sees the same number within an hour
 * window — looks organic, not spammy, and doesn't require a real analytics
 * feed in the MVP. Replace with a real metric whenever instrumentation is in.
 */
export function SocialProof({
  productId,
  isBestseller,
}: {
  productId: string;
  isBestseller?: boolean;
}) {
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    // Seed: hash of productId + current hour bucket
    const hour = Math.floor(Date.now() / (1000 * 60 * 30));
    let h = 0;
    for (let i = 0; i < productId.length; i++) {
      h = (h * 31 + productId.charCodeAt(i) + hour) | 0;
    }
    const base = 8 + Math.abs(h) % 32; // 8-39 viewers
    setViewers(base);

    // gentle drift ± every ~12s
    const id = setInterval(() => {
      setViewers((v) => {
        if (v === null) return v;
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(5, Math.min(48, v + delta));
      });
    }, 12000);
    return () => clearInterval(id);
  }, [productId]);

  if (viewers === null) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-2.5 py-1">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turf opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-turf" />
        </span>
        <Eye className="size-3" />
        <span>
          <span className="font-semibold text-foreground">{viewers}</span>{" "}
          <span className="text-muted-foreground">vendo agora</span>
        </span>
      </span>
      {isBestseller && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-turf/40 bg-turf/10 px-2.5 py-1 font-medium text-turf">
          <TrendingUp className="size-3" />
          Mais vendida da semana
        </span>
      )}
    </div>
  );
}
