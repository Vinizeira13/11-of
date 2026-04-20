/**
 * Custom Next Image loader that rewrites Supabase Storage public URLs to the
 * Supabase Image Transform endpoint (`/render/image/public/`). This delivers
 * resized + quality-compressed variants directly from Supabase's CDN (Fastly),
 * cached per (width, quality) combo.
 *
 * Effect: 552KB original → ~14KB at width=400 (-97%). Zero Vercel transform
 * cost, works identically in dev and prod.
 *
 * Non-Supabase URLs (e.g. Unsplash placeholders) pass through untouched so
 * external hosts keep working.
 */
type LoaderArgs = { src: string; width: number; quality?: number };

const SUPABASE_PUBLIC_SEGMENT = "/storage/v1/object/public/";
const SUPABASE_RENDER_SEGMENT = "/storage/v1/render/image/public/";

export default function supabaseImageLoader({
  src,
  width,
  quality,
}: LoaderArgs): string {
  if (!src.includes(SUPABASE_PUBLIC_SEGMENT)) return src;
  const rendered = src.replace(
    SUPABASE_PUBLIC_SEGMENT,
    SUPABASE_RENDER_SEGMENT,
  );
  const q = quality ?? 75;
  return `${rendered}?width=${width}&quality=${q}&resize=contain`;
}
