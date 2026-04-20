"use client";

import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Swatch = {
  id: string;
  label: string;
  color: string;
  available: boolean;
  dropAt?: string;
};

export function ColorSwatches({
  primaryColor,
  teamCode,
}: {
  primaryColor: string;
  teamCode: string;
}) {
  const swatches: Swatch[] = [
    { id: "home", label: "Home", color: primaryColor, available: true },
    {
      id: "away",
      label: "Away",
      color: "oklch(0.2 0.01 240)",
      available: false,
      dropAt: "Maio de 2026",
    },
    {
      id: "third",
      label: "Third",
      color: "oklch(0.75 0.18 80)",
      available: false,
      dropAt: "Junho de 2026",
    },
  ];

  function handleLockedClick(s: Swatch) {
    toast(`${s.label} · ${teamCode}`, {
      description: `Drop previsto: ${s.dropAt}. Pra avisar, entre na newsletter.`,
      duration: 3500,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">
          Colorway{" "}
          <span className="text-muted-foreground font-normal">· {teamCode}</span>
        </p>
        <p className="text-xs text-muted-foreground">Home · ativo</p>
      </div>

      <div className="flex items-center gap-3">
        {swatches.map((s) => (
          <div key={s.id} className="group relative">
            <button
              type="button"
              onClick={() => !s.available && handleLockedClick(s)}
              aria-label={`${s.label} ${s.available ? "(disponível)" : `(drop ${s.dropAt})`}`}
              className={cn(
                "relative flex size-14 items-center justify-center rounded-xl border-2 transition",
                s.available
                  ? "border-turf shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--turf)] cursor-default"
                  : "border-border/60 opacity-60 hover:opacity-90 cursor-pointer",
              )}
              style={{ backgroundColor: s.color }}
            >
              {!s.available && (
                <Lock className="size-4 text-white/80 drop-shadow" />
              )}
            </button>
            <span
              className={cn(
                "mt-1.5 block text-center text-[10px] font-medium uppercase tracking-wider",
                s.available ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {!s.available && s.dropAt && (
              <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-6 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border/80 bg-card px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground md:group-hover:block">
                Drop {s.dropAt}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
