"use client";

import { useMemo, useState } from "react";
import { Calculator, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Fit = "compressed" | "athletic" | "relaxed";

function recommendSize(
  heightCm: number,
  weightKg: number,
  fit: Fit,
): { size: string; confidence: "alta" | "média" | "baixa"; note: string } {
  if (!heightCm || !weightKg) {
    return { size: "—", confidence: "baixa", note: "Preencha altura e peso." };
  }
  const bmi = weightKg / Math.pow(heightCm / 100, 2);

  // Base thresholds for "athletic" fit
  let size: string;
  if (weightKg < 62) size = "P";
  else if (weightKg < 74) size = "M";
  else if (weightKg < 88) size = "G";
  else if (weightKg < 104) size = "GG";
  else size = "GG";

  // Fit adjustment
  const sizes = ["P", "M", "G", "GG"] as const;
  let idx = sizes.indexOf(size as (typeof sizes)[number]);
  if (fit === "compressed") idx = Math.max(0, idx - 1);
  if (fit === "relaxed") idx = Math.min(sizes.length - 1, idx + 1);
  size = sizes[idx];

  // Height sanity tweak
  if (heightCm < 165 && idx > 0 && fit !== "relaxed") size = sizes[idx - 1];
  if (heightCm > 190 && idx < sizes.length - 1 && fit !== "compressed")
    size = sizes[idx + 1];

  const confidence: "alta" | "média" | "baixa" =
    bmi > 33 || bmi < 17 ? "média" : "alta";

  const note =
    fit === "compressed"
      ? "Cai colado no corpo — mesma pegada da camisa oficial do jogador."
      : fit === "relaxed"
        ? "Cai um pouco mais largo — ideal pra usar fora do estádio."
        : "Modelagem atlética padrão — a mesma da peça oficial Nike.";

  return { size, confidence, note };
}

export function FitCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fit, setFit] = useState<Fit>("athletic");

  const result = useMemo(() => {
    const h = Number(height.replace(/\D/g, ""));
    const w = Number(weight.replace(/\D/g, ""));
    return recommendSize(h, w, fit);
  }, [height, weight, fit]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition"
        >
          <Calculator className="size-3.5" />
          Qual tamanho me serve?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
            Calculadora de caimento
          </DialogTitle>
          <DialogDescription>
            Não rola provar? Esse atalho te dá uma recomendação com base nas
            medidas Nike oficiais.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Altura (cm)
              </span>
              <input
                inputMode="numeric"
                maxLength={3}
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
                placeholder="178"
                className="h-11 rounded-lg border border-border/70 bg-card/40 px-3 text-sm outline-none focus:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Peso (kg)
              </span>
              <input
                inputMode="numeric"
                maxLength={3}
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))}
                placeholder="74"
                className="h-11 rounded-lg border border-border/70 bg-card/40 px-3 text-sm outline-none focus:border-foreground"
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Caimento que prefere
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "compressed", label: "Colado" },
                  { id: "athletic", label: "Atlético" },
                  { id: "relaxed", label: "Relaxado" },
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setFit(o.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition",
                    fit === o.id
                      ? "border-turf bg-turf/10 text-turf"
                      : "border-border/70 hover:border-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-turf/30 bg-turf/5 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
                Recomendação
              </p>
              <span className="text-xs text-muted-foreground">
                Confiança {result.confidence}
              </span>
            </div>
            <p className="mt-2 flex items-baseline gap-2 font-display text-4xl font-semibold text-foreground">
              {result.size}
              <Check className="size-5 text-turf" />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{result.note}</p>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Se ficar na dúvida, vai no maior — trocas são gratuitas em até 7
            dias.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
