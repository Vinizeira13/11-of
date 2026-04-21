import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, ChevronRight, Clock, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createServiceClient } from "@/lib/supabase/service";
import { formatBRL } from "@/lib/money";
import { isAdmin } from "@/app/_actions/delivery";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  short_code: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  payment_status: string;
  delivery_status: string;
  tracking_code: string | null;
  created_at: string;
  paid_at: string | null;
  dispatched_at: string | null;
};

const STATUS_PILLS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Aguardando pagamento", cls: "bg-muted text-muted-foreground" },
  preparing: { label: "Preparando", cls: "bg-blue-500/15 text-blue-400" },
  dispatched: { label: "Enviado", cls: "bg-amber-500/15 text-amber-400" },
  delivered: { label: "Entregue", cls: "bg-turf/20 text-turf" },
  returned: { label: "Devolvido", cls: "bg-destructive/20 text-destructive" },
  cancelled: { label: "Cancelado", cls: "bg-destructive/20 text-destructive" },
  pay_cancelled: { label: "Pagamento cancelado", cls: "bg-destructive/20 text-destructive" },
  pay_refunded: { label: "Reembolsado", cls: "bg-destructive/20 text-destructive" },
};

function pillKey(o: Row): string {
  if (o.payment_status === "cancelled") return "pay_cancelled";
  if (o.payment_status === "refunded") return "pay_refunded";
  return o.delivery_status;
}

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminPedidosPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login?next=/admin/pedidos");
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `id, short_code, customer_name, customer_email, total_cents,
       payment_status, delivery_status, tracking_code,
       created_at, paid_at, dispatched_at`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (data as Row[]) ?? [];

  // Priority-chain bucketing. Each order lands in exactly one bucket —
  // order of checks matters. This guarantees no paid order disappears just
  // because its delivery_status is still "pending" (webhook race) or because
  // it got manually cancelled.
  const archived: Row[] = [];
  const done: Row[] = [];
  const actionable: Row[] = [];
  const waiting: Row[] = [];

  for (const o of orders) {
    if (
      o.payment_status === "cancelled" ||
      o.payment_status === "refunded" ||
      o.delivery_status === "cancelled"
    ) {
      archived.push(o);
    } else if (
      o.delivery_status === "delivered" ||
      o.delivery_status === "returned"
    ) {
      done.push(o);
    } else if (o.payment_status === "completed") {
      actionable.push(o);
    } else {
      waiting.push(o);
    }
  }

  // Actionable queue is FIFO — oldest paid-but-not-shipped shows first so
  // we don't accidentally favor fresh orders over ones about to breach SLA.
  // Other sections stay DESC (newest first) — that's what ops wants while
  // browsing history.
  actionable.reverse();

  return (
    <div>
      <header className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
            Pedidos
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Fila de entrega
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} pedidos nos últimos 100 · {actionable.length}{" "}
            precisando ação
          </p>
        </div>
      </header>

      <Section
        title="Precisa ação agora"
        icon={Package}
        rows={actionable}
        empty="Nada aqui — todos os pedidos pagos já foram despachados."
      />
      <Section
        title="Aguardando pagamento"
        icon={Clock}
        rows={waiting}
        empty="Sem pedidos aguardando PIX."
        muted
      />
      <Section
        title="Concluídos"
        icon={Truck}
        rows={done}
        empty="Nenhum entregue/devolvido ainda."
        muted
      />
      <Section
        title="Arquivados"
        icon={Archive}
        rows={archived}
        empty="Nenhum pedido cancelado ou estornado."
        muted
      />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  rows,
  empty,
  muted = false,
}: {
  title: string;
  icon: typeof Package;
  rows: Row[];
  empty: string;
  muted?: boolean;
}) {
  return (
    <section className={cn("mb-10", muted && "opacity-80")}>
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
        <Icon className="size-4 text-turf" aria-hidden />
        {title}
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {rows.length}
        </span>
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-border/60 bg-card/30 px-4 py-6 text-center text-xs text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/30">
          {rows.map((o) => {
            const pill = STATUS_PILLS[pillKey(o)] ?? STATUS_PILLS.pending;
            return (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition hover:bg-card/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <p className="font-mono text-xs font-semibold">
                        {o.short_code}
                      </p>
                      <Badge className={cn("rounded-full border-0", pill.cls)}>
                        {pill.label}
                      </Badge>
                      {o.tracking_code && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {o.tracking_code}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm">
                      {o.customer_name}{" "}
                      <span className="text-muted-foreground">
                        · {o.customer_email}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums">
                      {formatBRL(o.total_cents)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {fmt.format(new Date(o.paid_at ?? o.created_at))}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
