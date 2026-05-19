"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import type { PlayerOption } from "@/lib/personalization";
import { cn } from "@/lib/utils";

export type PlayerNamePickerValue = {
  /** Selected player option, or null for "sem nome" */
  player: PlayerOption | null;
};

export function PlayerNamePicker({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly PlayerOption[];
  value: PlayerNamePickerValue;
  onChange: (next: PlayerNamePickerValue) => void;
  className?: string;
}) {
  const groupId = useId();

  return (
    <fieldset
      className={cn(
        "relative space-y-3 rounded-2xl border border-border/70 bg-card/30 p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <legend className="inline-flex items-center gap-2 px-1 text-sm font-semibold">
          Nome na camisa
          <span className="inline-flex items-center rounded-full bg-turf/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-turf">
            Grátis
          </span>
        </legend>
        <span className="text-[11px] text-muted-foreground">+1 dia útil</span>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        <PlayerChip
          selected={value.player === null}
          onSelect={() => onChange({ player: null })}
          label="Sem nome"
          subtitle="Limpa"
        />
        {options.map((p) => (
          <PlayerChip
            key={p.id}
            selected={value.player?.id === p.id}
            onSelect={() => onChange({ player: p })}
            label={p.name}
            subtitle={`#${p.number}`}
          />
        ))}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Termotransferência oficial nas costas — sem custo extra.
      </p>
    </fieldset>
  );
}

function PlayerChip({
  selected,
  onSelect,
  label,
  subtitle,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex h-14 items-center justify-between rounded-xl border px-3 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        selected
          ? "border-turf bg-turf/10 text-foreground"
          : "border-border/70 hover:border-foreground",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block text-[11px] text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-full border transition",
          selected
            ? "border-turf bg-turf text-turf-foreground"
            : "border-border/70 bg-transparent text-transparent group-hover:border-foreground",
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    </button>
  );
}
