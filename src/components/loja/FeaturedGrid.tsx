import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { ScrollReveal } from "./animations/ScrollReveal";

export function FeaturedGrid({
  products,
  title = "Camisas oficiais",
  kicker = "Edição Copa 2026",
  href = "/produtos",
}: {
  products: Product[];
  title?: string;
  kicker?: string;
  href?: string;
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            {kicker}
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="hidden items-center gap-1.5 text-sm font-medium hover:opacity-70 transition md:inline-flex"
        >
          Ver catálogo <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <ScrollReveal className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <div key={p.id} data-reveal>
            <ProductCard product={p} priority={i < 4} />
          </div>
        ))}
      </ScrollReveal>
    </section>
  );
}
