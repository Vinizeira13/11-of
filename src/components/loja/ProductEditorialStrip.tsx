import Image from "next/image";
import { splitImages } from "@/lib/images";
import { teamBySlug, type TeamMeta } from "@/lib/teams";

/**
 * "Visto em" section — shows the editorial/player photos already stored for
 * this product. Falls back to nothing when there is no editorial content.
 */
export function ProductEditorialStrip({
  images,
  slug,
  productName,
}: {
  images: string[];
  slug: string;
  productName: string;
}) {
  const { editorial } = splitImages(images);
  if (editorial.length === 0) return null;

  const team = teamBySlug(slug);

  return (
    <section className="mx-auto max-w-[1440px] border-t border-border/60 px-6 py-16 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Editorial · Oficial Nike
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {team ? (
              <>
                {team.shortName}{" "}
                <span className="italic font-editorial font-normal">
                  em campo.
                </span>
              </>
            ) : (
              <>{productName}</>
            )}
          </h3>
          {team && (
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              {team.tagline} Imagens da campanha oficial Nike 2026.
            </p>
          )}
        </div>
        {team && (
          <StatGrid team={team} />
        )}
      </div>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {editorial.slice(0, 4).map((src, i) => (
          <div
            key={src}
            className={[
              "relative overflow-hidden rounded-2xl bg-muted",
              i === 0 ? "col-span-12 md:col-span-8 aspect-[4/5] md:aspect-[16/10]" :
              "col-span-6 md:col-span-4 aspect-[4/5]",
            ].join(" ")}
          >
            <Image
              src={src}
              alt={`${productName} — editorial ${i + 1}`}
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function StatGrid({ team }: { team: TeamMeta }) {
  return (
    <dl className="hidden shrink-0 grid-cols-3 gap-4 md:grid">
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Estrela
        </dt>
        <dd className="mt-1 font-display text-lg font-semibold leading-tight">
          {team.star.name}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Número
        </dt>
        <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">
          {team.star.number}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Posição
        </dt>
        <dd className="mt-1 font-display text-3xl font-semibold">
          {team.star.position}
        </dd>
      </div>
    </dl>
  );
}
