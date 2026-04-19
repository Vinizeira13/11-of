import { Truck, ShieldCheck, RefreshCw, Zap } from "lucide-react";

const ITEMS = [
  {
    icon: Zap,
    title: "PIX 15% OFF",
    body: "Desconto automático no checkout.",
  },
  {
    icon: Truck,
    title: "Frete grátis",
    body: "Acima de R$ 299 pra todo Brasil.",
  },
  {
    icon: RefreshCw,
    title: "Troca grátis",
    body: "Em até 7 dias após o recebimento.",
  },
  {
    icon: ShieldCheck,
    title: "100% oficial",
    body: "Camisas licenciadas Nike, Adidas & Puma.",
  },
];

export function TrustBand() {
  return (
    <section aria-label="Garantias" className="border-y border-border/60 bg-background">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 md:grid-cols-4 md:py-12">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card/60">
              <it.icon className="size-4 text-turf" />
            </span>
            <div>
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {it.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
