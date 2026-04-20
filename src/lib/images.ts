/**
 * Tiny dark-gray PNG (4×5 px) base64 — used as a constant blur placeholder
 * across all product/editorial <Image> components. Next Image enlarges + blurs
 * it while the real image loads, eliminating the black-frame flash. One
 * constant avoids per-image pre-compute entirely.
 */
export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAIAAADtz9qMAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEElEQVR4nGOQkpaHIwYyOADVJQaR7IKTWQAAAABJRU5ErkJggg==";

/**
 * Classify a product's images into 4 buckets based on Nike press-kit naming
 * conventions, then expose two APIs:
 *  - {@link classifyImages}: granular (packshot / detail / hero / editorial)
 *  - {@link splitImages}:    legacy binary (product / editorial) — kept for
 *    compatibility with existing consumers.
 *
 * Categories:
 *  - **packshot**: clean studio shot of the kit (`-home-N`, `-away-N`,
 *    `-third-N`, `-keeper-N`). Primary card image.
 *  - **detail**:   close-up of crest, fabric, detail (`-detail-N`, `-crest-N`,
 *    `-pack-N`). Belongs to PDP gallery but never card front.
 *  - **hero**:     brand/team wide shot with the kit but no named player
 *    (`{n}_nike-football-...-{team}(-N)?.webp` or Jordan brand hero). Good as
 *    card front fallback and first editorial tile.
 *  - **editorial**: player-on-pitch lifestyle shot (filename contains player
 *    name tokens). Powers the "Visto em campo" section.
 */

export type ClassifiedImages = {
  packshot: string[];
  detail: string[];
  hero: string[];
  editorial: string[];
};

export type SplitImages = {
  /**
   * Product-type images in display priority: packshot → hero → detail.
   * Kept for backward compatibility with existing consumers.
   */
  product: string[];
  /** Player editorial shots only. */
  editorial: string[];
};

const PACKSHOT_MARKERS = [
  /-home-\d+\b/i,
  /-away-\d+\b/i,
  /-third-\d+\b/i,
  /-keeper-\d+\b/i,
];

const DETAIL_MARKERS = [
  /-detail-\d+\b/i,
  /-crest-\d+\b/i,
  /-pack-\d+\b/i,
];

const HERO_MARKERS = [
  // e.g. nike-football-2026-federation-kits-brasil.webp
  //      nike-football-2026-federation-kits-canada-1.webp
  /nike-football-2026-federation-kits-[a-z]+(?:-\d+)?\.(?:jpe?g|webp)$/i,
  // e.g. jordan-brand-x-brasil-away-kit.webp
  //      jordan-brand-x-brasil-away-kit-1.webp
  /jordan-brand-x-brasil-away-kit(?:-\d+)?\.(?:jpe?g|webp)$/i,
];

function matchesAny(url: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(url));
}

export function classifyImages(images: string[]): ClassifiedImages {
  const packshot: string[] = [];
  const detail: string[] = [];
  const hero: string[] = [];
  const editorial: string[] = [];

  for (const url of images) {
    if (matchesAny(url, PACKSHOT_MARKERS)) packshot.push(url);
    else if (matchesAny(url, DETAIL_MARKERS)) detail.push(url);
    else if (matchesAny(url, HERO_MARKERS)) hero.push(url);
    else editorial.push(url);
  }

  return { packshot, detail, hero, editorial };
}

export function splitImages(images: string[]): SplitImages {
  const c = classifyImages(images);
  // Non-editorial in priority order: packshot → hero → detail.
  const product = [...c.packshot, ...c.hero, ...c.detail];

  // Safety net: if nothing is classified as product, make the first image
  // the product so downstream consumers never get an empty array.
  if (product.length === 0 && images.length > 0) {
    product.push(images[0]);
  }

  return { product, editorial: c.editorial };
}

/**
 * Best single image to represent the product in a grid/card.
 * Priority: clean packshot → brand hero → editorial → detail → fallback.
 */
export function pickHeroImage(images: string[]): string | undefined {
  const c = classifyImages(images);
  return (
    c.packshot[0] ??
    c.hero[0] ??
    c.editorial[0] ??
    c.detail[0] ??
    images[0]
  );
}

/**
 * Image to swap to on card hover. Tries: 2nd packshot → editorial → hero →
 * detail → 1st packshot.
 */
export function pickBackImage(images: string[]): string | undefined {
  const c = classifyImages(images);
  return (
    c.packshot[1] ??
    c.editorial[0] ??
    c.hero[0] ??
    c.detail[0] ??
    c.packshot[0] ??
    images[1] ??
    images[0]
  );
}

/**
 * PDP gallery order: packshot → detail → hero → editorial.
 * Details come right after packshots so crest/fabric close-ups sit next to
 * the main product shots; hero and editorial follow.
 */
export function galleryOrder(images: string[]): string[] {
  const c = classifyImages(images);
  return [...c.packshot, ...c.detail, ...c.hero, ...c.editorial];
}
