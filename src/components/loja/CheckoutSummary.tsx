"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Minus, Plus, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FreeShippingBar } from "./FreeShippingBar";
import {
  removeFromCartAction,
  updateCartQtyAction,
} from "@/app/_actions/cart";
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
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const itemsCount = lines.reduce((s, l) => s + l.qty, 0);

  function changeQty(variantId: string, nextQty: number) {
    setPendingId(variantId);
    startTransition(async () => {
      const res = await updateCartQtyAction(variantId, nextQty);
      setPendingId(null);
      if (res.ok) router.refresh();
      else toast.error(res.error ?? "Não foi possível atualizar.");
    });
  }

  function removeLine(variantId: string) {
    setPendingId(variantId);
    startTransition(async () => {
      const res = await removeFromCartAction(variantId);
      setPendingId(null);
      if (res.ok) {
        toast.success("Item removido");
        router.refresh();
      } else {
        toast.error(res.error ?? "Não foi possível remover.");
      }
    });
  }

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

          <div className="mt-4">
            <FreeShippingBar subtotalCents={subtotalCents} />
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {lines.map((line) => {
              const isPending = pendingId === line.variantId;
              return (
                <li
                  key={line.variantId}
                  className={cn(
                    "flex gap-3 transition-opacity",
                    isPending && "opacity-60",
                  )}
                >
                  <div className="relative size-16 flex-none overflow-hidden rounded-md bg-muted">
                    {line.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.image}
                        alt={line.productName}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {line.productName}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLine(line.variantId)}
                        disabled={isPending}
                        aria-label={`Remover ${line.productName}`}
                        className="-mr-1 shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-card hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tamanho {line.variantSize}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full border border-border/70 bg-card/60">
                        <button
                          type="button"
                          onClick={() =>
                            changeQty(line.variantId, Math.max(0, line.qty - 1))
                          }
                          disabled={isPending}
                          aria-label="Reduzir quantidade"
                          className="inline-flex size-7 items-center justify-center rounded-full transition hover:bg-foreground/10 disabled:opacity-50"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-6 text-center text-xs font-semibold tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQty(line.variantId, line.qty + 1)}
                          disabled={isPending}
                          aria-label="Aumentar quantidade"
                          className="inline-flex size-7 items-center justify-center rounded-full transition hover:bg-foreground/10 disabled:opacity-50"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatBRL(line.lineTotalCents)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
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
