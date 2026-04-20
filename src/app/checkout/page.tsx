import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshCw, Truck, Zap, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/loja/CheckoutForm";
import { CheckoutSteps } from "@/components/loja/CheckoutSteps";
import { CheckoutSummary } from "@/components/loja/CheckoutSummary";
import {
  CheckoutOrderBump,
  type BumpItem,
} from "@/components/loja/CheckoutOrderBump";
import { CheckoutStickyMobile } from "@/components/loja/CheckoutStickyMobile";
import { BrandMark } from "@/components/loja/BrandMark";
import { splitImages } from "@/lib/images";
import { readCart } from "@/lib/cart";
import { getPublishedProducts, resolveCartLines } from "@/lib/catalog";
import { pixDiscountCents } from "@/lib/pricing";
import {
  shippingFor,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "@/lib/shipping";
import {
  teamBySlug,
  homeSlug as teamHomeSlug,
  awaySlug as teamAwaySlug,
  kitFromSlug,
} from "@/lib/teams";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize sua compra com PIX.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const lines = await readCart();
  if (lines.length === 0) redirect("/produtos");

  const { resolved, subtotalCents } = await resolveCartLines(lines);
  if (resolved.length === 0) redirect("/produtos");

  const shippingCents = shippingFor(subtotalCents);
  const discountCents = pixDiscountCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents - discountCents;
  const totalItems = resolved.reduce((s, l) => s + l.qty, 0);

  const summaryLines = resolved.map((l) => ({
    variantId: l.variantId,
    qty: l.qty,
    productName: l.product.name,
    variantSize: l.variant.size,
    image: l.product.images[0] ?? null,
    lineTotalCents: l.lineTotalCents,
  }));

  // -----------------------------------------------------------------
  // Order bump: suggest sibling kits (Home ↔ Away) and, if below the
  // free-shipping gate, push 1-2 options that would unlock it.
  // -----------------------------------------------------------------
  const allProducts = await getPublishedProducts();
  const cartSlugs = new Set(resolved.map((l) => l.product.slug));

  function pickDefaultVariant(product: (typeof allProducts)[number]) {
    return (
      product.variants.find((v) => v.size === "M" && v.stockQty > 0) ??
      product.variants.find((v) => v.stockQty > 0) ??
      null
    );
  }

  function buildBump(
    product: (typeof allProducts)[number],
    reason: "sibling" | "free-shipping",
    reasonLabel: string,
  ): BumpItem | null {
    const variant = pickDefaultVariant(product);
    if (!variant) return null;
    const { product: packs } = splitImages(product.images);
    const team = teamBySlug(product.slug);
    return {
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      imageUrl: packs[0] ?? product.images[0] ?? "",
      priceCents: product.priceCents,
      size: variant.size,
      reason,
      reasonLabel,
      flag: team?.flag,
    };
  }

  const bumpItems: BumpItem[] = [];
  const seenProductIds = new Set<string>();

  // (A) Sibling kits: Home↔Away of the same team
  for (const line of resolved) {
    const team = teamBySlug(line.product.slug);
    if (!team) continue;
    const currentKit = kitFromSlug(line.product.slug);
    const siblingSlug =
      currentKit === "home"
        ? teamAwaySlug(team)
        : currentKit === "away"
          ? teamHomeSlug(team)
          : null;
    if (!siblingSlug || cartSlugs.has(siblingSlug)) continue;
    const sibling = allProducts.find((p) => p.slug === siblingSlug);
    if (!sibling || seenProductIds.has(sibling.id)) continue;
    const bump = buildBump(
      sibling,
      "sibling",
      currentKit === "home" ? "Leva o away junto" : "Leva o home junto",
    );
    if (bump) {
      bumpItems.push(bump);
      seenProductIds.add(sibling.id);
    }
    if (bumpItems.length >= 2) break;
  }

  // (B) Free-shipping unlock: only if still below the gate and there's room
  if (subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS && bumpItems.length < 2) {
    const gap = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
    const candidates = allProducts
      .filter(
        (p) =>
          !cartSlugs.has(p.slug) &&
          !seenProductIds.has(p.id) &&
          p.priceCents >= gap,
      )
      .sort((a, b) => a.priceCents - b.priceCents); // cheapest first = min add spend
    for (const c of candidates) {
      if (bumpItems.length >= 2) break;
      const bump = buildBump(c, "free-shipping", "Adiciona e frete fica grátis");
      if (bump) {
        bumpItems.push(bump);
        seenProductIds.add(c.id);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link href="/" aria-label="11 Of home">
            <BrandMark size="md" />
          </Link>
          <CheckoutSteps />
          <Link
            href="/produtos"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground transition sm:block"
          >
            ← Continuar comprando
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-8">
        {/* Trust band */}
        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-turf/40 bg-turf/5 px-5 py-3 text-xs font-medium text-foreground/90">
          <span className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-turf" aria-hidden />
            PIX {PIX_DISCOUNT_PCT}% OFF automático
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-turf" aria-hidden />
            Despacho em 24h úteis
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="size-3.5 text-turf" aria-hidden />
            Troca grátis em 7 dias
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <ShieldCheck className="size-3.5 text-turf" aria-hidden />
            Compra 100% segura
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <section className="flex flex-col gap-8">
            {bumpItems.length > 0 && <CheckoutOrderBump items={bumpItems} />}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
                Passo 2 de 3
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Seus dados.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Guest checkout. Você recebe o rastreio e as atualizações por
                email — não precisa criar conta.
              </p>
            </div>
            <CheckoutForm />
          </section>

          <CheckoutSummary
            lines={summaryLines}
            subtotalCents={subtotalCents}
            shippingCents={shippingCents}
            discountCents={discountCents}
            totalCents={totalCents}
          />
        </div>
      </div>

      <CheckoutStickyMobile
        totalCents={totalCents}
        pixSavingsCents={discountCents}
        itemsCount={totalItems}
      />
    </div>
  );
}
