export default function Loading() {
  return (
    <article className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="h-[420px] animate-pulse rounded-3xl bg-muted/60" />
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-4 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
          <div className="h-8 w-5/6 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="md:col-span-8 space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-muted/60"
              style={{ width: `${70 + Math.random() * 25}%` }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
