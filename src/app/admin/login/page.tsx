import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminLoginAction, isAdmin } from "@/app/_actions/delivery";

function safeNext(next: string | undefined): string {
  // Only allow same-origin admin paths — never let ?next= redirect off-site.
  if (!next) return "/admin/pedidos";
  if (!next.startsWith("/admin/")) return "/admin/pedidos";
  return next;
}

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await props.searchParams;
  const nextPath = safeNext(next);

  if (await isAdmin()) {
    redirect(nextPath);
  }

  async function login(formData: FormData) {
    "use server";
    const res = await adminLoginAction(formData);
    const to = safeNext(
      typeof formData.get("next") === "string"
        ? (formData.get("next") as string)
        : undefined,
    );
    if (!res.ok) {
      redirect(
        `/admin/login?error=${encodeURIComponent(res.error ?? "erro")}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
      );
    }
    redirect(to);
  }

  return (
    <div className="mx-auto max-w-sm pt-10">
      <div className="inline-flex size-12 items-center justify-center rounded-full border border-turf/40 bg-turf/10 text-turf">
        <Lock className="size-5" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold">Admin 11 Of</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Área interna. Use a senha do painel.
      </p>

      <form action={login} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1.5"
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
        <Button type="submit" size="lg" className="h-11 rounded-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
