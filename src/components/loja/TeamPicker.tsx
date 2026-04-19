"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { TEAMS } from "@/lib/teams";
import {
  useFavoriteTeam,
  hasSeenTeamPicker,
  markTeamPickerSeen,
} from "@/lib/favorite-team";
import { cn } from "@/lib/utils";

const SLUGS: Record<string, string> = {
  BRA: "brasil",
  FRA: "france",
  ENG: "england",
  NED: "netherlands",
  CRO: "croatia",
  URU: "uruguay",
  NOR: "norway",
  CAN: "canada",
};

const teamImage = (code: string) =>
  `https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/${code.toLowerCase()}/002_nike-football-2026-federation-kits-${SLUGS[code] ?? code.toLowerCase()}-home-1.jpg`;

/**
 * First-visit team picker. Opens once unless user already picked a team or
 * dismissed the modal.
 */
export function TeamPicker() {
  const [open, setOpen] = useState(false);
  const { code, set } = useFavoriteTeam();

  useEffect(() => {
    // Wait a beat so we don't disrupt the Hero reveal
    const t = setTimeout(() => {
      if (!hasSeenTeamPicker()) setOpen(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  function pick(teamCode: string) {
    set(teamCode);
    setOpen(false);
  }

  function skip() {
    markTeamPickerSeen();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && skip()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl overflow-hidden p-0"
      >
        <button
          type="button"
          onClick={skip}
          className="absolute right-4 top-4 z-10 inline-flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground backdrop-blur hover:text-foreground transition"
          aria-label="Pular"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pt-10 pb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Antes de escolher · 11 Of
          </p>
          <DialogTitle asChild>
            <h2 className="mt-2 max-w-xl font-display text-4xl font-semibold leading-[1]">
              Qual seleção é a{" "}
              <span className="italic font-editorial font-normal">sua?</span>
            </h2>
          </DialogTitle>
          <DialogDescription className="mt-3 max-w-lg text-sm text-muted-foreground">
            A gente personaliza a home com a tua camisa em destaque. Pode trocar
            depois — toda a loja continua disponível.
          </DialogDescription>
        </div>

        <div className="grid grid-cols-4 gap-2 px-8 pb-6">
          {TEAMS.map((t) => {
            const active = code === t.code;
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => pick(t.code)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-muted transition",
                  active
                    ? "border-turf ring-2 ring-turf"
                    : "border-border/60 hover:border-foreground",
                )}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={teamImage(t.code)}
                    alt={t.shortName}
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white">
                    <span aria-hidden>{t.flag}</span>
                    {t.shortName}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/70">
                    {t.code}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-card/40 px-8 py-4">
          <p className="text-xs text-muted-foreground">
            Podemos pular por agora.
          </p>
          <button
            type="button"
            onClick={skip}
            className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-70 transition"
          >
            Ver a coleção inteira <ArrowRight className="size-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
