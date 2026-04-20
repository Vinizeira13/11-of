"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "11of:whatsapp:dismissed-at";
const NUDGE_DELAY = 18_000; // 18s after first load
const NUDGE_COOLDOWN = 1000 * 60 * 60 * 24; // reappear every 24h max

export function WhatsAppFloat({ phone }: { phone: string }) {
  const [nudgeOpen, setNudgeOpen] = useState(false);

  useEffect(() => {
    let dismissedAt = 0;
    try {
      dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    } catch {}
    if (Date.now() - dismissedAt < NUDGE_COOLDOWN) return;
    const t = setTimeout(() => setNudgeOpen(true), NUDGE_DELAY);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
    setNudgeOpen(false);
  }

  const waLink = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Oi 11 Of, tenho uma dúvida sobre uma camisa 👋",
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 print:hidden">
      {nudgeOpen && (
        <div
          className={cn(
            "relative max-w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-300",
            "rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-xl",
          )}
          role="dialog"
          aria-label="Atendimento pelo WhatsApp"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="absolute -right-2 -top-2 inline-flex size-6 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground hover:text-foreground transition"
          >
            <X className="size-3" />
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            11 Of · Suporte
          </p>
          <p className="mt-1.5 text-sm font-medium leading-snug">
            Tá com dúvida de tamanho ou frete?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Responde em minutos, sem robô.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => dismiss()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-turf px-3.5 py-1.5 text-xs font-semibold text-turf-foreground hover:bg-turf/90 transition"
          >
            <WhatsAppIcon className="size-3.5" />
            Chamar no WhatsApp
          </a>
        </div>
      )}

      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="group relative inline-flex size-14 items-center justify-center rounded-full bg-turf text-turf-foreground shadow-lg ring-1 ring-black/10 transition hover:scale-[1.03] hover:bg-turf/90"
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-turf/60 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
        />
        <WhatsAppIcon className="size-6" />
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.04 0C5.5 0 .17 5.33.17 11.88c0 2.1.55 4.14 1.6 5.94L0 24l6.35-1.66a11.86 11.86 0 0 0 5.69 1.45h.01c6.54 0 11.87-5.33 11.87-11.88a11.82 11.82 0 0 0-3.4-8.43zM12.05 21.8h-.01a9.85 9.85 0 0 1-5.03-1.38l-.36-.21-3.77.99 1-3.67-.23-.38a9.83 9.83 0 0 1-1.5-5.27C2.14 6.49 6.58 2.05 12.05 2.05a9.83 9.83 0 0 1 9.9 9.83c0 5.47-4.43 9.92-9.9 9.92zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17-.35.22-.65.07c-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5s.05-.37-.02-.52c-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48c0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.18 5.06 4.46.71.3 1.26.49 1.69.63.71.22 1.35.19 1.85.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}
