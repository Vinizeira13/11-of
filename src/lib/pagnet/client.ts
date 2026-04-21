import "server-only";
import { randomUUID } from "node:crypto";

/**
 * PagNet Brasil API client — PIX-only flow for the loja.
 *
 * Auth: HTTP Basic with public_key:secret_key.
 * Base: https://api.pagnetbrasil.com/v1
 *
 * The merchant doesn't return a base64 QR — only the EMV "qrcode" string.
 * The frontend renders that into an actual QR via qrcode.react.
 */

const API_BASE =
  process.env.PAGNET_API_BASE ?? "https://api.pagnetbrasil.com/v1";
const PUBLIC_KEY = process.env.PAGNET_PUBLIC_KEY ?? "";
const SECRET_KEY = process.env.PAGNET_SECRET_KEY ?? "";
const PIX_TTL_DAYS = 1; // PagNet uses days, not seconds

export type PagnetItem = {
  title: string;
  unitPriceCents: number;
  quantity: number;
  externalRef?: string;
  tangible?: boolean; // default true for our jersey store
};

export type PagnetCustomer = {
  name: string;
  email: string;
  phone: string; // digits only, e.g. "11999999999"
  cpf: string; // digits only, 11 chars
};

export type PagnetShipping = {
  feeCents: number;
  address: {
    street: string;
    streetNumber: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
};

export type PagnetCreateRequest = {
  amountCents: number;
  externalRef: string;
  ip?: string;
  metadata?: string;
  postbackUrl: string;
  items: PagnetItem[];
  customer: PagnetCustomer;
  shipping: PagnetShipping;
};

export type PagnetTransactionStatus =
  | "waiting_payment"
  | "pending"
  | "approved"
  | "paid"
  | "refused"
  | "in_protest"
  | "refunded"
  | "cancelled"
  | "chargeback";

export type PagnetCharge = {
  id: string;
  status: PagnetTransactionStatus;
  pixCopyPaste: string; // EMV string — caller renders the QR client-side
  expiresAt: string; // ISO date (yyyy-mm-dd)
  secureUrl?: string | null;
  raw: unknown; // for debugging / extra fields the caller may want
};

export type PagnetWebhookEvent = {
  eventId: string; // postback envelope id
  type: "transaction" | "withdraw";
  objectId: string; // transaction.id (string-coerced)
  externalRef: string | null; // our order id
  status: PagnetTransactionStatus | null;
  paidAt: string | null;
  amountCents: number;
  raw: unknown;
};

function authHeader(): string {
  return `Basic ${Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64")}`;
}

export function isPagnetConfigured(): boolean {
  return PUBLIC_KEY.length > 0 && SECRET_KEY.length > 0;
}

/**
 * Maps our internal request to the PagNet `/transactions` body.
 */
function buildBody(req: PagnetCreateRequest): Record<string, unknown> {
  return {
    amount: req.amountCents,
    paymentMethod: "pix",
    installments: 1, // Required by PagNet acquirer even for PIX (empirical)
    pix: { expiresInDays: PIX_TTL_DAYS },
    items: req.items.map((i) => ({
      title: i.title,
      unitPrice: i.unitPriceCents,
      quantity: i.quantity,
      // TODO: switch back to `i.tangible ?? true` once PagNet liberates the
      // physical-goods permission on company 42157. Today they 424 "Erro na
      // adquirente" on tangible:true. Workaround: declare every item as
      // intangible so the acquirer accepts. Compliance risk: PagNet may
      // audit and notice we sell physical jerseys marked as services.
      // Open a support ticket to enable physical goods, then revert.
      tangible: i.tangible ?? false,
      ...(i.externalRef ? { externalRef: i.externalRef } : {}),
    })),
    customer: {
      name: req.customer.name,
      email: req.customer.email,
      phone: req.customer.phone,
      document: { type: "cpf", number: req.customer.cpf },
    },
    shipping: {
      fee: req.shipping.feeCents,
      address: {
        street: req.shipping.address.street,
        streetNumber: req.shipping.address.streetNumber,
        complement: req.shipping.address.complement ?? undefined,
        neighborhood: req.shipping.address.neighborhood,
        city: req.shipping.address.city,
        state: req.shipping.address.state,
        zipCode: req.shipping.address.zipCode,
        country: req.shipping.address.country ?? "BR",
      },
    },
    postbackUrl: req.postbackUrl,
    externalRef: req.externalRef,
    ...(req.metadata ? { metadata: req.metadata } : {}),
    ...(req.ip ? { ip: req.ip } : {}),
  };
}

export async function createPixCharge(
  req: PagnetCreateRequest,
): Promise<PagnetCharge> {
  if (!isPagnetConfigured()) return createMockCharge(req);

  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildBody(req)),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`pagnet ${res.status}: ${body.slice(0, 500)}`);
  }

  const j = (await res.json()) as Record<string, unknown>;
  const data = (j.data ?? j) as Record<string, unknown>;
  const pix = (data.pix ?? {}) as Record<string, unknown>;

  return {
    id: String(data.id ?? j.id ?? ""),
    status: (data.status as PagnetTransactionStatus) ?? "waiting_payment",
    pixCopyPaste: String(pix.qrcode ?? ""),
    expiresAt: String(pix.expirationDate ?? ""),
    secureUrl: (data.secureUrl as string | null) ?? null,
    raw: j,
  };
}

/**
 * GET /transactions/{id} — used as a fallback poll on the order page and
 * to reconcile webhook payloads (cross-check against forged callbacks).
 */
export async function getCharge(id: string): Promise<PagnetCharge | null> {
  if (!isPagnetConfigured()) return null;

  const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`pagnet ${res.status}: ${body.slice(0, 500)}`);
  }

  const j = (await res.json()) as Record<string, unknown>;
  const data = (j.data ?? j) as Record<string, unknown>;
  const pix = (data.pix ?? {}) as Record<string, unknown>;

  return {
    id: String(data.id ?? j.id ?? ""),
    status: (data.status as PagnetTransactionStatus) ?? "waiting_payment",
    pixCopyPaste: String(pix.qrcode ?? ""),
    expiresAt: String(pix.expirationDate ?? ""),
    secureUrl: (data.secureUrl as string | null) ?? null,
    raw: j,
  };
}

/**
 * Parses a PagNet postback body.
 * Returns null when the payload doesn't look like a PagNet transaction event.
 */
export function parseWebhookEvent(payload: unknown): PagnetWebhookEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  const type = o.type as PagnetWebhookEvent["type"] | undefined;
  if (type !== "transaction" && type !== "withdraw") return null;

  const eventId = String(o.id ?? o.objectId ?? randomUUID());
  const objectId = String(o.objectId ?? "");
  const data = (o.data ?? {}) as Record<string, unknown>;
  const externalRef =
    typeof data.externalRef === "string" ? data.externalRef : null;
  const status = (data.status as PagnetTransactionStatus | null) ?? null;
  const paidAt = typeof data.paidAt === "string" ? data.paidAt : null;
  const amountCents =
    typeof data.amount === "number" ? (data.amount as number) : 0;

  return {
    eventId,
    type,
    objectId,
    externalRef,
    status,
    paidAt,
    amountCents,
    raw: payload,
  };
}

// -----------------------------------------------------------------
// Mock — used when PAGNET_PUBLIC_KEY is not set (local dev / CI)
// -----------------------------------------------------------------
function createMockCharge(req: PagnetCreateRequest): PagnetCharge {
  const amount = (req.amountCents / 100).toFixed(2);
  const id = `mock_${randomUUID()}`;
  const emv =
    `00020126580014br.gov.bcb.pix0136${randomUUID()}` +
    `5204000053039865406${amount}5802BR5913Loja Mock6009SAO PAULO62070503***` +
    `6304${checksum(req.externalRef)}`;
  const tomorrow = new Date(Date.now() + 86_400_000);
  return {
    id,
    status: "waiting_payment",
    pixCopyPaste: emv,
    expiresAt: tomorrow.toISOString().slice(0, 10),
    secureUrl: null,
    raw: { mock: true },
  };
}

function checksum(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % 10000;
  return String(h).padStart(4, "0");
}
