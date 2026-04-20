"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Truck, MapPin, Clock, Check } from "lucide-react";
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

const STORAGE_KEY = "11of:delivery-cep";

export function DeliveryEstimate() {
  const [cep, setCep] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const firedForRef = useRef<string | null>(null);

  // Rehydrate last-used CEP so return visitors don't retype.
  useEffect(() => {
    try {
      const last = window.localStorage.getItem(STORAGE_KEY) ?? "";
      if (last) setCep(maskCEP(last));
    } catch {}
  }, []);

  // Auto-calculate as soon as 8 digits are typed. Debounced via the
  // `fired` ref so each CEP only runs once, even as the user keeps typing.
  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    if (firedForRef.current === digits) return;
    firedForRef.current = digits;

    try {
      window.localStorage.setItem(STORAGE_KEY, digits);
    } catch {}

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
  }, [cep]);

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Truck className="size-4 text-turf" aria-hidden />
        Calcular entrega
      </div>

      <div className="relative mt-3">
        <input
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => {
            const next = maskCEP(e.target.value);
            setCep(next);
            if (next.replace(/\D/g, "").length < 8) {
              setState({ kind: "idle" });
              firedForRef.current = null;
            }
          }}
          maxLength={9}
          className="h-11 w-full rounded-lg border border-border/70 bg-background px-3.5 text-sm tabular-nums outline-none focus:border-foreground"
          aria-label="Seu CEP"
        />
        {isPending && (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 size-3 -translate-y-1/2 animate-pulse rounded-full bg-turf"
          />
        )}
      </div>

      {state.kind === "error" && (
        <p className="mt-3 text-xs text-destructive">{state.message}</p>
      )}

      {state.kind === "ok" && (
        <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 size-4 flex-none text-muted-foreground"
              aria-hidden
            />
            <div>
              <p className="font-medium">
                <Check className="inline size-3.5 text-turf align-baseline" />{" "}
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
                className="mt-0.5 size-4 flex-none text-muted-foreground"
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
