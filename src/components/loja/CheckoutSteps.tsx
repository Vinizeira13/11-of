import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Carrinho", state: "done" },
  { id: 2, label: "Dados", state: "active" },
  { id: 3, label: "Pagamento", state: "todo" },
] as const;

export function CheckoutSteps() {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium sm:gap-3">
      {STEPS.map((s, i) => {
        const done = s.state === "done";
        const active = s.state === "active";
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition",
                  done && "border-turf bg-turf text-turf-foreground",
                  active && "border-foreground bg-foreground text-background",
                  !done && !active && "border-border/70 text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3" /> : s.id}
              </span>
              <span
                className={cn(
                  "hidden sm:inline",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="h-px w-6 bg-border/70 sm:w-10"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
