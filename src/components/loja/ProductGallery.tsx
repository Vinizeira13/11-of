"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : [""];
  const current = safeImages[active] ?? safeImages[0];

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
            className="object-cover animate-in fade-in duration-300"
          />
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 flex-none overflow-hidden rounded-lg bg-muted transition md:h-24 md:w-20",
                "ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                i === active
                  ? "ring-2 ring-foreground"
                  : "opacity-70 hover:opacity-100",
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
