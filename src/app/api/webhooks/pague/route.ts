import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  parseWebhookEvent,
  verifyWebhookSignature,
} from "@/lib/pague/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature =
    req.headers.get("x-pague-signature") ??
    req.headers.get("x-webhook-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = parseWebhookEvent(payload);
  if (!event) {
    return NextResponse.json({ error: "invalid event" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { error: idempotencyErr } = await supabase
    .from("webhook_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (idempotencyErr) {
    if (idempotencyErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  const updates: Record<string, unknown> = {};
  if (event.type === "charge.paid") {
    updates.payment_status = "completed";
    updates.status = "paid";
    updates.paid_at = event.paidAt ?? new Date().toISOString();
  } else if (event.type === "charge.expired") {
    updates.payment_status = "failed";
  } else if (event.type === "charge.cancelled") {
    updates.payment_status = "cancelled";
    updates.status = "cancelled";
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", event.externalId)
    .select(
      "id, status, payment_status, order_items(variant_id, qty)",
    )
    .maybeSingle();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: orderErr?.message ?? "order not found" },
      { status: 404 },
    );
  }

  // Return stock on cancel/expire
  if (event.type === "charge.cancelled" || event.type === "charge.expired") {
    const items =
      (order.order_items as { variant_id: string; qty: number }[]) ?? [];
    for (const item of items) {
      await supabase.rpc("release_stock", {
        p_variant_id: item.variant_id,
        p_qty: item.qty,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
