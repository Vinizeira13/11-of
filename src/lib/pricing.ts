import { PIX_DISCOUNT_PCT } from "@/lib/brand";

export function pixDiscountCents(subtotalCents: number): number {
  return Math.round((subtotalCents * PIX_DISCOUNT_PCT) / 100);
}
