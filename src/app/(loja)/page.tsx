import { Hero } from "@/components/loja/Hero";
import { TeamStripe } from "@/components/loja/TeamStripe";
import { StatsBand } from "@/components/loja/StatsBand";
import { FeaturedGrid } from "@/components/loja/FeaturedGrid";
import { MidBanner } from "@/components/loja/MidBanner";
import { EditorialSection } from "@/components/loja/EditorialSection";
import { Manifesto } from "@/components/loja/Manifesto";
import { PressBand } from "@/components/loja/PressBand";
import { TrustBand } from "@/components/loja/TrustBand";
import { RecentlyViewed } from "@/components/loja/RecentlyViewed";
import { getPublishedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getPublishedProducts();
  const featured = products.slice(0, 8);
  const editorialSource = products.slice(0, 5);

  return (
    <>
      <Hero />
      <TeamStripe />
      <StatsBand />
      <FeaturedGrid
        products={featured.slice(0, 4)}
        kicker="Em destaque"
        title="Primeira escalação."
        href="/produtos"
      />
      <Manifesto />
      <EditorialSection products={editorialSource} />
      <MidBanner />
      <PressBand />
      <FeaturedGrid
        products={featured.slice(4, 8)}
        kicker="Reservas"
        title="Também entram em campo."
        href="/produtos"
      />
      <RecentlyViewed products={products} />
      <TrustBand />
    </>
  );
}
