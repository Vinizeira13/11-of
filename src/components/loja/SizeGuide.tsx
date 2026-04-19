"use client";

import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

const ROWS = [
  { size: "P", bust: "94-98", length: "70", shoulder: "45" },
  { size: "M", bust: "100-104", length: "72", shoulder: "47" },
  { size: "G", bust: "106-110", length: "74", shoulder: "49" },
  { size: "GG", bust: "112-116", length: "76", shoulder: "51" },
];

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition"
        >
          <Ruler className="size-3.5" />
          Guia de tamanhos
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
            Guia de tamanhos — Masculino
          </DialogTitle>
          <DialogDescription>
            Medidas em centímetros. Modelagem padrão Nike, ajustada ao corpo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-hidden rounded-xl border border-border/80">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tamanho</th>
                <th className="px-4 py-3 text-left font-semibold">Tórax</th>
                <th className="px-4 py-3 text-left font-semibold">Comprimento</th>
                <th className="px-4 py-3 text-left font-semibold">Ombro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {ROWS.map((r) => (
                <tr key={r.size}>
                  <td className="px-4 py-3 font-semibold">{r.size}</td>
                  <td className="px-4 py-3 tabular-nums">{r.bust} cm</td>
                  <td className="px-4 py-3 tabular-nums">{r.length} cm</td>
                  <td className="px-4 py-3 tabular-nums">{r.shoulder} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Na dúvida entre dois tamanhos? Vai no maior. Trocas são gratuitas em
          até 7 dias.
        </p>
      </DialogContent>
    </Dialog>
  );
}
