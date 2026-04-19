"use client";

import { useState, useTransition } from "react";
import { Truck, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCEP, maskCEP } from "@/lib/cep";
import {
  estimateDelivery,
  formatDeliveryRange,
  type DeliveryEstimate as Estimate,
} from "@/lib/delivery";

type State =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "ok"; estimate: Estimate };

export function DeliveryEstimate() {
  const [cep, setCep] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleCalculate() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setState({ kind: "error", message: "Informe um CEP válido." });
      return;
    }
    startTransition(async () => {
      const lookup = await fetchCEP(digits);
      if (!lookup) {
        setState({ kind: "error", message: "CEP não encontrado." });
        return;
      }
      const estimate = estimateDelivery(
        lookup.uf,
        `${lookup.localidade}, ${lookup.uf}`,
      );
      setState({ kind: "ok", estimate });
    });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4" aria-hidden />
        Calcular entrega
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(maskCEP(e.target.value))}
          maxLength={9}
          className="h-10"
          aria-label="Seu CEP"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleCalculate}
          disabled={isPending}
          className="h-10 px-4"
        >
          {isPending ? "…" : "Calcular"}
        </Button>
      </div>

      {state.kind === "error" && (
        <p className="mt-3 text-xs text-destructive">{state.message}</p>
      )}

      {state.kind === "ok" && (
        <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 h-4 w-4 flex-none text-muted-foreground"
              aria-hidden
            />
            <div>
              <p className="font-medium">
                Chega em{" "}
                <span className="tabular-nums">
                  {formatDeliveryRange(state.estimate)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {state.estimate.cityLabel}
              </p>
            </div>
          </div>

          {state.estimate.cutOff && (
            <div className="flex items-start gap-2">
              <Clock
                className="mt-0.5 h-4 w-4 flex-none text-muted-foreground"
                aria-hidden
              />
              <p className="text-xs text-muted-foreground">
                Peça antes das 15h —{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {state.estimate.cutOff.hoursLeft}h{" "}
                  {state.estimate.cutOff.minutesLeft}min
                </span>{" "}
                — pra despachar ainda hoje.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
