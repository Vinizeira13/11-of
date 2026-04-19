export type TeamMeta = {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  confederation: "CONMEBOL" | "UEFA" | "CONCACAF" | "AFC" | "CAF" | "OFC";
  primaryColor: string;
  star: { name: string; number: number; position: string };
  tagline: string;
};

export const TEAMS: TeamMeta[] = [
  {
    slug: "camisa-brasil-home-2026",
    code: "BRA",
    name: "Seleção Brasileira",
    shortName: "Brasil",
    country: "Brasil",
    flag: "🇧🇷",
    confederation: "CONMEBOL",
    primaryColor: "oklch(0.78 0.17 135)",
    star: { name: "Vini Jr", number: 20, position: "PE" },
    tagline: "Pentacampeão em busca do hexa.",
  },
  {
    slug: "camisa-franca-home-2026",
    code: "FRA",
    name: "Équipe de France",
    shortName: "França",
    country: "França",
    flag: "🇫🇷",
    confederation: "UEFA",
    primaryColor: "oklch(0.40 0.18 265)",
    star: { name: "Kylian Mbappé", number: 10, position: "PE" },
    tagline: "Les Bleus em defesa do título.",
  },
  {
    slug: "camisa-inglaterra-home-2026",
    code: "ENG",
    name: "Three Lions",
    shortName: "Inglaterra",
    country: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    confederation: "UEFA",
    primaryColor: "oklch(0.98 0 0)",
    star: { name: "Cole Palmer", number: 10, position: "MEI" },
    tagline: "It's coming home.",
  },
  {
    slug: "camisa-holanda-home-2026",
    code: "NED",
    name: "Oranje",
    shortName: "Holanda",
    country: "Holanda",
    flag: "🇳🇱",
    confederation: "UEFA",
    primaryColor: "oklch(0.70 0.20 55)",
    star: { name: "Virgil van Dijk", number: 4, position: "ZAG" },
    tagline: "Laranja mecânica.",
  },
  {
    slug: "camisa-croacia-home-2026",
    code: "CRO",
    name: "Vatreni",
    shortName: "Croácia",
    country: "Croácia",
    flag: "🇭🇷",
    confederation: "UEFA",
    primaryColor: "oklch(0.65 0.20 25)",
    star: { name: "Luka Modrić", number: 10, position: "MEI" },
    tagline: "Xadrez no peito, fogo nos pés.",
  },
  {
    slug: "camisa-uruguai-home-2026",
    code: "URU",
    name: "La Celeste",
    shortName: "Uruguai",
    country: "Uruguai",
    flag: "🇺🇾",
    confederation: "CONMEBOL",
    primaryColor: "oklch(0.70 0.15 230)",
    star: { name: "Federico Valverde", number: 15, position: "VOL" },
    tagline: "Garra charrúa.",
  },
  {
    slug: "camisa-noruega-home-2026",
    code: "NOR",
    name: "Løvene",
    shortName: "Noruega",
    country: "Noruega",
    flag: "🇳🇴",
    confederation: "UEFA",
    primaryColor: "oklch(0.60 0.22 25)",
    star: { name: "Erling Haaland", number: 9, position: "CA" },
    tagline: "O monstro viking.",
  },
  {
    slug: "camisa-canada-home-2026",
    code: "CAN",
    name: "Les Rouges",
    shortName: "Canadá",
    country: "Canadá",
    flag: "🇨🇦",
    confederation: "CONCACAF",
    primaryColor: "oklch(0.60 0.22 25)",
    star: { name: "Alphonso Davies", number: 19, position: "LE" },
    tagline: "Anfitriões ambiciosos.",
  },
];

export function teamBySlug(slug: string): TeamMeta | undefined {
  return TEAMS.find((t) => t.slug === slug);
}

export function teamByCode(code: string): TeamMeta | undefined {
  return TEAMS.find((t) => t.code.toLowerCase() === code.toLowerCase());
}

export const CONFEDERATIONS = [
  { id: "CONMEBOL", label: "América do Sul" },
  { id: "UEFA", label: "Europa" },
  { id: "CONCACAF", label: "América Norte" },
  { id: "AFC", label: "Ásia" },
  { id: "CAF", label: "África" },
] as const;
