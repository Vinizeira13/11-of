import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/loja/BrandMark";

export const metadata: Metadata = {
  title: "Admin · 11 Of",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/30">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/admin/pedidos" className="flex items-center gap-3">
            <BrandMark size="sm" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-turf">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            ← Voltar à loja
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
