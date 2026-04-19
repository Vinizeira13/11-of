"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TEAMS } from "@/lib/teams";
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

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground transition"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Loja
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "pointer-events-none absolute left-[-24px] top-full z-50 pt-3 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0",
        )}
      >
        <div className="w-[min(96vw,960px)] rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-end justify-between gap-6 border-b border-border/60 pb-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Coleção Copa 2026
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                Explore por seleção
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/produtos"
                onClick={() => setOpen(false)}
                className="font-medium underline-offset-4 hover:underline"
              >
                Ver todas →
              </Link>
              <Link
                href="/produtos?conf=UEFA"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Europa
              </Link>
              <Link
                href="/produtos?conf=CONMEBOL"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                América do Sul
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {TEAMS.slice(0, 8).map((team, i) => (
              <MegaMenuCard
                key={team.code}
                team={team}
                priority={i < 4}
                onSelect={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MegaMenuCard({
  team,
  priority,
  onSelect,
}: {
  team: (typeof TEAMS)[number];
  priority?: boolean;
  onSelect?: () => void;
}) {
  const code = team.code.toLowerCase();
  const img = `https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/${code}/002_nike-football-2026-federation-kits-${SLUGS[team.code] ?? code}-home-1.jpg`;

  return (
    <Link
      href={`/produtos/${team.slug}`}
      onClick={onSelect}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <Image
          src={img}
          alt={team.shortName}
          fill
          sizes="220px"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span aria-hidden>{team.flag}</span>
          {team.shortName}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {team.code}
        </span>
      </div>
    </Link>
  );
}
