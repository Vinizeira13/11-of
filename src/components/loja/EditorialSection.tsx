import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { splitImages } from "@/lib/images";
import { teamBySlug } from "@/lib/teams";

/**
 * Editorial lifestyle grid that uses the player/editorial photos already
 * uploaded per product. Falls back gracefully when editorial images are
 * missing. Bento-style asymmetric layout.
 */
export function EditorialSection({ products }: { products: Product[] }) {
  const pieces = products
    .map((p) => {
      const { editorial, product: pshots } = splitImages(p.images);
      const hero = editorial[0] ?? pshots[1] ?? pshots[0];
      if (!hero) return null;
      return { product: p, hero, team: teamBySlug(p.slug) };
    })
    .filter((x): x is { product: Product; hero: string; team: ReturnType<typeof teamBySlug> } => x !== null)
    .slice(0, 5);

  if (pieces.length < 3) return null;

  const [a, b, c, d, e] = pieces;

  return (
    <section className="relative mx-auto max-w-[1440px] px-6 py-20 md:py-28">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Editorial · 11 Of
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Quem veste,{" "}
            <span className="italic font-editorial font-normal">corre.</span>
          </h2>
        </div>
        <Link
          href="/editorial"
          className="hidden items-center gap-1.5 text-sm font-medium hover:opacity-70 transition md:inline-flex"
        >
          Ver editorial completo <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        <EditorialTile
          data={a}
          className="col-span-12 md:col-span-8 aspect-[4/5] md:aspect-[16/11]"
          priority
        />
        <EditorialTile
          data={b}
          className="col-span-6 md:col-span-4 aspect-[4/5]"
        />
        <EditorialTile
          data={c}
          className="col-span-6 md:col-span-4 aspect-[4/5]"
        />
        {d && (
          <EditorialTile
            data={d}
            className="col-span-6 md:col-span-4 aspect-[4/5]"
          />
        )}
        {e && (
          <EditorialTile
            data={e}
            className="col-span-12 md:col-span-4 aspect-[4/5]"
          />
        )}
      </div>
    </section>
  );
}

function EditorialTile({
  data,
  className,
  priority,
}: {
  data: { product: Product; hero: string; team: ReturnType<typeof teamBySlug> };
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/produtos/${data.product.slug}`}
      className={`group relative block overflow-hidden rounded-2xl bg-muted ${className ?? ""}`}
    >
      <Image
        src={data.hero}
        alt={data.product.name}
        fill
        sizes="(min-width:1024px) 50vw, 100vw"
        priority={priority}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
            {data.team?.flag} {data.team?.shortName ?? "Seleção"}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-white md:text-2xl">
            {data.team?.star.name ?? data.product.name}
          </p>
        </div>
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition group-hover:bg-turf group-hover:border-turf group-hover:text-turf-foreground">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
