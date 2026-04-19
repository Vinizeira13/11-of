"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    q: "A camisa é oficial?",
    a: "Sim. Todas as peças são 100% oficiais Nike, com tags de autenticidade e embalagem original. Trabalhamos apenas com distribuidores autorizados.",
  },
  {
    q: "Como escolher o tamanho?",
    a: "A modelagem é masculina padrão Nike. Se você usa M em camiseta normal, provavelmente usa M aqui. Consulte a tabela de tamanhos ao lado da seleção de tamanho — trocas gratuitas em até 7 dias caso erre.",
  },
  {
    q: "Quanto tempo leva para chegar?",
    a: "Despachamos em até 24h úteis (pedidos antes das 15h saem no mesmo dia). O prazo dos Correios / Jadlog é mostrado no checkout a partir do seu CEP. Capitais recebem em 2-4 dias úteis em média.",
  },
  {
    q: "Posso personalizar com nome e número?",
    a: "Em breve. A personalização estará disponível a partir de maio/2026. Por ora trabalhamos apenas com a versão oficial sem patch de nome.",
  },
  {
    q: "Como funciona o desconto do PIX?",
    a: "O desconto de 15% é aplicado automaticamente no checkout quando você escolhe PIX. O QR code é gerado na hora — basta pagar pelo app do seu banco e seu pedido é aprovado em poucos minutos.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "No momento trabalhamos exclusivamente com PIX — que dá 15% OFF direto. Cartão de crédito e boleto serão adicionados em breve.",
  },
];

export function ProductFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-[1440px] border-t border-border/60 px-6 py-16 md:py-20">
      <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Perguntas frequentes
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            Antes de comprar.
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Se ficou alguma dúvida, chama no WhatsApp que a gente responde em minutos.
          </p>
        </div>

        <ul className="divide-y divide-border/60">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium md:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full border border-border/80 transition",
                      isOpen && "rotate-180 border-foreground bg-foreground text-background",
                    )}
                  >
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
                <div
                  className={cn(
                    "grid grid-rows-[0fr] transition-all duration-300 ease-out",
                    isOpen && "grid-rows-[1fr] pb-5",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
