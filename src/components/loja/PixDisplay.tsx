"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { regeneratePixAction } from "@/app/_actions/pix";

gsap.registerPlugin(useGSAP);

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function PixDisplay({
  orderId,
  initialPayload,
  initialExpiresAt,
}: {
  orderId: string;
  initialPayload: string;
  initialExpiresAt: number;
}) {
  const [payload, setPayload] = useState(initialPayload);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      const qr = rootRef.current.querySelector<HTMLElement>("[data-pix-qr]");
      const stage = rootRef.current.querySelectorAll<HTMLElement>(
        "[data-pix-stage]",
      );

      if (qr) {
        gsap.fromTo(
          qr,
          { scale: 0.85, opacity: 0, filter: "blur(8px)" },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
          },
        );
      }

      if (stage.length > 0) {
        gsap.fromTo(
          stage,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.08,
            delay: 0.25,
          },
        );
      }
    },
    { scope: rootRef, dependencies: [payload] },
  );

  useGSAP(
    () => {
      if (!copied || !qrRef.current) return;
      gsap.fromTo(
        qrRef.current,
        { scale: 1 },
        {
          keyframes: [
            { scale: 1.04, duration: 0.12, ease: "power2.out" },
            { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.4)" },
          ],
        },
      );
    },
    { dependencies: [copied] },
  );

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const remaining = Math.max(0, expiresAt - now);
  const expired = remaining === 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Código PIX copiado.");
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie manualmente.");
    }
  }

  function handleRegenerate() {
    startTransition(async () => {
      const res = await regeneratePixAction(orderId);
      if (res.ok) {
        setPayload(res.pixCopyPaste);
        setExpiresAt(res.pixExpiresAt);
        toast.success("Novo PIX gerado.");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-6">
      <div
        ref={qrRef}
        data-pix-qr
        className="relative mx-auto w-full max-w-[280px] origin-center will-change-transform"
      >
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <QRCodeSVG
            value={payload}
            size={248}
            level="M"
            marginSize={0}
            // High contrast for reliable scanning under any lighting
            fgColor="#0a0a0a"
            bgColor="#ffffff"
            className="size-full"
          />
        </div>
        {expired && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/90 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-sm font-semibold">PIX expirado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gere um novo código abaixo.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        data-pix-stage
        className="flex items-center justify-center gap-2 text-sm"
      >
        <span className="text-muted-foreground">Expira em</span>
        <span
          className={
            remaining < 5 * 60 * 1000 && !expired
              ? "font-semibold tabular-nums text-destructive"
              : "font-semibold tabular-nums"
          }
        >
          {formatCountdown(remaining)}
        </span>
      </div>

      <div data-pix-stage className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          PIX Copia e Cola
        </p>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 truncate rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs">
            {payload}
          </code>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={expired}
            className="shrink-0"
          >
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      {expired && (
        <Button
          data-pix-stage
          type="button"
          variant="default"
          size="lg"
          disabled={isPending}
          onClick={handleRegenerate}
          className="h-12 w-full rounded-full"
        >
          <RefreshCw data-icon="inline-start" />
          {isPending ? "Gerando…" : "Gerar novo PIX"}
        </Button>
      )}
    </div>
  );
}
