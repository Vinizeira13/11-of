import { BrandMark } from "@/components/loja/BrandMark";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <BrandMark size="lg" />
        <div className="relative h-0.5 w-24 overflow-hidden rounded-full bg-border/40">
          <div className="absolute inset-y-0 left-0 w-1/3 animate-[shimmer_1.2s_linear_infinite] bg-turf" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Carregando coleção
        </p>
      </div>
    </div>
  );
}
