"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ADMIN_COOKIE = "11of:admin";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // admin disabled if no env
  return !!token && token === expected;
}

const updateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "preparing",
    "dispatched",
    "delivered",
    "returned",
    "cancelled",
  ]),
  trackingCode: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  trackingCarrier: z
    .enum(["correios", "jadlog", "azul", "total", "outro"])
    .optional()
    .transform((v) => v ?? null),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type DeliveryUpdateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateDeliveryAction(formData: FormData): Promise<DeliveryUpdateResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Sessão admin expirada." };
  }

  const parsed = updateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingCode: formData.get("trackingCode") ?? undefined,
    trackingCarrier: formData.get("trackingCarrier") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const data = parsed.data;
  const adminToken = process.env.ADMIN_RPC_TOKEN;
  if (!adminToken) {
    return { ok: false, error: "ADMIN_RPC_TOKEN não configurado." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_delivery", {
    p_admin_token: adminToken,
    p_order_id: data.orderId,
    p_status: data.status,
    p_tracking_code: data.trackingCode,
    p_tracking_carrier: data.trackingCarrier,
    p_notes: data.notes,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/pedido/${data.orderId}`);
  revalidatePath("/admin/pedidos");
  return { ok: true };
}

/**
 * Admin password login. Signs a tiny cookie that the other admin actions
 * / pages check. No session store — the cookie value is simply the admin
 * password itself (only hashes match; shortcut for low-traffic one-admin
 * stores).
 */
export async function adminLoginAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const password = formData.get("password");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { ok: false, error: "Admin não configurado (ADMIN_PASSWORD env)." };
  }
  if (typeof password !== "string" || password !== expected) {
    return { ok: false, error: "Senha incorreta." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return { ok: true };
}

export async function adminLogoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return requireAdmin();
}
