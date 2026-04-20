"use client";

/**
 * Deprecated: the previous implementation displayed a fabricated purchase
 * notification ("SP comprou há 14 min") with zero real data. Removed to
 * avoid deceiving the customer. When real sales are instrumented (via a
 * websocket/realtime channel on the `orders` table), wire a new component
 * that consumes that stream.
 */
export function RecentPurchaseToast() {
  return null;
}
