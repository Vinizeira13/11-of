// Single source of truth for the "breaking news" surface (bar + popup).
// Flip BREAKING_NEWS_OFF=1 in Vercel env to kill both without a code change
// — useful when the underlying news event becomes stale (lesão, troca de
// convocação, fim da campanha).

export function isBreakingActive(): boolean {
  return process.env.BREAKING_NEWS_OFF !== "1";
}
