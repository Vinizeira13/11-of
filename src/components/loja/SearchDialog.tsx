"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/catalog";
import { TEAMS } from "@/lib/teams";
import { splitImages } from "@/lib/images";
import { cn } from "@/lib/utils";

type Entry = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string | null;
  keywords: string;
};

function buildEntries(products: Product[]): Entry[] {
  return products.map((p) => {
    const team = TEAMS.find((t) => t.slug === p.slug);
    const { product: shots, editorial } = splitImages(p.images);
    const image = shots[0] ?? editorial[0] ?? p.images[0] ?? null;
    const title = team ? team.name : p.name;
    const subtitle = team
      ? `${team.shortName} · ${team.code} · ${team.confederation}`
      : p.name;
    const keywords = [
      title,
      team?.shortName,
      team?.country,
      team?.code,
      team?.star.name, // kept internally so search by player still finds the kit
      p.name,
      p.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return { id: p.id, slug: p.slug, title, subtitle, image, keywords };
  });
}

export function SearchDialog({
  open,
  onOpenChange,
  products,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: Product[];
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const entries = useMemo(() => buildEntries(products), [products]);

  const filtered = useMemo(() => {
    if (!q.trim()) return entries.slice(0, 6);
    const needle = q.trim().toLowerCase();
    return entries
      .filter((e) => e.keywords.includes(needle))
      .slice(0, 8);
  }, [q, entries]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = filtered[active];
      if (pick) {
        onOpenChange(false);
        window.location.href = `/produtos/${pick.slug}`;
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] max-w-xl translate-y-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Buscar camisas</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Busque por seleção, jogador, código…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground transition"
            aria-label="Fechar busca"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma camisa encontrada pra{" "}
              <span className="italic text-foreground">&ldquo;{q}&rdquo;</span>.
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {filtered.map((e, i) => (
                <li key={e.id}>
                  <Link
                    href={`/produtos/${e.slug}`}
                    onClick={() => onOpenChange(false)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 transition",
                      i === active
                        ? "bg-turf/10"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <div className="relative size-10 flex-none overflow-hidden rounded-md bg-muted">
                      {e.image && (
                        <Image
                          src={e.image}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {e.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.subtitle}
                      </p>
                    </div>
                    {i === active && (
                      <CornerDownLeft className="size-3.5 text-muted-foreground" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="hidden items-center gap-3 sm:flex">
            <span>
              <kbd className="rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              navegar
            </span>
            <span>
              <kbd className="rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              abrir
            </span>
            <span>
              <kbd className="rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                esc
              </kbd>{" "}
              fechar
            </span>
          </div>
          <Link
            href="/produtos"
            onClick={() => onOpenChange(false)}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1 normal-case tracking-normal text-foreground/80 hover:border-foreground hover:text-foreground transition"
          >
            Ver todas as {entries.length} camisas
            <CornerDownLeft className="size-3" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
