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
import { createPixCharge } from "@/lib/pagnet/client";
import { SITE_URL } from "@/lib/brand";

const PIX_TTL_MS = 24 * 60 * 60 * 1000; // PagNet 1-day expiration

const formSchema = z.object({
  email: z.string().email("Falta o @ ou o domínio — ex: voce@gmail.com."),
  name: z
    .string()
    .trim()
    .refine((v) => v.split(/\s+/).length >= 2, "Nome e sobrenome, como no RG."),
  cpf: z
    .string()
    .transform(cpfDigitsOnly)
    .refine((v) => v.length === 11, "CPF tem 11 dígitos.")
    .refine(isValidCPF, "Os dígitos não batem — confira o CPF."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(
      (v) => v.length >= 10 && v.length <= 11,
      "Número incompleto — DDD + 9 dígitos do celular.",
    ),
  cep: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP tem 8 dígitos (ex: 01234-567)."),
  logradouro: z.string().trim().min(1, "Digite a rua ou avenida."),
  numero: z.string().trim().min(1, "Informe o número (ou 's/n')."),
  complemento: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  bairro: z.string().trim().min(1, "Qual o bairro?"),
  cidade: z.string().trim().min(1, "Qual a cidade?"),
  uf: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v.length === 2, "2 letras (ex: SP, RJ, MG)."),
  // Optional free-text notes (collapsed field in the UI)
  order_notes: z
    .string()
    .trim()
    .max(500, "Observação grande demais.")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
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
      order_notes: data.order_notes,
      // Terms consent is implicit via the pay CTA (see inline footer copy).
      // WhatsApp opt-in default true since we now collect phone anyway.
      wants_whatsapp_updates: true,
      wants_marketing_email: false,
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
      amountCents: totalCents,
      externalRef: order.id,
      postbackUrl: `${SITE_URL}/api/webhooks/pagnet`,
      metadata: JSON.stringify({ orderId: order.id, shortCode }),
      items: resolved.map((line) => ({
        title: `${line.product.name} (${line.variant.size})`,
        unitPriceCents: line.product.priceCents,
        quantity: line.qty,
        tangible: false,
        externalRef: line.product.slug,
      })),
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
      },
      shipping: {
        feeCents: shippingCents,
        address: {
          street: data.logradouro,
          streetNumber: data.numero,
          complement: data.complemento,
          neighborhood: data.bairro,
          city: data.cidade,
          state: data.uf,
          zipCode: data.cep,
          country: "BR",
        },
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
      pix_expires_at: new Date(Date.now() + PIX_TTL_MS).toISOString(),
    })
    .eq("id", order.id);

  await clearCart();
  redirect(`/pedido/${order.id}`);
  return EMPTY_STATE;
}
