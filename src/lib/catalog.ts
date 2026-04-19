import { cache } from "react";
import { createClient } from "./supabase/server";

export type VariantSize = "P" | "M" | "G" | "GG" | "XGG";

export type Variant = {
  id: string;
  size: VariantSize;
  stockQty: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  images: string[];
  variants: Variant[];
};

const SIZE_ORDER: VariantSize[] = ["P", "M", "G", "GG", "XGG"];

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price_cents: number;
  compare_at_cents: number | null;
  images: string[] | null;
  product_variants:
    | Array<{ id: string; size: string; stock_qty: number }>
    | null;
};

function rowToProduct(row: ProductRow): Product {
  const variants: Variant[] = (row.product_variants ?? [])
    .map((v) => ({
      id: v.id,
      size: v.size as VariantSize,
      stockQty: v.stock_qty,
    }))
    .sort(
      (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size),
    );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    category: row.category,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents,
    images: row.images ?? [],
    variants,
  };
}

const productSelect = `
  id, slug, name, description, category,
  price_cents, compare_at_cents, images,
  product_variants(id, size, stock_qty)
`;

export const getPublishedProducts = cache(
  async (category?: string): Promise<Product[]> => {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(productSelect)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (category) query = query.eq("category", category);
    const { data } = await query;
    return ((data ?? []) as ProductRow[]).map(rowToProduct);
  },
);

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(productSelect)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) return null;
    return rowToProduct(data as ProductRow);
  },
);

export type ResolvedLine = {
  variantId: string;
  qty: number;
  product: Product;
  variant: Variant;
  lineTotalCents: number;
};

export async function findVariant(
  variantId: string,
): Promise<{ product: Product; variant: Variant } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select(
      `id, size, stock_qty,
       product:product_id(${productSelect})`,
    )
    .eq("id", variantId)
    .maybeSingle<{
      id: string;
      size: string;
      stock_qty: number;
      product: ProductRow | null;
    }>();

  if (!data || !data.product) return null;
  const product = rowToProduct(data.product);
  const variant = product.variants.find((v) => v.id === data.id);
  if (!variant) return null;
  return { product, variant };
}

export async function resolveCartLines(
  lines: Array<{ variantId: string; qty: number }>,
): Promise<{
  resolved: ResolvedLine[];
  invalidIds: string[];
  subtotalCents: number;
}> {
  const resolved: ResolvedLine[] = [];
  const invalidIds: string[] = [];
  let subtotalCents = 0;

  for (const line of lines) {
    const match = await findVariant(line.variantId);
    if (!match) {
      invalidIds.push(line.variantId);
      continue;
    }
    const qty = Math.min(line.qty, match.variant.stockQty);
    if (qty <= 0) {
      invalidIds.push(line.variantId);
      continue;
    }
    const lineTotalCents = match.product.priceCents * qty;
    subtotalCents += lineTotalCents;
    resolved.push({
      variantId: line.variantId,
      qty,
      product: match.product,
      variant: match.variant,
      lineTotalCents,
    });
  }

  return { resolved, invalidIds, subtotalCents };
}
