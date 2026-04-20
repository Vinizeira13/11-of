import { ShieldCheck, Truck, Lock, Zap, Package } from "lucide-react";

const ROWS = [
  { icon: ShieldCheck, label: "Nike licenciado", sub: "Distribuidor autorizado" },
  { icon: Zap, label: "PIX oficial", sub: "Processado via pague.dev" },
  { icon: Truck, label: "Correios + Jadlog", sub: "Despacho em 24h úteis" },
  { icon: Package, label: "Troca grátis", sub: "7 dias após recebimento" },
  { icon: Lock, label: "Compra segura", sub: "TLS 1.3 · dados criptografados" },
];

/**
 * Bar of real partners and commitments (replaces the old fake press quotes
 * that claimed coverage we don't have). Everything here is true.
 */
export function PartnersBand() {
  return (
    <section
      aria-label="Parceiros e garantias"
      className="mx-auto max-w-[1440px] px-6 py-16 md:py-20"
    >
      <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground text-center">
        Com o que a gente se compromete
      </p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {ROWS.map((r) => (
          <li
            key={r.label}
            className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/30 p-4"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-turf/30 bg-turf/10 text-turf">
              <r.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{r.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {r.sub}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
