import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PixDisplay } from "@/components/loja/PixDisplay";
import { createServiceClient } from "@/lib/supabase/service";
import { formatBRL } from "@/lib/money";
import { SUPPORT_EMAIL } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

type OrderAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

type OrderRow = {
  id: string;
  short_code: string;
  customer_email: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  payment_status: string;
  pix_copy_paste: string | null;
  pix_expires_at: string | null;
  shipping_address: OrderAddress;
  order_items: {
    variant_id: string;
    qty: number;
    unit_price_cents: number;
    product_name_snapshot: string;
    variant_size_snapshot: string;
    image_snapshot: string | null;
  }[];
};

async function loadOrder(id: string): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `id, short_code, customer_email, subtotal_cents, shipping_cents, total_cents,
       payment_status, pix_copy_paste, pix_expires_at, shipping_address,
       order_items(variant_id, qty, unit_price_cents, product_name_snapshot, variant_size_snapshot, image_snapshot)`,
    )
    .eq("id", id)
    .maybeSingle();
  return (data as OrderRow | null) ?? null;
}

export default async function OrderPage(props: PageProps<"/pedido/[id]">) {
  const { id } = await props.params;
  const order = await loadOrder(id);
  if (!order) notFound();

  const isPaid = order.payment_status === "completed";
  const pixExpiresAtMs = order.pix_expires_at
    ? new Date(order.pix_expires_at).getTime()
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 md:pt-12">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Pedido {order.short_code}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          {isPaid ? "Pagamento confirmado!" : "Agora é só pagar o PIX."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Assim que confirmarmos o pagamento, você recebe atualizações em{" "}
          <span className="font-medium text-foreground">
            {order.customer_email}
          </span>
          .
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <section className="rounded-xl border border-border/60 p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Pagamento PIX
            </h2>
            <Badge
              variant={isPaid ? "default" : "secondary"}
              className="rounded-full"
            >
              {isPaid ? (
                <>
                  <CheckCircle2 data-icon="inline-start" />
                  Pago
                </>
              ) : (
                "Aguardando pagamento"
              )}
            </Badge>
          </div>

          {order.pix_copy_paste ? (
            <PixDisplay
              orderId={order.id}
              initialPayload={order.pix_copy_paste}
              initialExpiresAt={pixExpiresAtMs}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              PIX indisponível. Gere um novo abaixo.
            </p>
          )}

          <Separator className="my-8" />

          <ol className="space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="mr-2 font-semibold text-foreground">1.</span>
              Abra o app do seu banco e escolha pagar via PIX.
            </li>
            <li>
              <span className="mr-2 font-semibold text-foreground">2.</span>
              Escaneie o QR ou cole o código no campo PIX Copia e Cola.
            </li>
            <li>
              <span className="mr-2 font-semibold text-foreground">3.</span>
              Confirme o valor de{" "}
              <span className="font-medium text-foreground">
                {formatBRL(order.total_cents)}
              </span>
              .
            </li>
          </ol>
        </section>

        <aside className="lg:order-last">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Resumo
            </h2>

            <ul className="mt-5 flex flex-col gap-4">
              {order.order_items.map((item) => (
                <li key={item.variant_id} className="flex gap-3">
                  {item.image_snapshot && (
                    <div className="relative size-16 flex-none overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_snapshot}
                        alt={item.product_name_snapshot}
                        className="size-full object-cover"
                      />
                      <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                        {item.qty}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium leading-tight">
                      {item.product_name_snapshot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tamanho {item.variant_size_snapshot}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatBRL(item.unit_price_cents * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            <Separator className="my-5" />

            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">
                  {formatBRL(order.subtotal_cents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frete</dt>
                <dd className="tabular-nums">
                  {order.shipping_cents === 0
                    ? "Grátis"
                    : formatBRL(order.shipping_cents)}
                </dd>
              </div>
            </dl>

            <Separator className="my-5" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-xl font-semibold tabular-nums">
                {formatBRL(order.total_cents)}
              </span>
            </div>

            <Separator className="my-5" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Entrega</p>
              <p>
                {order.shipping_address.logradouro},{" "}
                {order.shipping_address.numero}
                {order.shipping_address.complemento
                  ? ` – ${order.shipping_address.complemento}`
                  : ""}
              </p>
              <p>
                {order.shipping_address.bairro} — {order.shipping_address.cidade}/
                {order.shipping_address.uf}
              </p>
              <p>CEP {order.shipping_address.cep}</p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Dúvidas? Escreva pra{" "}
            <Link
              href={`mailto:${SUPPORT_EMAIL}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {SUPPORT_EMAIL}
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
