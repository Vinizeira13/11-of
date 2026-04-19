"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Line = {
  variantId: string;
  qty: number;
  productName: string;
  variantSize: string;
  image: string | null;
  lineTotalCents: number;
};

export function CheckoutSummary({
  lines,
  subtotalCents,
  shippingCents,
  discountCents,
  totalCents,
}: {
  lines: Line[];
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
}) {
  const [open, setOpen] = useState(false);
  const itemsCount = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <aside className="lg:order-last">
      {/* Mobile collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm lg:hidden"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <Tag className="size-4" />
          Resumo ({itemsCount} {itemsCount === 1 ? "item" : "itens"})
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
        <span className="font-display text-lg font-semibold tabular-nums">
          {formatBRL(totalCents)}
        </span>
      </button>

      <div
        className={cn(
          "mt-3 lg:mt-0 lg:block",
          open ? "block" : "hidden",
        )}
      >
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
              Resumo
            </h2>
            <Badge variant="secondary" className="rounded-full bg-turf/15 text-turf hover:bg-turf/15">
              PIX
            </Badge>
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-3">
                <div className="relative size-16 flex-none overflow-hidden rounded-md bg-muted">
                  {line.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.image}
                      alt={line.productName}
                      className="size-full object-cover"
                    />
                  )}
                  <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-turf text-[10px] font-semibold text-turf-foreground">
                    {line.qty}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <p className="text-sm font-medium leading-tight">
                    {line.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho {line.variantSize}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">
                  {formatBRL(line.lineTotalCents)}
                </p>
              </li>
            ))}
          </ul>

          <Separator className="my-5" />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatBRL(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd className="tabular-nums">
                {shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between text-turf">
              <dt className="font-semibold">Desconto PIX ({PIX_DISCOUNT_PCT}%)</dt>
              <dd className="font-semibold tabular-nums">
                −{formatBRL(discountCents)}
              </dd>
            </div>
          </dl>

          <Separator className="my-5" />

          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.12em]">
              Total
            </span>
            <span className="font-display text-2xl font-semibold tabular-nums">
              {formatBRL(totalCents)}
            </span>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Pagamento via PIX. QR gerado após confirmar.
          </p>

          <Button asChild variant="ghost" size="sm" className="mt-5 w-full">
            <Link href="/produtos">← Continuar comprando</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
