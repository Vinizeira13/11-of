export type Announcement = {
  emoji: string;
  message: string;
  link?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  { emoji: "⚡", message: "Pague no PIX e ganhe 15% OFF no total" },
  { emoji: "🏆", message: "Camisas oficiais — Copa do Mundo 2026" },
  { emoji: "🚚", message: "Frete grátis acima de R$ 299 — Brasil inteiro" },
  { emoji: "📦", message: "Despacho em 24h úteis · Correios e Jadlog" },
  { emoji: "🔒", message: "Compra segura · Troca grátis em 7 dias" },
];
