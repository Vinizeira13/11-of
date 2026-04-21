import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/loja/BrandMark";
import { CheckoutSteps } from "@/components/loja/CheckoutSteps";
import { PixDisplay } from "@/components/loja/PixDisplay";
import { DeliveryTimeline } from "@/components/loja/DeliveryTimeline";
import {
  PostPurchaseUpsell,
  type UpsellProduct,
} from "@/components/loja/PostPurchaseUpsell";
import { getPublishedProducts } from "@/lib/catalog";
import { splitImages } from "@/lib/images";
import { createServiceClient } from "@/lib/supabase/service";
import { formatBRL } from "@/lib/money";
import { SUPPORT_EMAIL } from "@/lib/brand";
import {
  teamBySlug,
  homeSlug as teamHomeSlug,
  awaySlug as teamAwaySlug,
  kitFromSlug,
} from "@/lib/teams";

export const dynamic = "force-dynamic";

type OrderAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

type OrderItemRow = {
  variant_id: string;
  qty: number;
  unit_price_cents: number;
  product_name_snapshot: string;
  variant_size_snapshot: string;
  image_snapshot: string | null;
  product_id?: string;
  product?: { slug: string } | null;
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
  paid_at: string | null;
  created_at: string;
  shipping_address: OrderAddress;
  order_items: OrderItemRow[];
  delivery_status:
    | "pending"
    | "preparing"
    | "dispatched"
    | "delivered"
    | "returned"
    | "cancelled";
  tracking_code: string | null;
  tracking_carrier: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  delivery_notes: string | null;
};

type UpsellCoupon = { code: string; discount_pct: number; expires_at: string };

async function loadOrder(id: string): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `id, short_code, customer_email, subtotal_cents, shipping_cents, total_cents,
       payment_status, pix_copy_paste, pix_expires_at, paid_at, created_at,
       shipping_address,
       delivery_status, tracking_code, tracking_carrier, dispatched_at,
       delivered_at, delivery_notes,
       order_items(variant_id, qty, unit_price_cents, product_name_snapshot, variant_size_snapshot, image_snapshot, product_id, product:product_id(slug))`,
    )
    .eq("id", id)
    .maybeSingle();
  return (data as OrderRow | null) ?? null;
}

async function loadUpsellCoupon(): Promise<UpsellCoupon | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("coupons")
    .select("code, discount_pct, expires_at")
    .eq("code", "PROXIMA10")
    .maybeSingle();
  return (data as UpsellCoupon | null) ?? null;
}

export async function generateMetadata(
  props: PageProps<"/pedido/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("short_code")
    .eq("id", id)
    .maybeSingle();
  const code = (data as { short_code: string } | null)?.short_code;
  return {
    title: code ? `Pedido ${code}` : "Pedido",
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage(props: PageProps<"/pedido/[id]">) {
  const { id } = await props.params;
  const order = await loadOrder(id);
  if (!order) notFound();

  const isPaid = order.payment_status === "completed";
  const isFailed =
    order.payment_status === "cancelled" ||
    order.payment_status === "refunded" ||
    order.payment_status === "failed";
  const isAwaitingPix = !isPaid && !isFailed;

  const pixExpiresAtMs = order.pix_expires_at
    ? new Date(order.pix_expires_at).getTime()
    : 0;

  // -------- Post-purchase upsell: siblings of ordered items, then fillers --------
  // Only when paid — don't hawk more products to someone who failed to pay.
  const [coupon, allProducts] = isPaid
    ? await Promise.all([loadUpsellCoupon(), getPublishedProducts()])
    : [null, [] as Awaited<ReturnType<typeof getPublishedProducts>>];

  const orderedSlugs = new Set(
    order.order_items.map((i) => i.product?.slug).filter(Boolean) as string[],
  );
  const orderedProductIds = new Set(
    order.order_items.map((i) => i.product_id).filter(Boolean) as string[],
  );

  const upsellPicks: (typeof allProducts)[number][] = [];
  const seen = new Set<string>();

  // Pass 1: sibling kits (Home ↔ Away) of purchased teams
  if (isPaid) {
    for (const item of order.order_items) {
      const slug = item.product?.slug;
      if (!slug) continue;
      const team = teamBySlug(slug);
      if (!team) continue;
      const siblingSlug =
        kitFromSlug(slug) === "home" ? teamAwaySlug(team) : teamHomeSlug(team);
      if (orderedSlugs.has(siblingSlug)) continue;
      const p = allProducts.find((x) => x.slug === siblingSlug);
      if (p && !seen.has(p.id)) {
        upsellPicks.push(p);
        seen.add(p.id);
      }
    }

    // Pass 2: top-sorted fillers
    for (const p of allProducts) {
      if (upsellPicks.length >= 4) break;
      if (orderedProductIds.has(p.id) || seen.has(p.id)) continue;
      upsellPicks.push(p);
      seen.add(p.id);
    }
  }

  const upsellProducts: UpsellProduct[] = upsellPicks.slice(0, 4).map((p) => {
    const { product: packs } = splitImages(p.images);
    const team = teamBySlug(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      shortName: team?.shortName,
      flag: team?.flag,
      priceCents: p.priceCents,
      imageUrl: packs[0] ?? p.images[0] ?? "",
    };
  });

  // Stepper: awaiting PIX = step 3 active; paid = all done; failed = step 3
  // stays active (they can still pay again by generating new PIX — but if
  // payment_status is cancelled/refunded terminal, we won't show regenerate).
  const stepperProps = isPaid
    ? { activeStep: 3 as const, allDone: true }
    : { activeStep: 3 as const, allDone: false };

  // Copy variants — H1 + intro adapt to payment state
  const { label, heading, intro } = isPaid
    ? {
        label: "Pagamento confirmado",
        heading: "Pagamento confirmado.",
        intro: (
          <>
            Recebemos teu PIX. As atualizações seguem pra{" "}
            <span className="font-medium text-foreground">
              {order.customer_email}
            </span>
            .
          </>
        ),
      }
    : isFailed
      ? {
          label: "Pagamento não concluído",
          heading:
            order.payment_status === "refunded"
              ? "Pagamento reembolsado."
              : "Pagamento não concluído.",
          intro:
            order.payment_status === "refunded" ? (
              <>
                Seu reembolso foi processado. Qualquer dúvida, escreva pra{" "}
                <Link
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </Link>
                .
              </>
            ) : (
              <>
                Esse PIX foi cancelado. Pra tentar de novo, refaça o pedido —
                ou fala com a gente em{" "}
                <Link
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </Link>
                .
              </>
            ),
        }
      : {
          label: "Passo 3 de 3",
          heading: "Agora é só pagar o PIX.",
          intro: (
            <>
              Assim que confirmarmos o pagamento, você recebe atualizações em{" "}
              <span className="font-medium text-foreground">
                {order.customer_email}
              </span>
              .
            </>
          ),
        };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link href="/" aria-label="11 Of home">
            <BrandMark size="md" />
          </Link>
          <CheckoutSteps {...stepperProps} />
          <Link
            href="/produtos"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground transition sm:block"
          >
            ← Voltar pra loja
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p
              className={
                isFailed
                  ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-destructive"
                  : "text-[10px] font-semibold uppercase tracking-[0.22em] text-turf"
              }
            >
              {label}
            </p>
            <span className="text-muted-foreground/60" aria-hidden>
              ·
            </span>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {order.short_code}
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <section className="space-y-8">
            <div className="rounded-xl border border-border/60 p-6 md:p-8">
              <DeliveryTimeline
                createdAt={order.created_at}
                paidAt={order.paid_at}
                deliveryStatus={order.delivery_status}
                dispatchedAt={order.dispatched_at}
                deliveredAt={order.delivered_at}
                trackingCode={order.tracking_code}
                trackingCarrier={order.tracking_carrier}
                deliveryNotes={order.delivery_notes}
              />
            </div>

            {isAwaitingPix && (
              <div className="rounded-xl border border-border/60 p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Pagamento PIX
                  </h2>
                  <Badge variant="secondary" className="rounded-full">
                    Aguardando pagamento
                  </Badge>
                </div>

                <PixDisplay
                  orderId={order.id}
                  initialPayload={order.pix_copy_paste}
                  initialExpiresAt={pixExpiresAtMs}
                />

                <Separator className="my-8" />

                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <span className="mr-2 font-semibold text-foreground">
                      1.
                    </span>
                    Abra o app do seu banco e escolha pagar via PIX.
                  </li>
                  <li>
                    <span className="mr-2 font-semibold text-foreground">
                      2.
                    </span>
                    Escaneie o QR ou cole o código no campo PIX Copia e Cola.
                  </li>
                  <li>
                    <span className="mr-2 font-semibold text-foreground">
                      3.
                    </span>
                    Confirme o valor de{" "}
                    <span className="font-medium text-foreground">
                      {formatBRL(order.total_cents)}
                    </span>
                    .
                  </li>
                </ol>
              </div>
            )}
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
                  {order.shipping_address.bairro} —{" "}
                  {order.shipping_address.cidade}/{order.shipping_address.uf}
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

        {isPaid && coupon && upsellProducts.length > 0 && (
          <PostPurchaseUpsell
            products={upsellProducts}
            couponCode={coupon.code}
            couponPct={coupon.discount_pct}
            couponExpiresAt={coupon.expires_at}
          />
        )}
      </div>
    </div>
  );
}
