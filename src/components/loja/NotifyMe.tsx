"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function NotifyMe({
  productName,
  productSlug,
}: {
  productName: string;
  productSlug: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("E-mail inválido.");
      return;
    }
    try {
      window.localStorage.setItem(
        `11of:notify:${productSlug}`,
        JSON.stringify({ email, at: Date.now() }),
      );
    } catch {}
    setDone(true);
    toast.success("Você está na lista.", {
      description: "A gente avisa assim que essa camisa voltar.",
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-card/60 text-base font-semibold transition hover:border-foreground"
        >
          <BellRing className="size-4" />
          Avise-me quando voltar
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
            Avisar quando voltar
          </DialogTitle>
          <DialogDescription>
            Deixe o e-mail e você é o primeiro a saber quando{" "}
            <span className="font-medium text-foreground">{productName}</span>{" "}
            voltar pro estoque.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-turf/40 bg-turf/10 p-6 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-turf text-turf-foreground">
              <Check className="size-5" />
            </span>
            <p className="font-display text-xl font-semibold">
              Inscrito com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              A gente manda um e-mail assim que tiver novidade — sem spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-12 w-full rounded-lg border border-border/70 bg-card/40 px-4 text-sm outline-none focus:border-foreground"
            />
            <button
              type="submit"
              className="h-12 w-full rounded-full bg-turf text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition"
            >
              Me avise
            </button>
            <p className="text-[11px] text-muted-foreground">
              Sem spam. Você pode cancelar quando quiser.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
