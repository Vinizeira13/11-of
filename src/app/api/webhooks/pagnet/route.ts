import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCharge,
  isPagnetConfigured,
  parseWebhookEvent,
} from "@/lib/pagnet/client";

export const dynamic = "force-dynamic";

/**
 * PagNet postback handler.
 *
 * Trust model:
 *   - The request body is attacker-controlled. We use it only to get
 *     objectId (transaction id) and eventId (idempotency key).
 *   - Everything that drives state transitions (status, externalRef,
 *     amount, paidAt) comes from GET /transactions/{objectId}, which is
 *     authenticated with our PagNet credentials — only our transactions
 *     are reachable, so the canonical response can't be forged.
 *
 * Without canonical truth, someone who knows a victim's order UUID could
 * POST a "paid" body pointing to any real paid transaction and we'd mark
 * the victim's order as paid. That's why canonical is required, not a
 * fallback.
 *
 * Idempotency: keyed on postback envelope id, inserted into
 * public.webhook_events. Duplicates short-circuit with 200.
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

  // Withdraws ignored — we only process transaction events.
  if (event.type !== "transaction") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }
  if (!event.objectId) {
    return NextResponse.json({ error: "missing objectId" }, { status: 400 });
  }

  const supabase = await createClient();

  // Idempotency — must come before the canonical fetch to avoid hammering
  // PagNet on duplicate postbacks.
  const { error: idemErr } = await supabase
    .from("webhook_events")
    .insert({ event_id: event.eventId, event_type: `pagnet:${event.type}` });
  if (idemErr) {
    if (idemErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  // Canonical truth is required — never fall back to body-only data.
  // If we're not configured (mock mode) the webhook shouldn't be in use
  // anyway; reject to avoid any chance of a dev deploy being spoofed.
  if (!isPagnetConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  let canonical;
  try {
    canonical = await getCharge(event.objectId);
  } catch {
    // Transient failure — tell PagNet to retry later.
    return NextResponse.json(
      { error: "canonical fetch failed" },
      { status: 503 },
    );
  }

  if (!canonical) {
    return NextResponse.json(
      { error: "unknown transaction" },
      { status: 404 },
    );
  }

  const orderId = canonical.externalRef;
  if (!orderId) {
    return NextResponse.json(
      { error: "canonical missing externalRef" },
      { status: 422 },
    );
  }

  const status = canonical.status;
  const isPaid = status === "paid" || status === "approved";
  const isRefused = status === "refused" || status === "cancelled";
  const isRefunded = status === "refunded" || status === "chargeback";

  if (!isPaid && !isRefused && !isRefunded) {
    return NextResponse.json({ ok: true, noChange: true, status });
  }

  // Amount cross-check — a paid/refunded transaction whose amount doesn't
  // match what we'd charged is a strong signal something's off (could be a
  // binding attack if externalRef somehow collided, or a data bug).
  const { data: orderCheck } = await supabase
    .from("orders")
    .select("total_cents")
    .eq("id", orderId)
    .maybeSingle();

  if (!orderCheck) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (
    canonical.amountCents > 0 &&
    canonical.amountCents !== orderCheck.total_cents
  ) {
    return NextResponse.json(
      {
        error: "amount mismatch",
        expected: orderCheck.total_cents,
        actual: canonical.amountCents,
      },
      { status: 422 },
    );
  }

  if (isPaid) {
    const { error: rpcErr } = await supabase.rpc("webhook_mark_paid", {
      p_order_id: orderId,
      p_paid_at: event.paidAt ?? new Date().toISOString(),
    });
    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status });
  }

  // Failure paths: mark order cancelled/refunded then release stock so
  // sizes go back to buyable.
  const terminalStatus = isRefused ? "cancelled" : "refunded";
  const { error: failErr } = await supabase.rpc("webhook_mark_failed", {
    p_order_id: orderId,
    p_payment_status: terminalStatus,
  });
  if (failErr) {
    return NextResponse.json({ error: failErr.message }, { status: 500 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("variant_id, qty")
    .eq("order_id", orderId);

  for (const item of (items as { variant_id: string; qty: number }[]) ?? []) {
    await supabase.rpc("release_stock", {
      p_variant_id: item.variant_id,
      p_qty: item.qty,
    });
  }

  return NextResponse.json({ ok: true, status });
}
