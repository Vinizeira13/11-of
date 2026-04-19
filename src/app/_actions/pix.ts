"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createPixCharge } from "@/lib/pague/client";

export async function regeneratePixAction(orderId: string) {
  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, short_code, customer_name, customer_email, customer_doc, customer_phone,
       total_cents, payment_status`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false as const, error: "Pedido não encontrado." };
  if (order.payment_status === "completed") {
    return { ok: false as const, error: "Pedido já foi pago." };
  }

  try {
    const charge = await createPixCharge({
      amount: order.total_cents,
      description: `Pedido ${order.short_code}`,
      externalId: order.id,
      customer: {
        name: order.customer_name,
        document: order.customer_doc,
        email: order.customer_email,
        phone: order.customer_phone ?? undefined,
      },
    });

    await supabase
      .from("orders")
      .update({
        payment_id: charge.id,
        pix_copy_paste: charge.pixCopyPaste,
        pix_qr_code_base64: charge.pixQrCodeBase64,
        pix_expires_at: charge.expiresAt,
      })
      .eq("id", orderId);

    revalidatePath(`/pedido/${orderId}`);
    return {
      ok: true as const,
      pixCopyPaste: charge.pixCopyPaste,
      pixExpiresAt: new Date(charge.expiresAt).getTime(),
    };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Falha ao gerar PIX.",
    };
  }
}
