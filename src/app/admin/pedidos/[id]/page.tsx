import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createServiceClient } from "@/lib/supabase/service";
import { CARRIERS, carrierTrackUrl } from "@/lib/carriers";
import { formatBRL } from "@/lib/money";
import { isAdmin, updateDeliveryAction } from "@/app/_actions/delivery";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  short_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  payment_status: string;
  delivery_status: string;
  tracking_code: string | null;
  tracking_carrier: string | null;
  delivery_notes: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  paid_at: string | null;
  created_at: string;
  shipping_address: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
  };
  order_items: Array<{
    qty: number;
    unit_price_cents: number;
    product_name_snapshot: string;
    variant_size_snapshot: string;
  }>;
};

const STATUSES = [
  { value: "pending", label: "Aguardando pagamento" },
  { value: "preparing", label: "Preparando" },
  { value: "dispatched", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "returned", label: "Devolvido" },
  { value: "cancelled", label: "Cancelado" },
] as const;

export default async function AdminOrderPage(props: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { id } = await props.params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `id, short_code, customer_name, customer_email, customer_phone,
       total_cents, subtotal_cents, shipping_cents,
       payment_status, delivery_status, tracking_code, tracking_carrier,
       delivery_notes, dispatched_at, delivered_at, paid_at, created_at,
       shipping_address,
       order_items(qty, unit_price_cents, product_name_snapshot, variant_size_snapshot)`,
    )
    .eq("id", id)
    .maybeSingle();

  const order = data as Order | null;
  if (!order) notFound();

  async function submit(formData: FormData) {
    "use server";
    const res = await updateDeliveryAction(formData);
    if (!res.ok) {
      // fall through; the page will re-render fresh via revalidate
      console.error(res.error);
    }
    redirect(`/admin/pedidos/${id}`);
  }

  const trackUrl = carrierTrackUrl(order.tracking_carrier, order.tracking_code);
  const addr = order.shipping_address;
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Voltar à fila
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-6">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {order.short_code}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {order.customer_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.customer_email}
            {order.customer_phone && ` · ${order.customer_phone}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge
            className={cn(
              "rounded-full border-0",
              order.payment_status === "completed"
                ? "bg-turf/20 text-turf"
                : "bg-muted text-muted-foreground",
            )}
          >
            {order.payment_status === "completed" ? "Pago" : order.payment_status}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {formatBRL(order.total_cents)} ·{" "}
            {fmt.format(new Date(order.paid_at ?? order.created_at))}
          </p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* Update form */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Atualizar entrega
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Essas mudanças aparecem em tempo real na página pública do pedido
            pro cliente.
          </p>

          <form action={submit} className="mt-6 flex flex-col gap-5">
            <input type="hidden" name="orderId" value={order.id} />

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {STATUSES.map((s) => {
                  const active = order.delivery_status === s.value;
                  return (
                    <label
                      key={s.value}
                      className={cn(
                        "cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition",
                        active
                          ? "border-turf bg-turf/10 text-turf"
                          : "border-border/70 hover:border-foreground/50",
                      )}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={s.value}
                        defaultChecked={active}
                        className="sr-only"
                        required
                      />
                      {active && <Check className="mr-1.5 inline size-3.5" />}
                      {s.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
              <div>
                <label
                  htmlFor="trackingCode"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Código de rastreio
                </label>
                <Input
                  id="trackingCode"
                  name="trackingCode"
                  placeholder="AA123456789BR"
                  defaultValue={order.tracking_code ?? ""}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <label
                  htmlFor="trackingCarrier"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Transportadora
                </label>
                <select
                  id="trackingCarrier"
                  name="trackingCarrier"
                  defaultValue={order.tracking_carrier ?? ""}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm"
                >
                  <option value="">—</option>
                  {Object.entries(CARRIERS).map(([id, c]) => (
                    <option key={id} value={id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {trackUrl && (
              <Link
                href={trackUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-turf hover:underline"
              >
                Abrir rastreio atual
                <ExternalLink className="size-3" />
              </Link>
            )}

            <div>
              <label
                htmlFor="notes"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Observações (pro cliente ver)
              </label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                maxLength={500}
                placeholder="Ex: Saiu hoje 14h no Correios da Paulista."
                defaultValue={order.delivery_notes ?? ""}
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-full sm:w-auto sm:self-start sm:px-8"
            >
              Salvar atualização
            </Button>
          </form>
        </section>

        {/* Summary */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card/30 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Endereço de entrega
            </h3>
            <div className="mt-3 space-y-0.5 text-sm">
              <p className="font-medium">
                {addr.logradouro}, {addr.numero}
                {addr.complemento ? ` — ${addr.complemento}` : ""}
              </p>
              <p className="text-muted-foreground">
                {addr.bairro} · {addr.cidade}/{addr.uf}
              </p>
              <p className="text-muted-foreground">CEP {addr.cep}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/30 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Itens ({order.order_items.length})
            </h3>
            <ul className="mt-3 space-y-2">
              {order.order_items.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    {item.qty}× {item.product_name_snapshot}
                    <span className="text-muted-foreground"> · {item.variant_size_snapshot}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatBRL(item.qty * item.unit_price_cents)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <dl className="space-y-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatBRL(order.subtotal_cents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frete</dt>
                <dd className="tabular-nums">{formatBRL(order.shipping_cents)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-sm font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatBRL(order.total_cents)}</dd>
              </div>
            </dl>
          </div>

          <Link
            href={`/pedido/${order.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Ver página pública do pedido
            <ExternalLink className="size-3" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
