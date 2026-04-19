"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  // SSR renders with the relative path; the effect upgrades to the absolute
  // URL once we're on the client (avoids hydration mismatch on anchors).
  const [shareUrl, setShareUrl] = useState(url);
  useEffect(() => {
    setShareUrl(`${window.location.origin}${url}`);
  }, [url]);

  function handleCopy() {
    if (!navigator.clipboard) {
      toast.error("Seu navegador não suporta cópia automática.");
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleNative() {
    if (navigator.share) {
      navigator
        .share({ title, url: shareUrl })
        .catch(() => {
          /* user cancelled */
        });
    } else {
      handleCopy();
    }
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Compartilhar
      </span>
      <div className="flex items-center gap-1">
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartilhar no WhatsApp"
          className="inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-foreground/80 hover:border-foreground hover:text-foreground transition"
        >
          <WhatsAppIcon className="size-3.5" />
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartilhar no X"
          className="inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-foreground/80 hover:border-foreground hover:text-foreground transition"
        >
          <XIcon className="size-3" />
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar link"
          className="inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-foreground/80 hover:border-foreground hover:text-foreground transition"
        >
          {copied ? <Check className="size-3.5 text-turf" /> : <Copy className="size-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleNative}
          aria-label="Compartilhar"
          className="inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-foreground/80 hover:border-foreground hover:text-foreground transition md:hidden"
        >
          <Share2 className="size-3.5" />
        </button>
      </div>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.94l-5.43-7.04L4.33 22H1.073l8.02-9.17L1 2h7.09l4.9 6.48L18.245 2zm-1.21 18h1.83L6.05 4H4.1l12.934 16z" />
    </svg>
  );
}
