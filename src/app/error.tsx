"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/loja/BrandMark";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[11of] global error", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground">
        <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-6 text-center">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.82_0.22_140/0.12),transparent_65%)]"
          />
          <BrandMark size="md" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
              Fora de jogo
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.9] tracking-tight md:text-7xl">
              Alguma coisa travou.
            </h1>
            <p className="mt-3 font-editorial italic text-lg text-muted-foreground">
              A gente já foi notificado.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-turf px-6 py-3 text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
            >
              <RefreshCw className="size-4" />
              Tentar de novo
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 px-6 py-3 text-sm font-medium hover:border-foreground transition"
            >
              Voltar pra home
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {error.digest && (
            <p className="font-mono text-[11px] text-muted-foreground/70">
              digest {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
