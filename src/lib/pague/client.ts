import "server-only";
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";

export type PagueChargeRequest = {
  amount: number;
  description: string;
  externalId: string;
  customer: {
    name: string;
    document: string;
    email?: string;
    phone?: string;
  };
  expiresInSeconds?: number;
};

export type PagueCharge = {
  id: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  pixCopyPaste: string;
  pixQrCodeBase64: string;
  expiresAt: string;
};

export type PagueWebhookEvent = {
  id: string;
  type: "charge.paid" | "charge.expired" | "charge.cancelled";
  chargeId: string;
  externalId: string;
  paidAt?: string;
};

const API_BASE = process.env.PAGUE_API_BASE ?? "https://api.pague.dev";
const API_KEY = process.env.PAGUE_API_KEY ?? "";
const PIX_TTL_SECONDS = 1800;

function webhookSecret(): string {
  const s = process.env.PAGUE_WEBHOOK_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "PAGUE_WEBHOOK_SECRET must be set with 16+ chars in production.",
    );
  }
  return "dev-insecure-pague-secret-not-for-production";
}

export function isPagueConfigured(): boolean {
  return API_KEY.length > 0;
}

export async function createPixCharge(
  req: PagueChargeRequest,
): Promise<PagueCharge> {
  if (isPagueConfigured()) return createRealCharge(req);
  return createMockCharge(req);
}

async function createRealCharge(req: PagueChargeRequest): Promise<PagueCharge> {
  const res = await fetch(`${API_BASE}/v1/pix`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: req.amount / 100,
      description: req.description,
      externalReference: req.externalId,
      customer: {
        name: req.customer.name,
        document: req.customer.document,
        email: req.customer.email,
        phone: req.customer.phone,
      },
      expiresIn: req.expiresInSeconds ?? PIX_TTL_SECONDS,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`pague.dev ${res.status}: ${body}`);
  }

  const j = await res.json();
  return {
    id: j.id,
    status: j.status,
    pixCopyPaste: j.pixCopyPaste ?? j.pix?.copy_paste,
    pixQrCodeBase64: j.qrCodeBase64 ?? j.pix?.qr_code_base64 ?? "",
    expiresAt: j.expiresAt,
  };
}

function createMockCharge(req: PagueChargeRequest): PagueCharge {
  const ttl = req.expiresInSeconds ?? PIX_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const amount = (req.amount / 100).toFixed(2);
  const copyPaste =
    `00020126580014br.gov.bcb.pix0136${randomUUID()}` +
    `5204000053039865406${amount}5802BR5913Onze Oficial6009SAO PAULO` +
    `62070503***6304${checksum(req.externalId)}`;

  return {
    id: `mock_${randomUUID()}`,
    status: "pending",
    pixCopyPaste: copyPaste,
    pixQrCodeBase64: "",
    expiresAt,
  };
}

function checksum(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % 10000;
  return String(h).padStart(4, "0");
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", webhookSecret())
    .update(rawBody)
    .digest("hex");
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function parseWebhookEvent(payload: unknown): PagueWebhookEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : null;
  const type = typeof o.type === "string" ? o.type : null;
  const chargeId =
    typeof o.charge_id === "string"
      ? o.charge_id
      : typeof o.chargeId === "string"
        ? o.chargeId
        : null;
  const externalId =
    typeof o.external_id === "string"
      ? o.external_id
      : typeof o.externalReference === "string"
        ? o.externalReference
        : null;
  const paidAt =
    typeof o.paid_at === "string"
      ? o.paid_at
      : typeof o.paidAt === "string"
        ? o.paidAt
        : undefined;

  if (!id || !type || !chargeId || !externalId) return null;
  if (
    type !== "charge.paid" &&
    type !== "charge.expired" &&
    type !== "charge.cancelled"
  )
    return null;
  return { id, type, chargeId, externalId, paidAt };
}
