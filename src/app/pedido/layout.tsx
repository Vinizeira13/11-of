import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/loja/BrandMark";
import { CheckoutSteps } from "@/components/loja/CheckoutSteps";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

export default function PedidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link href="/" aria-label="11 Of home">
            <BrandMark size="md" />
          </Link>
          <CheckoutSteps activeStep={3} />
          <Link
            href="/produtos"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground transition sm:block"
          >
            ← Continuar comprando
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
