import { AnnouncementBar } from "@/components/loja/AnnouncementBar";
import { BreakingBar } from "@/components/loja/BreakingBar";
import { NeymarPopup } from "@/components/loja/NeymarPopup";
import { Header } from "@/components/loja/Header";
import { Footer } from "@/components/loja/Footer";
import { CartProvider } from "@/components/loja/cart/CartContext";
import { CartDrawer } from "@/components/loja/cart/CartDrawer";
import { TeamPicker } from "@/components/loja/TeamPicker";
import { WhatsAppFloat } from "@/components/loja/WhatsAppFloat";
import { ScrollToTop } from "@/components/loja/ScrollToTop";
import { readCart } from "@/lib/cart";
import { getPublishedProducts } from "@/lib/catalog";
import { WHATSAPP } from "@/lib/brand";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialLines, products] = await Promise.all([
    readCart(),
    getPublishedProducts(),
  ]);

  return (
    <CartProvider initialLines={initialLines} products={products}>
      <BreakingBar />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <TeamPicker />
      <WhatsAppFloat phone={WHATSAPP} />
      <ScrollToTop />
      <NeymarPopup />
    </CartProvider>
  );
}
