import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Zap, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { AddToCartButton } from "@/components/loja/AddToCartButton";
import { DeliveryEstimate } from "@/components/loja/DeliveryEstimate";
import { ProductGallerySplit } from "@/components/loja/ProductGallerySplit";
import { ProductEditorialStrip } from "@/components/loja/ProductEditorialStrip";
import { ProductFAQ } from "@/components/loja/ProductFAQ";
import { ProductSpecs } from "@/components/loja/ProductSpecs";
import { SocialProof } from "@/components/loja/SocialProof";
import { CrossSell } from "@/components/loja/CrossSell";
import { SizeGuide } from "@/components/loja/SizeGuide";
import { StickyMobileCTA } from "@/components/loja/StickyMobileCTA";
import { WishlistButton } from "@/components/loja/WishlistButton";
import { ColorSwatches } from "@/components/loja/ColorSwatches";
import { ShareButtons } from "@/components/loja/ShareButtons";
import { FitCalculator } from "@/components/loja/FitCalculator";
import { TrustChips } from "@/components/loja/TrustChips";
import { ScrollProgress } from "@/components/loja/ScrollProgress";
import { TrackRecentlyViewed } from "@/components/loja/TrackRecentlyViewed";
import { RecentlyViewed } from "@/components/loja/RecentlyViewed";
import { StockProgress } from "@/components/loja/StockProgress";
import { NotifyMe } from "@/components/loja/NotifyMe";
import { PdpUrgency } from "@/components/loja/PdpUrgency";
import { getProductBySlug, getPublishedProducts } from "@/lib/catalog";
import { teamBySlug } from "@/lib/teams";
import { PIX_DISCOUNT_PCT, SITE_URL } from "@/lib/brand";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export async function generateMetadata(
  props: PageProps<"/produtos/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage(
  props: PageProps<"/produtos/[slug]">,
) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const totalStock = product.variants.reduce((s, v) => s + v.stockQty, 0);
  const isSoldOut = totalStock === 0;

  const team = teamBySlug(product.slug);
  const categoryLabel = team ? team.name : product.category;

  const allProducts = await getPublishedProducts();
  const cross = allProducts.filter((p) => p.id !== product.id);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: "Nike" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produtos/${product.slug}`,
      priceCurrency: "BRL",
      price: (product.priceCents / 100).toFixed(2),
      priceValidUntil: "2026-12-31",
      availability: isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "11 Of" },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Seleções",
        item: `${SITE_URL}/produtos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: team?.shortName ?? product.name,
        item: `${SITE_URL}/produtos/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <ScrollProgress />
      <TrackRecentlyViewed slug={product.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="mx-auto max-w-[1440px] px-6 pb-32 pt-4 md:pt-8 lg:pb-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground transition">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <Link
            href="/produtos"
            className="hover:text-foreground transition"
          >
            Seleções
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="text-foreground" aria-current="page">
            {team?.shortName ?? product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <ProductGallerySplit images={product.images} alt={product.name} />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-7">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {team && (
                    <span
                      aria-hidden
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-2.5 py-1 text-xs"
                    >
                      <span className="text-base">{team.flag}</span>
                      {team.confederation}
                    </span>
                  )}
                  <span className="inline-flex rounded-full border border-turf/40 bg-turf/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-turf">
                    Oficial Nike
                  </span>
                  <div className="ml-auto">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>

                <SocialProof />

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {categoryLabel}
                </p>
                <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight md:text-5xl">
                  {product.name}
                </h1>

                <TrustChips />

                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold tabular-nums">
                    {formatBRL(product.priceCents)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    à vista em cartão ou boleto
                  </span>
                </div>

                <div className="rounded-xl border border-turf/40 bg-turf/10 px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-turf">
                    <Zap className="size-4" />
                    Pagando no PIX: {formatBRL(Math.round(product.priceCents * (1 - PIX_DISCOUNT_PCT / 100)))}
                  </p>
                  <p className="mt-1 text-[11px] text-turf/80">
                    {PIX_DISCOUNT_PCT}% OFF aplicado automaticamente no checkout.
                  </p>
                </div>

                <PdpUrgency />
              </header>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {team && (
                <ColorSwatches
                  primaryColor={team.primaryColor}
                  teamCode={team.code}
                />
              )}

              <StockProgress variants={product.variants} />

              <div id="pdp-cta" className={cn(isSoldOut && "opacity-60")}>
                {isSoldOut ? (
                  <NotifyMe
                    productId={product.id}
                    productName={product.name}
                  />
                ) : (
                  <AddToCartButton
                    product={product}
                    sizeHeaderExtra={
                      <div className="flex items-center gap-3">
                        <FitCalculator />
                        <SizeGuide />
                      </div>
                    }
                  />
                )}
              </div>

              <DeliveryEstimate />

              <ul className="grid grid-cols-2 gap-3 pt-2">
                <Feature icon={Truck} label="Despacho em 24h úteis" />
                <Feature icon={RefreshCw} label="Troca grátis em 7 dias" />
                <Feature icon={ShieldCheck} label="100% autêntica Nike" />
                <Feature icon={Zap} label="Frete grátis acima R$ 299" />
              </ul>

              <ShareButtons
                url={`/produtos/${product.slug}`}
                title={`${product.name} · 11 Of`}
              />

              {team && (
                <div className="rounded-2xl border border-border/80 bg-card/40 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
                    {team.code} · {team.confederation}
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold leading-tight">
                    {team.name}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground font-editorial italic">
                    &ldquo;{team.tagline}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border/70 pt-3 text-xs">
                    <span className="text-muted-foreground">Em campo</span>
                    <span className="font-semibold">{team.star.name}</span>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      #{team.star.number} · {team.star.position}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Detalhes da peça
                </p>
                <ProductSpecs />
              </div>
            </div>
          </div>
        </div>
      </article>

      <ProductEditorialStrip
        images={product.images}
        slug={product.slug}
        productName={product.name}
      />

      <ProductFAQ />

      <CrossSell products={cross} />

      <RecentlyViewed
        products={allProducts}
        excludeSlug={product.slug}
        title="Você também viu"
      />

      <StickyMobileCTA
        priceCents={product.priceCents}
        compareAtCents={product.compareAtCents}
        isSoldOut={isSoldOut}
      />
    </>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: typeof Truck;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-xs">
      <Icon className="size-3.5 text-turf" />
      <span className="text-foreground/85">{label}</span>
    </li>
  );
}
