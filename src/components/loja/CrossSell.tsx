import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

export function CrossSell({
  products,
  title = "Também vão pra Copa.",
  kicker = "Outras seleções",
}: {
  products: Product[];
  title?: string;
  kicker?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] border-t border-border/60 px-6 py-16 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            {kicker}
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h3>
        </div>
        <Link
          href="/produtos"
          className="hidden items-center gap-1.5 text-sm font-medium hover:opacity-70 transition md:inline-flex"
        >
          Ver todas <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
