const STATS = [
  { value: "08", label: "Seleções oficiais" },
  { value: "24h", label: "Despacho garantido" },
  { value: "15%", label: "OFF no PIX" },
  { value: "100%", label: "Nike autenticidade" },
];

export function StatsBand() {
  return (
    <section
      aria-label="Stats da coleção"
      className="border-y border-border/60 bg-card/30"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4 md:gap-0 md:py-16">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col gap-1 px-2 md:px-6 ${
              i > 0 ? "md:border-l md:border-border/60" : ""
            }`}
          >
            <span className="font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
              {s.value}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
