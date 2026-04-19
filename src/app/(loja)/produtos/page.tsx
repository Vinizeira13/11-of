import type { Metadata } from "next";
import { CatalogView } from "@/components/loja/CatalogView";
import { getPublishedProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Seleções",
  description:
    "Camisas oficiais das seleções da Copa 2026. Tiragem limitada, despacho em 24h.",
};

export default async function ProdutosPage(props: PageProps<"/produtos">) {
  const sp = await props.searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;

  const products = await getPublishedProducts(cat);

  const heading = cat === "selecao" ? "Seleções" : "Todas as camisas";

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Coleção Copa 2026 · Edição oficial Nike
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Tiragem controlada por seleção. Despacho em 24h úteis. Pague no PIX
            e ganhe 15% OFF automaticamente.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {products.length}{" "}
          {products.length === 1 ? "camisa disponível" : "camisas disponíveis"}
        </p>
      </header>

      <CatalogView products={products} />
    </section>
  );
}
