"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Zap, Truck, ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TEAMS } from "@/lib/teams";
import { BrandMark } from "./BrandMark";
import { PIX_DISCOUNT_PCT } from "@/lib/brand";
import { cn } from "@/lib/utils";


export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition md:hidden"
          aria-label="Abrir menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[88vw] max-w-[400px] flex-col gap-0 border-r border-border/60 bg-background p-0"
      >
        <SheetHeader className="flex-none border-b border-border/60 px-5 py-4">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              aria-label="11 Of home"
              className="inline-flex"
            >
              <BrandMark size="md" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu de navegação
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <nav className="flex flex-col gap-1">
            <MobileNavLink href="/produtos" onClick={() => setOpen(false)}>
              Todas as seleções
            </MobileNavLink>
            <MobileNavLink
              href="/produtos?conf=CONMEBOL"
              onClick={() => setOpen(false)}
            >
              América do Sul
            </MobileNavLink>
            <MobileNavLink
              href="/produtos?conf=UEFA"
              onClick={() => setOpen(false)}
            >
              Europa
            </MobileNavLink>
            <MobileNavLink href="/editorial" onClick={() => setOpen(false)}>
              Editorial
            </MobileNavLink>
            <MobileNavLink href="/sobre" onClick={() => setOpen(false)}>
              Manifesto
            </MobileNavLink>
          </nav>

          <div className="mt-7">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Seleções
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {TEAMS.map((t) => (
                <li key={t.code}>
                  <Link
                    href={`/produtos/${t.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-2 transition hover:border-foreground"
                  >
                    <div className="relative size-12 flex-none overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={t.thumbUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {t.shortName}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {t.star.name}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-none border-t border-border/60 bg-card/40 px-5 py-4">
          <ul className="flex flex-col gap-2 text-xs">
            <li className="flex items-center gap-2">
              <Zap className="size-3.5 text-turf" />
              PIX {PIX_DISCOUNT_PCT}% OFF automático
            </li>
            <li className="flex items-center gap-2">
              <Truck className="size-3.5 text-turf" />
              Frete grátis acima R$ 299
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-turf" />
              100% oficial · Troca em 7 dias
            </li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-3 font-display text-xl font-semibold tracking-tight transition hover:bg-muted/60",
      )}
    >
      {children}
      <span aria-hidden className="text-muted-foreground">→</span>
    </Link>
  );
}
