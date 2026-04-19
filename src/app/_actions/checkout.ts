"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { nanoid } from "nanoid";
import { clearCart, readCart } from "@/lib/cart";
import { cpfDigitsOnly, isValidCPF } from "@/lib/cpf";
import { resolveCartLines } from "@/lib/catalog";
import { pixDiscountCents } from "@/lib/pricing";
import { shippingFor } from "@/lib/shipping";
import { createServiceClient } from "@/lib/supabase/service";
import { createPixCharge } from "@/lib/pague/client";

const formSchema = z.object({
  email: z.string().email("Email inválido."),
  name: z.string().trim().min(3, "Informe o nome completo."),
  cpf: z
    .string()
    .transform(cpfDigitsOnly)
    .refine((v) => v.length === 11, "CPF inválido.")
    .refine(isValidCPF, "CPF inválido."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido."),
  cep: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP inválido."),
  logradouro: z.string().trim().min(1, "Informe o endereço."),
  numero: z.string().trim().min(1, "Informe o número."),
  complemento: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  bairro: z.string().trim().min(1, "Informe o bairro."),
  cidade: z.string().trim().min(1, "Informe a cidade."),
  uf: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v.length === 2, "UF inválida."),
});

export type CheckoutFormState = {
  fieldErrors?: Record<string, string>;
  formError?: string;
};

const EMPTY_STATE: CheckoutFormState = {};

export async function createOrderAction(
  _prev: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const lines = await readCart();
  if (lines.length === 0) return { formError: "Carrinho vazio." };

  const { resolved, subtotalCents, invalidIds } = await resolveCartLines(lines);
  if (invalidIds.length > 0 || resolved.length === 0) {
    return {
      formError: "Um ou mais itens ficaram indisponíveis. Revise seu carrinho.",
    };
  }

  const parsed = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }
  const data = parsed.data;

  const supabase = createServiceClient();

  const reservedVariants: { variantId: string; qty: number }[] = [];
  async function releaseAll() {
    for (const r of reservedVariants) {
      await supabase.rpc("release_stock", {
        p_variant_id: r.variantId,
        p_qty: r.qty,
      });
    }
  }

  for (const line of resolved) {
    const { data: ok, error } = await supabase.rpc("reserve_stock", {
      p_variant_id: line.variantId,
      p_qty: line.qty,
    });
    if (error) {
      await releaseAll();
      return { formError: "Falha ao reservar estoque." };
    }
    if (!ok) {
      await releaseAll();
      return {
        formError: `Sem estoque em ${line.product.name} (tam ${line.variant.size}).`,
      };
    }
    reservedVariants.push({ variantId: line.variantId, qty: line.qty });
  }

  const shippingCents = shippingFor(subtotalCents);
  const discountCents = pixDiscountCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents - discountCents;
  const shortCode = `ON-2026-${nanoid(6).toUpperCase()}`;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      short_code: shortCode,
      customer_email: data.email,
      customer_name: data.name,
      customer_doc: data.cpf,
      customer_phone: data.phone,
      shipping_address: {
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
      },
      shipping_cents: shippingCents,
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      total_cents: totalCents,
      status: "pending",
      payment_status: "pending",
    })
    .select("id, short_code")
    .single();

  if (orderErr || !order) {
    await releaseAll();
    return { formError: orderErr?.message ?? "Falha ao criar pedido." };
  }

  const { error: itemsErr } = await supabase.from("order_items").insert(
    resolved.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      variant_id: line.variantId,
      qty: line.qty,
      unit_price_cents: line.product.priceCents,
      product_name_snapshot: line.product.name,
      variant_size_snapshot: line.variant.size,
      image_snapshot: line.product.images[0] ?? null,
    })),
  );

  if (itemsErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    await releaseAll();
    return { formError: "Falha ao registrar itens." };
  }

  let charge;
  try {
    charge = await createPixCharge({
      amount: totalCents,
      description: `Pedido ${shortCode}`,
      externalId: order.id,
      customer: {
        name: data.name,
        document: data.cpf,
        email: data.email,
        phone: data.phone,
      },
    });
  } catch (err) {
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    await releaseAll();
    return {
      formError: err instanceof Error ? err.message : "Falha ao gerar PIX.",
    };
  }

  await supabase
    .from("orders")
    .update({
      payment_id: charge.id,
      pix_copy_paste: charge.pixCopyPaste,
      pix_qr_code_base64: charge.pixQrCodeBase64,
      pix_expires_at: charge.expiresAt,
    })
    .eq("id", order.id);

  await clearCart();
  redirect(`/pedido/${order.id}`);
  return EMPTY_STATE;
}
