/**
 * Split a product's image array into "product shots" (packshot) and "editorial"
 * (lifestyle / players) based on filename conventions we use in Supabase storage.
 *
 * Product shots: contain `-home-1`, `-home-2`, `-away-1`, etc. or are the first
 * two images.
 * Editorial: contain a player/person slug or any other naming ("vini-jr",
 * "mbappe", "haaland", etc.).
 */
export type SplitImages = {
  product: string[];
  editorial: string[];
};

const PRODUCT_MARKERS = [
  /-home-\d+\b/i,
  /-away-\d+\b/i,
  /-third-\d+\b/i,
  /-keeper-\d+\b/i,
];

export function splitImages(images: string[]): SplitImages {
  const product: string[] = [];
  const editorial: string[] = [];

  for (const url of images) {
    const isProductShot = PRODUCT_MARKERS.some((re) => re.test(url));
    if (isProductShot) {
      product.push(url);
    } else {
      editorial.push(url);
    }
  }

  // Fallback: make sure there is always at least one product shot
  if (product.length === 0 && images.length > 0) {
    product.push(images[0]);
  }

  return { product, editorial };
}

/**
 * Pick the best hero/editorial lifestyle image for a product.
 * Preference: editorial (player shot) > product shot.
 */
export function pickHeroImage(images: string[]): string | undefined {
  const { product, editorial } = splitImages(images);
  return editorial[0] ?? product[0] ?? images[0];
}

/**
 * Pick the back / secondary image for card hover swaps.
 * Preference: 2nd product shot > editorial[0] > anything else.
 */
export function pickBackImage(images: string[]): string | undefined {
  const { product, editorial } = splitImages(images);
  return product[1] ?? editorial[0] ?? product[0] ?? images[1] ?? images[0];
}
