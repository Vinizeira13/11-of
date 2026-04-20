export default function Loading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-10 space-y-4">
        <div className="h-3 w-48 animate-pulse rounded bg-muted/60" />
        <div className="h-16 w-4/5 animate-pulse rounded bg-muted/60 md:h-24 md:w-2/3" />
      </div>
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={[
              "animate-pulse rounded-2xl bg-muted/60",
              i % 6 === 0
                ? "col-span-12 md:col-span-8 aspect-[16/10]"
                : i % 6 === 3
                  ? "col-span-12 md:col-span-3 aspect-[4/5]"
                  : "col-span-6 md:col-span-4 aspect-[4/5]",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
