export default function Loading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-10 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-muted/60" />
        <div className="h-10 w-64 animate-pulse rounded bg-muted/60 md:h-14 md:w-96" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/60"
          />
        ))}
      </div>
    </section>
  );
}
