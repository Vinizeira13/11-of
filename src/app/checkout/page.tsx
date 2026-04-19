import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshCw, Truck, Zap, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/loja/CheckoutForm";
import { CheckoutSteps } from "@/components/loja/CheckoutSteps";
import { CheckoutSummary } from "@/components/loja/CheckoutSummary";
import { BrandMark } from "@/components/loja/BrandMark";
import { readCart } from "@/lib/cart";
import { resolveCartLines } from "@/lib/catalog";
import { pixDiscountCents } from "@/lib/pricing";
import { shippingFor } from "@/lib/shipping";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize sua compra com PIX.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const lines = await readCart();
  if (lines.length === 0) redirect("/produtos");

  const { resolved, subtotalCents } = await resolveCartLines(lines);
  if (resolved.length === 0) redirect("/produtos");

  const shippingCents = shippingFor(subtotalCents);
  const discountCents = pixDiscountCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents - discountCents;

  const summaryLines = resolved.map((l) => ({
    variantId: l.variantId,
    qty: l.qty,
    productName: l.product.name,
    variantSize: l.variant.size,
    image: l.product.images[0] ?? null,
    lineTotalCents: l.lineTotalCents,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link href="/" aria-label="11 Of home">
            <BrandMark size="md" />
          </Link>
          <CheckoutSteps />
          <Link
            href="/produtos"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground transition sm:block"
          >
            ← Continuar comprando
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-8">
        {/* Trust band */}
        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-turf/40 bg-turf/5 px-5 py-3 text-xs font-medium text-foreground/90">
          <span className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-turf" aria-hidden />
            PIX {PIX_DISCOUNT_PCT}% OFF automático
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-turf" aria-hidden />
            Despacho em 24h úteis
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="size-3.5 text-turf" aria-hidden />
            Troca grátis em 7 dias
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <ShieldCheck className="size-3.5 text-turf" aria-hidden />
            Compra 100% segura
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <section>
            <div className="mb-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
                Passo 2 de 3
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Seus dados.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Guest checkout. Você recebe o rastreio e as atualizações por
                email — não precisa criar conta.
              </p>
            </div>
            <CheckoutForm />
          </section>

          <CheckoutSummary
            lines={summaryLines}
            subtotalCents={subtotalCents}
            shippingCents={shippingCents}
            discountCents={discountCents}
            totalCents={totalCents}
          />
        </div>
      </div>
    </div>
  );
}
