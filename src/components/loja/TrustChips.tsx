import { ShieldCheck, Truck, RefreshCw, Zap } from "lucide-react";

/**
 * Factually-true trust chips for the PDP. Replaces the old fake aggregate
 * rating badge — all four chips reflect real store policy commitments.
 */
export function TrustChips() {
  const items = [
    { icon: ShieldCheck, label: "Autêntica Nike" },
    { icon: Truck, label: "Despacho 24h" },
    { icon: RefreshCw, label: "Troca grátis 7 dias" },
    { icon: Zap, label: "PIX 15% OFF" },
  ];
  return (
    <ul className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {items.map((it) => (
        <li
          key={it.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-foreground/85"
        >
          <it.icon className="size-3 text-turf" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
