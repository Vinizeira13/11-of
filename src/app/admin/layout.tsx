import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/loja/BrandMark";
import { adminLogoutAction, isAdmin } from "@/app/_actions/delivery";

export const metadata: Metadata = {
  title: "Admin · 11 Of",
  robots: { index: false, follow: false },
};

async function logout() {
  "use server";
  await adminLogoutAction();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdmin();
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
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              ← Voltar à loja
            </Link>
            {authed && (
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition"
                  aria-label="Sair do admin"
                >
                  <LogOut className="size-3.5" aria-hidden />
                  Sair
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
