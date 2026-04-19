"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useCart } from "@/components/loja/cart/CartContext";
import { CartButton } from "@/components/loja/cart/CartButton";
import { BrandMark } from "./BrandMark";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { SearchDialog } from "./SearchDialog";
import { FavoritesButton } from "./FavoritesButton";

export function HeaderClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { products } = useCart();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
          <div className="flex items-center gap-2">
            <MobileNav />
            <nav className="hidden items-center gap-7 text-[13px] font-medium text-foreground/80 md:flex">
              <MegaMenu />
              <Link
                href="/editorial"
                className="hidden hover:text-foreground transition lg:inline"
              >
                Editorial
              </Link>
              <Link
                href="/sobre"
                className="hidden hover:text-foreground transition lg:inline"
              >
                Manifesto
              </Link>
            </nav>
          </div>

          <Link
            href="/"
            aria-label="11 Of — home"
            className="justify-self-center"
          >
            <BrandMark size="md" />
          </Link>

          <div className="flex items-center justify-end gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-border/80 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-foreground/80 hover:border-foreground hover:text-foreground transition md:inline-flex"
              aria-label="Buscar (⌘K)"
            >
              <Search className="size-3.5" />
              Buscar
              <kbd className="ml-1 hidden rounded border border-border/70 bg-background/80 px-1 py-0.5 font-mono text-[9px] lg:inline">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition md:hidden"
              aria-label="Buscar"
            >
              <Search className="size-4" />
            </button>
            <FavoritesButton />
            <CartButton />
          </div>
        </div>
      </header>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        products={products}
      />
    </>
  );
}
