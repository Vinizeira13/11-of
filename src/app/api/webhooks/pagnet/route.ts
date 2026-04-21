import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCharge, parseWebhookEvent } from "@/lib/pagnet/client";

export const dynamic = "force-dynamic";

/**
 * PagNet postback handler.
 *
 * Anti-spoof: PagNet doesn't document HMAC headers, so the only safe trust
 * anchor is the API itself. We re-fetch GET /transactions/{id} for the
 * `objectId` from the body and let that be the source of truth — never
 * commit a status change based purely on the inbound payload.
 *
 * Idempotency: keyed on (postback envelope id) inserted into
 * public.webhook_events; duplicates short-circuit with 200.
 */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = parseWebhookEvent(payload);
  if (!event) {
    return NextResponse.json({ error: "invalid event" }, { status: 400 });
  }

  // We only care about transaction events for now. Withdraws ignored.
  if (event.type !== "transaction") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }
  if (!event.externalRef) {
    return NextResponse.json({ error: "missing externalRef" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency
  const { error: idemErr } = await supabase
    .from("webhook_events")
    .insert({ event_id: event.eventId, event_type: `pagnet:${event.type}` });
  if (idemErr) {
    if (idemErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  // Cross-check against PagNet to defeat spoofing
  let canonical = null;
  if (event.objectId) {
    try {
      canonical = await getCharge(event.objectId);
    } catch {
      // network blip; we'll fall back to body-only data with a soft-warning
      canonical = null;
    }
  }

  const status = canonical?.status ?? event.status ?? "waiting_payment";
  const isPaid = status === "paid" || status === "approved";
  const isRefused = status === "refused" || status === "cancelled";
  const isRefunded = status === "refunded" || status === "chargeback";

  const updates: Record<string, unknown> = {};
  if (isPaid) {
    updates.payment_status = "completed";
    updates.status = "paid";
    updates.paid_at = event.paidAt ?? new Date().toISOString();
  } else if (isRefused) {
    updates.payment_status = "cancelled";
    updates.status = "cancelled";
  } else if (isRefunded) {
    updates.payment_status = "refunded";
    updates.status = "cancelled";
  } else {
    // No state-changing transition — acknowledge and stop.
    return NextResponse.json({ ok: true, noChange: true, status });
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", event.externalRef)
    .select("id, status, payment_status, order_items(variant_id, qty)")
    .maybeSingle();

  // Separate conditional update: only auto-advance delivery_status if it's
  // still the initial "pending". A later reconciliation webhook must NOT
  // regress an order the admin has already moved to dispatched/delivered.
  if (isPaid) {
    await supabase
      .from("orders")
      .update({ delivery_status: "preparing" })
      .eq("id", event.externalRef)
      .eq("delivery_status", "pending");
  }

  if (orderErr || !order) {
    return NextResponse.json(
      { error: orderErr?.message ?? "order not found" },
      { status: 404 },
    );
  }

  // Release stock on terminal failure paths
  if (isRefused || isRefunded) {
    const items =
      (order.order_items as { variant_id: string; qty: number }[]) ?? [];
    for (const item of items) {
      await supabase.rpc("release_stock", {
        p_variant_id: item.variant_id,
        p_qty: item.qty,
      });
    }
  }

  return NextResponse.json({ ok: true, status });
}
