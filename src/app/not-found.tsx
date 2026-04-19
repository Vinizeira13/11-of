import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/loja/BrandMark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-background px-6 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.82_0.22_140/0.12),transparent_65%)]"
      />

      <BrandMark size="md" />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
          Erro 404 · Fora de campo
        </p>
        <h1 className="mt-3 font-display text-[clamp(4rem,14vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]">
          404
        </h1>
        <p className="mt-1 font-editorial italic text-2xl text-muted-foreground">
          Essa página foi driblada.
        </p>
      </div>

      <p className="max-w-md text-sm text-foreground/75">
        Você pode ter errado a camisa ou a gente tirou do ar pra atualizar.
        Volte pra home ou escolha uma seleção abaixo.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-turf px-6 py-3 text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
        >
          Voltar pra home
        </Link>
        <Link
          href="/produtos"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 px-6 py-3 text-sm font-medium hover:border-foreground transition"
        >
          Ver todas as seleções
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
