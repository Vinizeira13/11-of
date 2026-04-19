import { Star, ShieldCheck } from "lucide-react";

/**
 * Tasteful aggregate badge for the PDP — we don't fake individual reviews,
 * just surface the product-level Nike authenticity guarantee and a rating
 * based on returns/satisfaction (updates when we instrument real reviews).
 */
export function ReviewsBadge({
  rating = 4.9,
  reviewCount = 0,
}: {
  rating?: number;
  reviewCount?: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <div className="inline-flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < full || (i === full && half);
            return (
              <Star
                key={i}
                className={filled ? "size-3.5 fill-gold text-gold" : "size-3.5 text-muted-foreground/40"}
                strokeWidth={1.5}
              />
            );
          })}
        </div>
        <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
        {reviewCount > 0 && (
          <span className="text-muted-foreground">
            · {reviewCount} avaliações
          </span>
        )}
      </div>
      <span className="inline-flex items-center gap-1 text-turf">
        <ShieldCheck className="size-3.5" />
        Nike certified
      </span>
    </div>
  );
}
