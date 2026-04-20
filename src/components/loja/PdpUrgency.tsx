"use client";

import { useEffect, useState } from "react";
import { Truck, Package } from "lucide-react";

const CUT_OFF_HOUR = 15;
const pad = (n: number) => n.toString().padStart(2, "0");

type TickState = {
  beforeCutOff: boolean;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeTick(now: Date): TickState {
  const beforeCutOff = now.getHours() < CUT_OFF_HOUR;
  if (!beforeCutOff) {
    return { beforeCutOff, hours: 0, minutes: 0, seconds: 0 };
  }
  const cutOff = new Date(now);
  cutOff.setHours(CUT_OFF_HOUR, 0, 0, 0);
  const ms = cutOff.getTime() - now.getTime();
  return {
    beforeCutOff,
    hours: Math.floor(ms / 3_600_000),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

/**
 * PDP shipping urgency — two-row editorial card, based on real Brazilian
 * shipping averages. Dispatch cut-off ticks live; delivery window is the
 * national median. CEP-precise estimate appears at checkout.
 */
export function PdpUrgency() {
  const [state, setState] = useState<TickState>({
    beforeCutOff: true,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setState(computeTick(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { beforeCutOff, hours, minutes, seconds } = state;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-turf/25 bg-gradient-to-br from-turf/[0.08] via-turf/[0.03] to-transparent transition-[opacity,transform] duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      {/* breathing halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(ellipse_at_top,var(--turf)/0.18,transparent_60%)] blur-2xl"
      />
      {/* shimmer scan */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-shimmer opacity-40"
      />
      {/* noise texture */}
      <div aria-hidden className="noise absolute inset-0 opacity-20" />

      {/* Row 1 — Dispatch */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-turf/15 text-turf">
            {beforeCutOff && (
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-turf/35"
              />
            )}
            <Truck className="relative size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-turf">
              {beforeCutOff ? "Despacho hoje" : "Despacho amanhã"}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-foreground/65">
              {beforeCutOff
                ? "Fechamos às 15h"
                : "Pedidos após 15h saem no próximo dia útil"}
            </p>
          </div>
        </div>

        {beforeCutOff ? (
          <div
            className="flex items-center gap-0.5 font-mono tabular-nums"
            aria-label={`${hours}h${minutes}min${seconds}s até o fim do despacho`}
          >
            <DigitBox value={pad(hours)} />
            <Sep />
            <DigitBox value={pad(minutes)} />
            <Sep />
            <DigitBox value={pad(seconds)} live />
          </div>
        ) : (
          <span className="rounded-full border border-turf/30 bg-turf/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-turf">
            Sai cedo
          </span>
        )}
      </div>

      {/* divider */}
      <div
        aria-hidden
        className="relative mx-4 h-px bg-gradient-to-r from-transparent via-turf/25 to-transparent"
      />

      {/* Row 2 — Delivery window */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-card/70 text-foreground/80 ring-1 ring-border/60">
            <Package className="size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Entrega estimada
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-foreground/65">
              Correios & Jadlog — média Brasil
            </p>
          </div>
        </div>
        <p className="text-right text-sm font-semibold leading-tight text-foreground">
          3–7{" "}
          <span className="text-xs font-medium text-foreground/55">
            dias úteis
          </span>
        </p>
      </div>
    </div>
  );
}

function Sep() {
  return <span className="px-0.5 text-turf/50">:</span>;
}

function DigitBox({ value, live = false }: { value: string; live?: boolean }) {
  return (
    <span
      key={value}
      className={`inline-flex min-w-[2.2ch] justify-center rounded-md bg-card/70 px-1.5 py-1 text-base font-semibold ring-1 ring-turf/20 animate-in fade-in zoom-in-95 duration-200 ${
        live ? "text-turf" : "text-foreground"
      }`}
    >
      {value}
    </span>
  );
}
