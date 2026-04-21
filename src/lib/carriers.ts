/**
 * Resolves carrier tracking URLs + labels. Keeps the mapping in one place so
 * it's trivial to add carriers later (Kangu, Azul Cargo, Loggi, etc) without
 * touching UI.
 */
export type CarrierId =
  | "correios"
  | "jadlog"
  | "azul"
  | "total"
  | "outro";

export const CARRIERS: Record<
  CarrierId,
  { label: string; trackUrl: (code: string) => string | null }
> = {
  correios: {
    label: "Correios",
    trackUrl: (code) =>
      `https://www.linkcorreios.com.br/?id=${encodeURIComponent(code)}`,
  },
  jadlog: {
    label: "Jadlog",
    trackUrl: (code) =>
      `https://www.jadlog.com.br/tracking?cte=${encodeURIComponent(code)}`,
  },
  azul: {
    label: "Azul Cargo",
    trackUrl: (code) =>
      `https://www.azulcargoexpress.com.br/Rastreio/Rastreio?numero=${encodeURIComponent(code)}`,
  },
  total: {
    label: "Total Express",
    trackUrl: (code) =>
      `https://tracking.totalexpress.com.br/poupup_track.php?reid=${encodeURIComponent(code)}`,
  },
  outro: {
    label: "Outro",
    trackUrl: () => null,
  },
};

export function carrierLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return CARRIERS[id as CarrierId]?.label ?? null;
}

export function carrierTrackUrl(
  id: string | null | undefined,
  code: string | null | undefined,
): string | null {
  if (!id || !code) return null;
  return CARRIERS[id as CarrierId]?.trackUrl(code) ?? null;
}
