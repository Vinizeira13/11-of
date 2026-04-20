export type TeamMeta = {
  /** Country identifier used to derive product slugs (home/away). */
  slugBase: string;
  /** Primary product slug (home kit). Kept for backward compatibility. */
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
  /** Canonical thumbnail URL for cards/menus (home kit product shot). */
  thumbUrl: string;
};

const BUCKET =
  "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike";

export const TEAMS: TeamMeta[] = [
  {
    slugBase: "brasil",
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
    thumbUrl: `${BUCKET}/bra/002_nike-football-2026-federation-kits-brasil-home-1.webp`,
  },
  {
    slugBase: "franca",
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
    thumbUrl: `${BUCKET}/fra/002_nike-football-2026-federation-kits-france-home-1.webp`,
  },
  {
    slugBase: "inglaterra",
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
    thumbUrl: `${BUCKET}/eng/002_nike-football-2026-federation-kits-england-home-1.webp`,
  },
  {
    slugBase: "holanda",
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
    thumbUrl: `${BUCKET}/ned/002_nike-football-2026-federation-kits-netherlands-home-1.webp`,
  },
  {
    slugBase: "croacia",
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
    thumbUrl: `${BUCKET}/cro/002_nike-football-2026-federation-kits-croatia-home-1.webp`,
  },
  {
    slugBase: "uruguai",
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
    thumbUrl: `${BUCKET}/uru/002_nike-football-2026-federation-kits-uruguay-home-1.webp`,
  },
  {
    slugBase: "noruega",
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
    thumbUrl: `${BUCKET}/nor/002_nike-football-2026-federation-kits-norway-home-1.webp`,
  },
  {
    slugBase: "canada",
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
    thumbUrl: `${BUCKET}/can/002_nike-football-2026-federation-kits-canada-home-1.webp`,
  },
  {
    slugBase: "turquia",
    slug: "camisa-turquia-home-2026",
    code: "TUR",
    name: "Ay-Yıldızlılar",
    shortName: "Turquia",
    country: "Turquia",
    flag: "🇹🇷",
    confederation: "UEFA",
    primaryColor: "oklch(0.58 0.23 25)",
    star: { name: "Hakan Çalhanoğlu", number: 10, position: "MEI" },
    tagline: "Estrela e crescente no peito.",
    thumbUrl: `${BUCKET}/tur/002_nike-football-2026-federation-kits-turkiye-home-1.webp`,
  },
  {
    slugBase: "polonia",
    slug: "camisa-polonia-home-2026",
    code: "POL",
    name: "Biało-Czerwoni",
    shortName: "Polônia",
    country: "Polônia",
    flag: "🇵🇱",
    confederation: "UEFA",
    primaryColor: "oklch(0.98 0 0)",
    star: { name: "Robert Lewandowski", number: 9, position: "CA" },
    tagline: "Águia branca, sangue vermelho.",
    thumbUrl: `${BUCKET}/pol/002_nike-football-2026-federation-kits-poland-home-1.webp`,
  },
  {
    slugBase: "nigeria",
    slug: "camisa-nigeria-home-2026",
    code: "NGR",
    name: "Super Eagles",
    shortName: "Nigéria",
    country: "Nigéria",
    flag: "🇳🇬",
    confederation: "CAF",
    primaryColor: "oklch(0.62 0.18 150)",
    star: { name: "Victor Osimhen", number: 9, position: "CA" },
    tagline: "Super Águias sobrevoam o continente.",
    thumbUrl: `${BUCKET}/ngr/001_nike-football-2026-federation-kits-nigeria-home-1.webp`,
  },
  {
    slugBase: "china",
    slug: "camisa-china-home-2026",
    code: "CHN",
    name: "Guózú",
    shortName: "China",
    country: "China",
    flag: "🇨🇳",
    confederation: "AFC",
    primaryColor: "oklch(0.55 0.24 25)",
    star: { name: "Wu Lei", number: 7, position: "PE" },
    tagline: "Dragões vermelhos a postos.",
    thumbUrl: `${BUCKET}/chn/001_nike-football-2026-federation-kits-china-home-1.webp`,
  },
  {
    slugBase: "eslovenia",
    slug: "camisa-eslovenia-home-2026",
    code: "SVN",
    name: "Zmajčki",
    shortName: "Eslovênia",
    country: "Eslovênia",
    flag: "🇸🇮",
    confederation: "UEFA",
    primaryColor: "oklch(0.98 0 0)",
    star: { name: "Benjamin Šeško", number: 11, position: "CA" },
    tagline: "Triglav no peito, fome no ataque.",
    thumbUrl: `${BUCKET}/svn/001_nike-football-2026-federation-kits-slovenia-home-1.webp`,
  },
  {
    slugBase: "australia",
    slug: "camisa-australia-home-2026",
    code: "AUS",
    name: "Socceroos",
    shortName: "Austrália",
    country: "Austrália",
    flag: "🇦🇺",
    confederation: "AFC",
    primaryColor: "oklch(0.82 0.18 95)",
    star: { name: "Ajdin Hrustic", number: 22, position: "MEI" },
    tagline: "Canguru no ataque.",
    thumbUrl: `${BUCKET}/aus/002_nike-football-2026-federation-kits-australia-home-1.webp`,
  },
  {
    slugBase: "coreia",
    slug: "camisa-coreia-home-2026",
    code: "KOR",
    name: "Taeguk Warriors",
    shortName: "Coreia do Sul",
    country: "Coreia do Sul",
    flag: "🇰🇷",
    confederation: "AFC",
    primaryColor: "oklch(0.58 0.22 25)",
    star: { name: "Son Heung-min", number: 7, position: "PE" },
    tagline: "Guerreiros do Taegeuk.",
    thumbUrl: `${BUCKET}/kor/002_nike-football-2026-federation-kits-korea-home-1.webp`,
  },
  {
    slugBase: "usa",
    slug: "camisa-usa-home-2026",
    code: "USA",
    name: "USMNT",
    shortName: "USA",
    country: "Estados Unidos",
    flag: "🇺🇸",
    confederation: "CONCACAF",
    primaryColor: "oklch(0.42 0.15 265)",
    star: { name: "Christian Pulisic", number: 10, position: "PE" },
    tagline: "Anfitriões, com pressa.",
    thumbUrl: `${BUCKET}/usa/002_nike-football-2026-federation-kits-usa-home-1.webp`,
  },
];

export function teamBySlug(slug: string): TeamMeta | undefined {
  const exact = TEAMS.find((t) => t.slug === slug);
  if (exact) return exact;
  const match = slug.match(/^camisa-(.+?)-(?:home|away)-\d+$/);
  if (!match) return undefined;
  return TEAMS.find((t) => t.slugBase === match[1]);
}

export function teamByCode(code: string): TeamMeta | undefined {
  return TEAMS.find((t) => t.code.toLowerCase() === code.toLowerCase());
}

export function homeSlug(team: TeamMeta): string {
  return `camisa-${team.slugBase}-home-2026`;
}

export function awaySlug(team: TeamMeta): string {
  return `camisa-${team.slugBase}-away-2026`;
}

export function kitFromSlug(slug: string): "home" | "away" | null {
  const m = slug.match(/^camisa-.+?-(home|away)-\d+$/);
  return (m?.[1] as "home" | "away") ?? null;
}

export const CONFEDERATIONS = [
  { id: "CONMEBOL", label: "América do Sul" },
  { id: "UEFA", label: "Europa" },
  { id: "CONCACAF", label: "América Norte" },
  { id: "AFC", label: "Ásia" },
  { id: "CAF", label: "África" },
] as const;
