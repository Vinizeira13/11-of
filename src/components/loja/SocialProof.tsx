import { Clock, ShieldCheck } from "lucide-react";

/**
 * Honest "shop status" pill. Replaces the old fake-viewers+bestseller
 * component — shows only the current local despacho/window info, which
 * is always true.
 */
export function SocialProof() {
  const now = new Date();
  const brazilHours = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  ).getHours();
  const isOpen = brazilHours >= 8 && brazilHours < 18;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-2.5 py-1">
        <span className="relative flex size-1.5">
          {isOpen && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turf opacity-70" />
          )}
          <span
            className={`relative inline-flex size-1.5 rounded-full ${
              isOpen ? "bg-turf" : "bg-muted-foreground"
            }`}
          />
        </span>
        <Clock className="size-3" />
        <span className="text-foreground/85">
          {isOpen
            ? "Despachando agora"
            : "Pedido entra na fila da manhã"}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-turf/40 bg-turf/10 px-2.5 py-1 font-medium text-turf">
        <ShieldCheck className="size-3" />
        Autenticidade garantida
      </span>
    </div>
  );
}
