import Link from "next/link";
import { Check, Copy, ExternalLink, Package, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { carrierLabel, carrierTrackUrl } from "@/lib/carriers";
import { cn } from "@/lib/utils";

type Step = {
  key: "received" | "paid" | "preparing" | "dispatched" | "delivered";
  label: string;
  hint?: string;
  doneAt: Date | null;
  icon: typeof Check;
};

const fmtDate = (d: Date | null) =>
  d
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d)
    : null;

/**
 * Customer-facing delivery progress timeline, computed from the order row.
 *
 * No network calls — pure presentational. Steps that haven't happened yet
 * render as dimmed / dashed. The active step pulses.
 */
export function DeliveryTimeline({
  createdAt,
  paidAt,
  deliveryStatus,
  dispatchedAt,
  deliveredAt,
  trackingCode,
  trackingCarrier,
  deliveryNotes,
}: {
  createdAt: string;
  paidAt: string | null;
  deliveryStatus:
    | "pending"
    | "preparing"
    | "dispatched"
    | "delivered"
    | "returned"
    | "cancelled";
  dispatchedAt: string | null;
  deliveredAt: string | null;
  trackingCode: string | null;
  trackingCarrier: string | null;
  deliveryNotes: string | null;
}) {
  const paid = !!paidAt;
  const preparing =
    deliveryStatus === "preparing" ||
    deliveryStatus === "dispatched" ||
    deliveryStatus === "delivered";
  const dispatched =
    deliveryStatus === "dispatched" || deliveryStatus === "delivered";
  const delivered = deliveryStatus === "delivered";

  const cancelled = deliveryStatus === "cancelled" || deliveryStatus === "returned";

  const steps: Step[] = [
    {
      key: "received",
      label: "Pedido recebido",
      doneAt: new Date(createdAt),
      icon: ShoppingBag,
    },
    {
      key: "paid",
      label: "Pagamento confirmado",
      doneAt: paidAt ? new Date(paidAt) : null,
      hint: paid ? undefined : "Assim que o PIX cair, muda aqui.",
      icon: Check,
    },
    {
      key: "preparing",
      label: "Preparando pedido",
      doneAt: preparing ? new Date(paidAt ?? createdAt) : null,
      hint:
        deliveryStatus === "preparing" && !dispatched
          ? "Embalando. Despacho em 24h úteis."
          : undefined,
      icon: Package,
    },
    {
      key: "dispatched",
      label: "Enviado",
      doneAt: dispatchedAt ? new Date(dispatchedAt) : null,
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Entregue",
      doneAt: deliveredAt ? new Date(deliveredAt) : null,
      icon: Sparkles,
    },
  ];

  // Find the active (pulsing) step: first step that isn't done yet
  const activeIdx = steps.findIndex((s) => !s.doneAt);

  const trackUrl = carrierTrackUrl(trackingCarrier, trackingCode);
  const carrierName = carrierLabel(trackingCarrier);

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
        <p className="font-semibold text-destructive">
          Pedido{" "}
          {deliveryStatus === "cancelled" ? "cancelado" : "devolvido"}
        </p>
        <p className="mt-1 text-muted-foreground">
          Se você não reconhece esse status, chama o atendimento que a gente
          resolve.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Status da entrega" className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          Acompanhe seu pedido
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">
          {delivered
            ? "Entregue!"
            : dispatched
              ? "Na estrada"
              : preparing
                ? "Preparando"
                : paid
                  ? "Pagamento confirmado"
                  : "Aguardando PIX"}
        </h2>
      </div>

      <ol className="relative">
        {steps.map((step, i) => {
          const done = !!step.doneAt;
          const isActive = i === activeIdx;
          const Icon = step.icon;

          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Vertical connector line */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-4 top-8 h-[calc(100%-32px)] w-0.5",
                    done ? "bg-turf" : "bg-border/60",
                  )}
                />
              )}

              {/* Node */}
              <span
                className={cn(
                  "relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition",
                  done
                    ? "border-turf bg-turf text-turf-foreground"
                    : isActive
                      ? "border-foreground bg-background text-foreground"
                      : "border-border/60 bg-background text-muted-foreground",
                )}
              >
                {isActive && !done && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full bg-foreground/20"
                  />
                )}
                <Icon className="relative size-3.5" aria-hidden />
              </span>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      !done && !isActive && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.doneAt && (
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {fmtDate(step.doneAt)}
                    </p>
                  )}
                </div>

                {step.hint && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {step.hint}
                  </p>
                )}

                {/* Tracking pill inside the Dispatched step */}
                {step.key === "dispatched" && dispatched && trackingCode && (
                  <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {carrierName ?? "Rastreio"}
                    </span>
                    <code className="font-mono text-xs font-semibold">
                      {trackingCode}
                    </code>
                    {trackUrl && (
                      <Link
                        href={trackUrl}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 rounded-full bg-turf px-2.5 py-0.5 text-[10px] font-semibold text-turf-foreground hover:bg-turf/90 transition"
                      >
                        Rastrear
                        <ExternalLink className="size-2.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {deliveryNotes && (
        <div className="rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Obs. da loja: </span>
          {deliveryNotes}
        </div>
      )}
    </section>
  );
}
