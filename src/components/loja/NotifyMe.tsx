"use client";

import { useState, useTransition } from "react";
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
import { joinWaitlistAction } from "@/app/_actions/notify";

export function NotifyMe({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("E-mail inválido.");
      return;
    }
    startTransition(async () => {
      const res = await joinWaitlistAction(productId, email);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDone(true);
      toast.success(
        res.duplicate ? "Você já estava na lista." : "Você entrou na lista.",
        { description: "Avisamos assim que essa camisa voltar." },
      );
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
            Deixe o e-mail e você é avisado assim que{" "}
            <span className="font-medium text-foreground">{productName}</span>{" "}
            voltar pro estoque. A gente só manda esse aviso — sem newsletter
            extra.
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
              Você recebe um email assim que a reposição chegar.
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
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-full bg-turf text-sm font-semibold text-turf-foreground hover:bg-turf/90 transition disabled:opacity-60"
            >
              {isPending ? "Entrando na lista…" : "Me avise"}
            </button>
            <p className="text-[11px] text-muted-foreground">
              Usamos o email apenas pra esse aviso. Nada de spam.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
