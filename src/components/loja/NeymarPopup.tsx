"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "11of:neymar:seen";
const HREF = "/produtos/camisa-brasil-home-2026";
const IMAGE =
  "https://csojptgqkpaghnmeswvn.supabase.co/storage/v1/object/public/jersey-assets/nike/bra/005_nike-football-2026-federation-kits-brasil-vini-jr.webp";

export function NeymarPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}

    timer = window.setTimeout(() => {
      if (cancelled) return;
      setOpen(true);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }, 1200);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton
        className="overflow-hidden p-0 sm:max-w-md"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          <Image
            src={IMAGE}
            alt="Camisa Brasil Home 2026"
            fill
            sizes="(min-width:640px) 28rem, 100vw"
            className="object-cover"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"
          />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            Urgente · ao vivo
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/75">
              Seleção Brasileira · Copa 2026
            </p>
            <DialogTitle className="font-display text-3xl font-semibold leading-[0.95] tracking-tight text-white">
              Neymar foi convocado.
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/80">
              A camisa <span className="font-semibold text-white">#10</span> da
              Seleção tá saindo rápido. Tiragem controlada — quando esgotar,
              acabou.
            </DialogDescription>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <DialogClose asChild>
                <Link
                  href={HREF}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-white/90"
                >
                  Garantir a minha
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <button
                  type="button"
                  className="rounded-full px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
                >
                  Agora não
                </button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
