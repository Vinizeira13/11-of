"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[11of] store error", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
        Fora de jogo
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Essa parte não carregou.
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Às vezes é só o estoque sincronizando. Tenta de novo ou volte pra
        home.
      </p>
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
        </Link>
      </div>
      {error.digest && (
        <p className="font-mono text-[10px] text-muted-foreground/70">
          digest {error.digest}
        </p>
      )}
    </section>
  );
}
