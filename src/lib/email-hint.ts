/**
 * Tiny email typo-correction helper. Brazilian-market biased:
 * gmail/hotmail/outlook/yahoo/icloud/bol/uol cover ~95% of BR consumer inboxes.
 * No fuzzy distance algorithm — a flat map is faster, smaller, and enough for
 * the common fat-finger mistakes we actually see.
 */
const DOMAIN_FIXES: Record<string, string> = {
  // gmail
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmeil.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmaill.com": "gmail.com",
  // hotmail
  "hotnail.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "homail.com": "hotmail.com",
  "hotmeil.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.cm": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  // outlook
  "outloook.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  // yahoo
  "yaho.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.cm": "yahoo.com",
  // icloud
  "icloud.co": "icloud.com",
  "iclaud.com": "icloud.com",
  "icloud.cm": "icloud.com",
  // BR-specific providers (note: bol.com.br, uol.com.br, terra.com.br)
  "bol.com": "bol.com.br",
  "uol.com": "uol.com.br",
  "terra.com": "terra.com.br",
  "ig.com": "ig.com.br",
};

/**
 * Given a full email, returns a corrected version if the domain matches a
 * known typo. Returns null when the email looks fine.
 */
export function suggestEmailFix(email: string): string | null {
  const m = email.trim().match(/^([^@]+)@([^@\s]+)$/);
  if (!m) return null;
  const [, local, domain] = m;
  const fixed = DOMAIN_FIXES[domain.toLowerCase()];
  return fixed ? `${local}@${fixed}` : null;
}

/**
 * Lightweight email sanity check. Not RFC 5322 perfect; covers the shape the
 * business actually cares about: local@domain.tld with a visible dot after @.
 */
export function isLikelyValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
