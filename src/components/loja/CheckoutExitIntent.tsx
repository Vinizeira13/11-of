"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Timer, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";

const SESSION_KEY = "11of:exit-intent-seen";
const MOBILE_IDLE_MS = 45_000;

/**
 * Abandonment-prevention modal. Triggers once per browser session when the
 * user shows intent to leave the checkout:
 *   - Desktop: mouse moves out the top of the viewport (toward tab bar / URL)
 *   - Mobile: 45s of no scroll/touch/keydown (no reliable mouseleave there)
 *
 * Non-intrusive: dismissed on X, Esc, or clicking away. Only shown when the
 * cart actually has something to save.
 */
export function CheckoutExitIntent({
  totalCents,
  itemsCount,
  pixSavingsCents,
}: {
  totalCents: number;
  itemsCount: number;
  pixSavingsCents: number;
}) {
  const [open, setOpen] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (itemsCount === 0) return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {}

    function trigger() {
      if (triggered.current) return;
      triggered.current = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setOpen(true);
    }

    // Desktop: mouse leaves viewport from the top edge
    function onMouseOut(e: MouseEvent) {
      if (triggered.current) return;
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    }

    // Mobile: fallback — idle for MOBILE_IDLE_MS
    let idleTimer: number | null = null;
    const touch = "ontouchstart" in window;
    function resetIdle() {
      if (!touch || triggered.current) return;
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(trigger, MOBILE_IDLE_MS);
    }

    document.addEventListener("mouseout", onMouseOut);
    if (touch) {
      ["scroll", "touchstart", "keydown"].forEach((ev) =>
        window.addEventListener(ev, resetIdle, { passive: true }),
      );
      resetIdle();
    }
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      if (touch) {
        ["scroll", "touchstart", "keydown"].forEach((ev) =>
          window.removeEventListener(ev, resetIdle),
        );
        if (idleTimer) window.clearTimeout(idleTimer);
      }
    };
  }, [itemsCount]);

  function scrollToSubmit() {
    setOpen(false);
    requestAnimationFrame(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        "form button[type='submit']",
      );
      btn?.scrollIntoView({ behavior: "smooth", block: "center" });
      btn?.focus();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="bg-gradient-to-br from-turf/[0.22] via-turf/[0.08] to-transparent p-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-turf/40 bg-turf/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-turf">
            <Bookmark className="size-3" aria-hidden />
            Carrinho salvo
          </div>
          <DialogTitle asChild>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05]">
              Tá quase lá —{" "}
              <span className="italic font-editorial font-normal">
                não desiste agora.
              </span>
            </h2>
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-foreground/75">
            Teus dados ficaram salvos aqui no navegador. Volta a hora que
            quiser — seu carrinho te espera.
          </DialogDescription>
        </div>

        <div className="space-y-4 border-t border-border/60 bg-card/30 p-6">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Seu pedido
              </p>
              <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                {formatBRL(totalCents)}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {itemsCount} {itemsCount === 1 ? "item" : "itens"}
              </p>
            </div>
            {pixSavingsCents > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-turf">
                  Economia PIX
                </p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums text-turf">
                  −{formatBRL(pixSavingsCents)}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-muted-foreground">
                  <Zap className="size-3" aria-hidden />
                  {PIX_DISCOUNT_PCT}% já aplicado
                </p>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs">
            <Timer className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">
              Tiragem controlada — quando esgotar, acabou. Finalize pra
              garantir teu tamanho.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={scrollToSubmit}
              size="lg"
              className="h-11 w-full rounded-full text-sm font-semibold"
            >
              Finalizar agora
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              size="sm"
              className="h-9 w-full rounded-full text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Fecho e volto depois
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
