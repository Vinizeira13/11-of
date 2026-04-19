"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    icon: Shirt,
    title: "Tecnologia & materiais",
    body: (
      <ul className="space-y-2">
        <li>• Tecnologia Nike Dri-FIT ADV (absorve e dispersa suor)</li>
        <li>• 100% poliéster reciclado certificado</li>
        <li>• Recortes ergonômicos e mangas raglan</li>
        <li>• Escudo da seleção bordado em alto-relevo</li>
        <li>• Hem curvo e modelagem masculina padrão Nike</li>
      </ul>
    ),
  },
  {
    icon: Sparkles,
    title: "Cuidados",
    body: (
      <ul className="space-y-2">
        <li>• Lavar a máquina em ciclo delicado, água fria</li>
        <li>• Virar do avesso antes de lavar</li>
        <li>• Não usar alvejante, não passar ferro no escudo</li>
        <li>• Secar à sombra — sem secadora</li>
      </ul>
    ),
  },
  {
    icon: Truck,
    title: "Envio & prazos",
    body: (
      <ul className="space-y-2">
        <li>• Despacho em 24h úteis (pedidos antes das 15h saem no mesmo dia)</li>
        <li>• Correios SEDEX e Jadlog Express</li>
        <li>• Frete grátis a partir de R$ 299</li>
        <li>• Capitais: 2-4 dias úteis · Interior: 3-7 dias úteis</li>
        <li>• Rastreio enviado por email assim que sair do CD</li>
      </ul>
    ),
  },
  {
    icon: RefreshCw,
    title: "Trocas & devoluções",
    body: (
      <ul className="space-y-2">
        <li>• Troca grátis em até 7 dias após o recebimento</li>
        <li>• Peça precisa estar com tag, embalagem e sem uso</li>
        <li>• Reembolso integral em até 5 dias úteis após análise</li>
        <li>• Trocas de tamanho têm prioridade — despachamos na hora</li>
      </ul>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Autenticidade garantida",
    body: (
      <ul className="space-y-2">
        <li>• 100% camisa oficial Nike</li>
        <li>• Tag holográfica Nike com número de série</li>
        <li>• Embalagem original e nota fiscal inclusas</li>
        <li>• Todas as peças vêm direto de distribuidor autorizado</li>
        <li>• Garantia de autenticidade 11 Of — ou seu dinheiro de volta</li>
      </ul>
    ),
  },
];

export function ProductSpecs() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/30">
      <ul className="divide-y divide-border/60">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-lg border border-border/70 text-turf",
                    isOpen && "border-turf bg-turf/10",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <span className="flex-1 text-sm font-semibold">{item.title}</span>
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full border border-border/70 transition",
                    isOpen && "rotate-180 border-foreground bg-foreground text-background",
                  )}
                >
                  {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                </span>
              </button>
              <div
                className={cn(
                  "grid grid-rows-[0fr] transition-all duration-300 ease-out",
                  isOpen && "grid-rows-[1fr] pb-4",
                )}
              >
                <div className="overflow-hidden px-4">
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
