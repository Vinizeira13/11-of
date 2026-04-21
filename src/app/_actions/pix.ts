"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createPixCharge } from "@/lib/pagnet/client";
import { SITE_URL } from "@/lib/brand";

const PIX_TTL_MS = 24 * 60 * 60 * 1000; // PagNet uses 1-day expirationDate

export async function regeneratePixAction(orderId: string) {
  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, short_code, customer_name, customer_email, customer_doc, customer_phone,
       total_cents, payment_status, shipping_address, shipping_cents,
       order_items(qty, unit_price_cents, product_name_snapshot, variant_size_snapshot)`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false as const, error: "Pedido não encontrado." };
  if (order.payment_status === "completed") {
    return { ok: false as const, error: "Pedido já foi pago." };
  }

  const addr = order.shipping_address as {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
  };

  const items =
    (order.order_items as Array<{
      qty: number;
      unit_price_cents: number;
      product_name_snapshot: string;
      variant_size_snapshot: string;
    }>) ?? [];

  try {
    const charge = await createPixCharge({
      amountCents: order.total_cents,
      externalRef: order.id,
      postbackUrl: `${SITE_URL}/api/webhooks/pagnet`,
      metadata: JSON.stringify({
        orderId: order.id,
        shortCode: order.short_code,
      }),
      items: items.map((i) => ({
        title: `${i.product_name_snapshot} (${i.variant_size_snapshot})`,
        unitPriceCents: i.unit_price_cents,
        quantity: i.qty,
        tangible: false,
      })),
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone ?? "",
        cpf: order.customer_doc,
      },
      shipping: {
        feeCents: order.shipping_cents,
        address: {
          street: addr.logradouro,
          streetNumber: addr.numero,
          complement: addr.complemento,
          neighborhood: addr.bairro,
          city: addr.cidade,
          state: addr.uf,
          zipCode: addr.cep,
          country: "BR",
        },
      },
    });

    const expiresAtMs = Date.now() + PIX_TTL_MS;

    await supabase
      .from("orders")
      .update({
        payment_id: charge.id,
        pix_copy_paste: charge.pixCopyPaste,
        pix_expires_at: new Date(expiresAtMs).toISOString(),
      })
      .eq("id", orderId);

    revalidatePath(`/pedido/${orderId}`);
    return {
      ok: true as const,
      pixCopyPaste: charge.pixCopyPaste,
      pixExpiresAt: expiresAtMs,
    };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Falha ao gerar PIX.",
    };
  }
}
