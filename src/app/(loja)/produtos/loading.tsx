export default function Loading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 md:py-16">
      <div className="mb-10 flex flex-col gap-3">
        <div className="h-2.5 w-48 animate-pulse rounded bg-muted/60" />
        <div className="h-10 w-72 animate-pulse rounded bg-muted/60 md:w-96" />
      </div>

      <div className="mb-8 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 animate-pulse rounded-full bg-muted/60"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/60" />
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted/60" />
              </div>
              <div className="h-3 w-14 animate-pulse rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
