"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { WORLD_CUP_OPENING } from "@/lib/brand";

const pad = (n: number) => n.toString().padStart(2, "0");

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  return { days, hours, minutes };
}

/**
 * Small urgency strip for the PDP — not the big home countdown, just a
 * one-liner reminding that the Copa opening is approaching. Drives the
 * "I want it before kickoff" purchase decision.
 */
export function PdpUrgency() {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    setParts(diff(WORLD_CUP_OPENING));
    const id = setInterval(() => setParts(diff(WORLD_CUP_OPENING)), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-orange-200">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Flame className="size-4" aria-hidden />
        <span>Chega antes da bola rolar</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-sm tabular-nums text-foreground">
        <Block label="d" value={pad(parts.days)} />
        <span className="text-orange-300/50">:</span>
        <Block label="h" value={pad(parts.hours)} />
        <span className="text-orange-300/50">:</span>
        <Block label="min" value={pad(parts.minutes)} />
      </div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className="font-semibold">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-orange-300/60">
        {label}
      </span>
    </span>
  );
}
