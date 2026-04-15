export type Announcement = {
  emoji: string;
  message: string;
  link?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  { emoji: "⚡", message: "Pague com PIX e ganhe 10% OFF" },
  { emoji: "🚚", message: "Frete grátis acima de R$ 299" },
  { emoji: "📦", message: "Despacho em 24h úteis" },
  { emoji: "🔄", message: "Trocas gratuitas em até 7 dias" },
];
