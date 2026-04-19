"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("ok");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-14">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            11 Of Club
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold leading-[1.05] tracking-tight md:text-4xl">
            Drops antes de <span className="italic font-editorial text-turf">todo mundo</span>.
          </h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Entre na lista e receba R$ 30 OFF na primeira compra. Acesso
            prioritário a cada lançamento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <label className="sr-only" htmlFor="nl-email">
            Seu e-mail
          </label>
          <div
            className={cn(
              "flex w-full items-center gap-2 rounded-full border border-border/80 bg-card/40 pl-5 pr-1.5 py-1.5 backdrop-blur transition",
              "focus-within:border-foreground",
            )}
          >
            <input
              id="nl-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-turf px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-turf-foreground transition hover:bg-turf/90"
            >
              {status === "ok" ? (
                <>
                  <CheckCircle2 className="size-3.5" /> Pronto!
                </>
              ) : (
                <>
                  Entrar na lista <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
          <p className="pl-2 text-[11px] text-muted-foreground">
            Sem spam. Cancele quando quiser.
          </p>
        </form>
      </div>
    </div>
  );
}
