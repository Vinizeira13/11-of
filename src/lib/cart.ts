import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sanitizePersonalization } from "@/lib/personalization";

// Re-export the pure key helper so callers can keep importing it from
// "@/lib/cart" if they're server-side; client components must import it
// directly from "@/lib/personalization".
export { cartLineKey } from "@/lib/personalization";

export const CART_COOKIE = "cart";
export const CART_MAX_ITEMS = 20;
export const CART_MAX_QTY_PER_LINE = 10;
const COOKIE_MAX_BYTES = 3500;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export type CartLine = {
  /** variant id (short key `v` on the wire) */
  variantId: string;
  /** quantity (short key `q` on the wire) */
  qty: number;
  /** optional name+number printed on the jersey back (`p` on the wire) */
  personalization?: string;
};

type WireItem = { v: string; q: number; p?: string };
type WirePayload = { items: WireItem[] };

function secret(): string {
  const env = process.env.CART_SECRET;
  if (env && env.length >= 32) return env;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CART_SECRET must be set (>= 32 chars) in production.",
    );
  }
  return "dev-insecure-cart-secret-do-not-use-in-production";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expected = sign(payload);
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

function encode(lines: CartLine[]): string {
  const wire: WirePayload = {
    items: lines.map((l) => {
      const item: WireItem = { v: l.variantId, q: l.qty };
      if (l.personalization) item.p = l.personalization;
      return item;
    }),
  };
  const body = Buffer.from(JSON.stringify(wire)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  const dot = raw.indexOf(".");
  if (dot <= 0) return [];
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!verify(body, sig)) return [];
  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as WirePayload;
    if (!parsed || !Array.isArray(parsed.items)) return [];
    return parsed.items
      .filter(
        (i): i is WireItem =>
          typeof i?.v === "string" &&
          typeof i?.q === "number" &&
          i.q > 0 &&
          i.q <= CART_MAX_QTY_PER_LINE,
      )
      .map<CartLine>((i) => {
        const line: CartLine = { variantId: i.v, qty: i.q };
        const p = sanitizePersonalization(i.p);
        if (p) line.personalization = p;
        return line;
      })
      .slice(0, CART_MAX_ITEMS);
  } catch {
    return [];
  }
}

export async function readCart(): Promise<CartLine[]> {
  const store = await cookies();
  return decode(store.get(CART_COOKIE)?.value);
}

export async function writeCart(lines: CartLine[]): Promise<void> {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(CART_COOKIE);
    return;
  }
  const encoded = encode(lines);
  if (encoded.length > COOKIE_MAX_BYTES) {
    throw new Error("Carrinho muito grande. Finalize o pedido atual.");
  }
  store.set(CART_COOKIE, encoded, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearCart(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}
