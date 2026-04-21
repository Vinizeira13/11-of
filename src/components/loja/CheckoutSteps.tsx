import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Carrinho" },
  { id: 2, label: "Dados" },
  { id: 3, label: "Pagamento" },
] as const;

export function CheckoutSteps({
  activeStep = 2,
  allDone = false,
}: {
  activeStep?: 1 | 2 | 3;
  /** Mark every step as complete (e.g., after payment confirmation). */
  allDone?: boolean;
}) {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium sm:gap-3">
      {STEPS.map((s, i) => {
        const done = allDone || s.id < activeStep;
        const active = !allDone && s.id === activeStep;
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition",
                  done && "border-turf bg-turf text-turf-foreground",
                  active && "border-foreground bg-foreground text-background",
                  !done && !active && "border-border/70 text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3" aria-hidden /> : s.id}
              </span>
              <span
                className={cn(
                  "hidden sm:inline",
                  active
                    ? "text-foreground"
                    : done
                      ? "text-foreground/70"
                      : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px w-6 transition sm:w-10",
                  done ? "bg-turf/60" : "bg-border/70",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
