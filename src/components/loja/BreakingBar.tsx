import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HREF = "/produtos/camisa-brasil-home-2026";

export function BreakingBar() {
  return (
    <Link
      href={HREF}
      className="group relative block overflow-hidden bg-destructive text-white"
      aria-label="Neymar convocado para a Copa 2026 — ver a Camisa Brasil"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background:linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.22)_50%,transparent_60%)] [background-size:200%_100%] [animation:shimmer_3.6s_ease-in-out_infinite] motion-reduce:hidden"
      />
      <div className="relative mx-auto flex max-w-[1440px] items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] sm:gap-3 sm:text-xs">
        <span className="relative flex size-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        <span aria-hidden className="text-base leading-none">
          🚨
        </span>
        <span className="truncate">
          Neymar convocado
          <span className="mx-2 opacity-60">·</span>
          Camisa Brasil 2026
        </span>
        <span className="hidden items-center gap-1 underline underline-offset-4 sm:inline-flex">
          Ver camisa
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
