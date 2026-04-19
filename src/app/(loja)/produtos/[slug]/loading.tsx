export default function Loading() {
  return (
    <article className="mx-auto max-w-[1440px] px-6 pb-32 pt-8">
      <div className="mb-6 h-3 w-40 animate-pulse rounded bg-muted/60" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
        <div className="lg:col-span-3">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/60" />
        </div>
        <div className="space-y-5 lg:col-span-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted/60" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-muted/60" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-muted/60" />
          <div className="h-14 w-full animate-pulse rounded-full bg-muted/60" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-muted/60" />
        </div>
      </div>
    </article>
  );
}
