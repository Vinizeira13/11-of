"use server";

import { revalidatePath } from "next/cache";
import {
  CART_MAX_ITEMS,
  CART_MAX_QTY_PER_LINE,
  cartLineKey,
  readCart,
  writeCart,
  type CartLine,
} from "@/lib/cart";
import { findVariant } from "@/lib/catalog";
import { sanitizePersonalization } from "@/lib/personalization";

export type CartActionResult =
  | { ok: true; lines: CartLine[] }
  | { ok: false; error: string };

export async function addToCartAction(
  variantId: string,
  qty: number = 1,
  personalizationRaw?: string,
): Promise<CartActionResult> {
  if (!variantId || !Number.isFinite(qty) || qty <= 0) {
    return { ok: false, error: "Quantidade inválida." };
  }

  const match = await findVariant(variantId);
  if (!match) return { ok: false, error: "Produto indisponível." };
  if (match.variant.stockQty <= 0) {
    return { ok: false, error: "Tamanho esgotado." };
  }

  const personalization = sanitizePersonalization(personalizationRaw);
  const incoming: CartLine = personalization
    ? { variantId, qty, personalization }
    : { variantId, qty };
  const key = cartLineKey(incoming);

  const current = await readCart();
  const idx = current.findIndex((l) => cartLineKey(l) === key);
  const existingQty = idx >= 0 ? current[idx].qty : 0;
  const nextQty = Math.min(
    existingQty + qty,
    match.variant.stockQty,
    CART_MAX_QTY_PER_LINE,
  );

  if (nextQty === existingQty) {
    return { ok: false, error: "Estoque insuficiente." };
  }

  const updated: CartLine[] =
    idx >= 0
      ? current.map((l, i) => (i === idx ? { ...l, qty: nextQty } : l))
      : [...current, { ...incoming, qty: nextQty }];

  if (updated.length > CART_MAX_ITEMS) {
    return { ok: false, error: `Máximo de ${CART_MAX_ITEMS} itens por pedido.` };
  }

  await writeCart(updated);
  revalidatePath("/", "layout");
  return { ok: true, lines: updated };
}

export async function updateCartQtyAction(
  variantId: string,
  personalizationRaw: string | null,
  qty: number,
): Promise<CartActionResult> {
  if (!variantId || !Number.isFinite(qty) || qty < 0) {
    return { ok: false, error: "Quantidade inválida." };
  }

  const personalization =
    personalizationRaw === null
      ? undefined
      : sanitizePersonalization(personalizationRaw);
  const key = cartLineKey({ variantId, personalization });

  const current = await readCart();
  if (qty === 0) {
    const filtered = current.filter((l) => cartLineKey(l) !== key);
    await writeCart(filtered);
    revalidatePath("/", "layout");
    return { ok: true, lines: filtered };
  }

  const match = await findVariant(variantId);
  if (!match) return { ok: false, error: "Produto indisponível." };
  const clamped = Math.min(qty, match.variant.stockQty, CART_MAX_QTY_PER_LINE);

  const updated = current.map((l) =>
    cartLineKey(l) === key ? { ...l, qty: clamped } : l,
  );
  await writeCart(updated);
  revalidatePath("/", "layout");
  return { ok: true, lines: updated };
}

export async function removeFromCartAction(
  variantId: string,
  personalizationRaw: string | null,
): Promise<CartActionResult> {
  const personalization =
    personalizationRaw === null
      ? undefined
      : sanitizePersonalization(personalizationRaw);
  const key = cartLineKey({ variantId, personalization });
  const current = await readCart();
  const updated = current.filter((l) => cartLineKey(l) !== key);
  await writeCart(updated);
  revalidatePath("/", "layout");
  return { ok: true, lines: updated };
}
