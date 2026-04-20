"use client";

import Image from "next/image";
import { useState } from "react";
import { splitImages, BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Premium PDP gallery. Displays the "product shots" as the main gallery and
 * leaves editorial shots for a separate "Visto em" section further down.
 */
export function ProductGallerySplit({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const { product } = splitImages(images);
  const list = product.length > 0 ? product : images;
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0];

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:gap-5">
      <div
        data-fly-source="product-gallery"
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted"
      >
        {current && (
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover animate-in fade-in duration-300"
          />
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {active + 1}/{list.length}
        </div>
      </div>

      {list.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 flex-none overflow-hidden rounded-lg bg-muted transition md:h-24 md:w-20",
                "ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                i === active
                  ? "ring-2 ring-turf"
                  : "opacity-60 hover:opacity-100",
              )}
              aria-label={`Imagem ${i + 1}`}
              aria-current={i === active}
            >
              <Image
                src={src}
                alt=""
                aria-hidden
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
