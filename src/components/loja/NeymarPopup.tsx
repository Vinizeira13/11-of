"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "11of:neymar:seen";
const HREF = "/produtos/camisa-brasil-home-2026";

// Editorial shot of Neymar holding up the Brasil home jersey. Matches the
// "Neymar foi convocado" headline exactly — no Vini Jr / #20 dissonance.
const IMAGE = "/neymar-brasil-2026.webp";

const SCROLL_TRIGGER_PX = 240;
const TIMER_FALLBACK_MS = 6000;

export function NeymarPopup() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Skip on the very PDP the popup links to — pushing the customer to the
  // page they're already viewing is just noise.
  const isOnTargetPage = pathname === HREF;

  useEffect(() => {
    if (isOnTargetPage) return;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}

    let fired = false;
    let timer: number | undefined;

    function trigger() {
      if (fired) return;
      fired = true;
      cleanup();
      setOpen(true);
    }

    function onScroll() {
      if (window.scrollY > SCROLL_TRIGGER_PX) trigger();
    }

    function cleanup() {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }

    timer = window.setTimeout(trigger, TIMER_FALLBACK_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    return cleanup;
  }, [isOnTargetPage]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 sm:max-w-md"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          <Image
            src={IMAGE}
            alt="Camisa Brasil Home 2026 — coleção oficial Nike"
            fill
            sizes="(min-width:640px) 28rem, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15"
          />

          <DialogClose
            aria-label="Fechar"
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
          >
            <X className="size-4" />
          </DialogClose>

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            Convocação confirmada
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/75">
              Seleção Brasileira · Copa 2026
            </p>
            <DialogTitle className="font-display text-3xl font-semibold leading-[0.95] tracking-tight text-white">
              Neymar foi convocado.
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/80">
              A camisa da Seleção pra Copa 2026 chegou. Coleção oficial Nike —
              tiragem controlada, quando esgotar acabou.
            </DialogDescription>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <DialogClose asChild>
                <Link
                  href={HREF}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-white/90"
                >
                  Ver a camisa
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
