// Player-name option offered on the Brasil PDPs. Keyed by product slug so we
// can add other selections later (e.g. France: Mbappé/Dembélé) without
// touching component code.
//
// NOTE: using player names on the jersey may engage personality rights
// (Lei 9.610/98, art. 20 CC). Treated as the user's call — this lib does not
// enforce policy, it just describes the offer surface.

export type PlayerOption = {
  id: string;
  /** Display name (printed on the jersey back) */
  name: string;
  /** Squad number (printed under the name) */
  number: number;
};

export const BRASIL_PLAYERS: readonly PlayerOption[] = [
  { id: "neymar", name: "Neymar", number: 10 },
  { id: "vini-jr", name: "Vini Jr", number: 7 },
  { id: "endrick", name: "Endrick", number: 9 },
  { id: "rayan", name: "Rayan", number: 11 },
] as const;

const SLUG_TO_PLAYERS: Record<string, readonly PlayerOption[]> = {
  "camisa-brasil-home-2026": BRASIL_PLAYERS,
  "camisa-brasil-away-2026": BRASIL_PLAYERS,
};

export function playersForSlug(slug: string): readonly PlayerOption[] | null {
  return SLUG_TO_PLAYERS[slug] ?? null;
}

/** "Neymar 10" — used to stamp the order line so fulfillment knows what to print. */
export function formatPersonalization(player: PlayerOption): string {
  return `${player.name} ${player.number}`;
}

/**
 * Composite identity for cart lines. Same variant + same personalization
 * merge into one row; different personalizations stay as distinct rows.
 *
 * Kept here (not in lib/cart.ts) so client components can import it without
 * pulling the server-only cookie/HMAC machinery.
 */
export function cartLineKey(line: {
  variantId: string;
  personalization?: string;
}): string {
  return `${line.variantId}|${line.personalization ?? ""}`;
}

/**
 * Defensive parse of the on-wire `p` field. Strips ASCII control characters
 * (codepoints below 0x20 and the DEL 0x7F), trims whitespace, caps length.
 * Returns `undefined` when the input is empty (= "sem nome").
 */
export function sanitizePersonalization(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  let cleaned = "";
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x20 && code !== 0x7f) cleaned += ch;
  }
  cleaned = cleaned.trim().slice(0, 24);
  return cleaned.length > 0 ? cleaned : undefined;
}
