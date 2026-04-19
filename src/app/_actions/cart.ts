"use server";

import { revalidatePath } from "next/cache";
import {
  CART_MAX_ITEMS,
  CART_MAX_QTY_PER_LINE,
  readCart,
  writeCart,
  type CartLine,
} from "@/lib/cart";
import { findVariant } from "@/lib/catalog";

export type CartActionResult =
  | { ok: true; lines: CartLine[] }
  | { ok: false; error: string };

export async function addToCartAction(
  variantId: string,
  qty: number = 1,
): Promise<CartActionResult> {
  if (!variantId || !Number.isFinite(qty) || qty <= 0) {
    return { ok: false, error: "Quantidade inválida." };
  }

  const match = await findVariant(variantId);
  if (!match) return { ok: false, error: "Produto indisponível." };
  if (match.variant.stockQty <= 0) {
    return { ok: false, error: "Tamanho esgotado." };
  }

  const current = await readCart();
  const idx = current.findIndex((l) => l.variantId === variantId);
  const existingQty = idx >= 0 ? current[idx].qty : 0;
  const nextQty = Math.min(
    existingQty + qty,
    match.variant.stockQty,
    CART_MAX_QTY_PER_LINE,
  );

  if (nextQty === existingQty) {
    return { ok: false, error: "Estoque insuficiente." };
  }

  const updated: CartLine[] = idx >= 0
    ? current.map((l, i) => (i === idx ? { ...l, qty: nextQty } : l))
    : [...current, { variantId, qty: nextQty }];

  if (updated.length > CART_MAX_ITEMS) {
    return { ok: false, error: `Máximo de ${CART_MAX_ITEMS} itens por pedido.` };
  }

  await writeCart(updated);
  revalidatePath("/", "layout");
  return { ok: true, lines: updated };
}

export async function updateCartQtyAction(
  variantId: string,
  qty: number,
): Promise<CartActionResult> {
  if (!variantId || !Number.isFinite(qty) || qty < 0) {
    return { ok: false, error: "Quantidade inválida." };
  }

  const current = await readCart();
  if (qty === 0) {
    const filtered = current.filter((l) => l.variantId !== variantId);
    await writeCart(filtered);
    revalidatePath("/", "layout");
    return { ok: true, lines: filtered };
  }

  const match = await findVariant(variantId);
  if (!match) return { ok: false, error: "Produto indisponível." };
  const clamped = Math.min(qty, match.variant.stockQty, CART_MAX_QTY_PER_LINE);

  const updated = current.map((l) =>
    l.variantId === variantId ? { ...l, qty: clamped } : l,
  );
  await writeCart(updated);
  revalidatePath("/", "layout");
  return { ok: true, lines: updated };
}

export async function removeFromCartAction(
  variantId: string,
): Promise<CartActionResult> {
  const current = await readCart();
  const updated = current.filter((l) => l.variantId !== variantId);
  await writeCart(updated);
  revalidatePath("/", "layout");
  return { ok: true, lines: updated };
}
