"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { splitImages, BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Premium PDP gallery. Displays the "product shots" as the main gallery and
 * leaves editorial shots for a separate "Visto em" section further down.
 * Click (or Enter/Space) on the main image to open a full-screen lightbox.
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
  const [zoomed, setZoomed] = useState(false);
  const current = list[active] ?? list[0];

  useEffect(() => {
    if (!zoomed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(false);
      else if (e.key === "ArrowRight") setActive((i) => (i + 1) % list.length);
      else if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + list.length) % list.length);
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [zoomed, list.length]);

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:gap-5">
      <button
        type="button"
        onClick={() => setZoomed(true)}
        data-fly-source="product-gallery"
        aria-label="Ampliar imagem"
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
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
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
          />
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {active + 1}/{list.length}
        </div>
        <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur opacity-0 transition group-hover:opacity-100 motion-reduce:transition-none">
          <ZoomIn className="size-3" />
          Ampliar
        </div>
      </button>

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

      {zoomed && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(false);
            }}
            aria-label="Fechar"
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {list.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagem anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + list.length) % list.length);
                }}
                className="absolute left-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-8"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Próxima imagem"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % list.length);
                }}
                className="absolute right-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-8"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <div
            className="relative h-full max-h-[88vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={current}
              src={current}
              alt={alt}
              fill
              sizes="(min-width:1024px) 80vw, 100vw"
              className="object-contain"
              priority
            />
          </div>

          {list.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {active + 1} / {list.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
