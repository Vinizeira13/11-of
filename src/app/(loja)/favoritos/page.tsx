import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getPublishedProducts } from "@/lib/catalog";
import { FavoritesClient } from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "As camisas que você salvou pra depois.",
  robots: { index: false, follow: false },
};

export default async function FavoritosPage() {
  const products = await getPublishedProducts();

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 md:py-16">
      <header className="mb-10 flex flex-col gap-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          <Heart className="size-3" /> Seus favoritos
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Salvas pra depois.
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Esses são os jerseys que você marcou. Lista fica salva no seu
          dispositivo, sem conta nenhuma.
        </p>
      </header>

      <FavoritesClient products={products} />
    </section>
  );
}
