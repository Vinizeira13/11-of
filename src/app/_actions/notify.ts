"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  productId: z.string().uuid("produto inválido"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("e-mail inválido")
    .max(254),
});

export type NotifyWaitlistResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; error: string };

export async function joinWaitlistAction(
  productId: string,
  email: string,
): Promise<NotifyWaitlistResult> {
  const parsed = schema.safeParse({ productId, email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("notify_waitlist").insert({
    product_id: parsed.data.productId,
    email: parsed.data.email,
  });

  if (error) {
    // unique violation = already on list, still a success from the user's pov
    if (error.code === "23505") {
      return { ok: true, duplicate: true };
    }
    return { ok: false, error: "Falha ao entrar na lista. Tente em instantes." };
  }

  return { ok: true };
}
