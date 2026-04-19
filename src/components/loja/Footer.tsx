import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import {
  BRAND_NAME,
  BRAND_MANIFESTO,
  INSTAGRAM_URL,
  PIX_DISCOUNT_LABEL,
  SUPPORT_EMAIL,
  TIKTOK_URL,
} from "@/lib/brand";
import { BrandMark } from "./BrandMark";
import { Newsletter } from "./Newsletter";

const FOOTER_LINKS = {
  Loja: [
    { href: "/produtos", label: "Todas as camisas" },
    { href: "/produtos?cat=selecao", label: "Seleções" },
    { href: "/produtos/camisa-brasil-home-2026", label: "Brasil" },
    { href: "/editorial", label: "Editorial" },
  ],
  Ajuda: [
    { href: "/envio", label: "Envio & Prazos" },
    { href: "/trocas", label: "Trocas & Devoluções" },
    { href: "/autenticidade", label: "Autenticidade" },
    { href: "/faq", label: "FAQ" },
  ],
  Sobre: [
    { href: "/sobre", label: "Manifesto" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/contato", label: "Contato" },
    { href: "/termos", label: "Termos" },
    { href: "/privacidade", label: "Privacidade" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/60 bg-background">
      {/* Newsletter band */}
      <div className="border-b border-border/60">
        <Newsletter />
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-8">
          <div className="col-span-2 md:col-span-5 lg:col-span-4">
            <Link href="/" aria-label="11 Of home">
              <BrandMark size="lg" />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground font-editorial italic">
              &ldquo;{BRAND_MANIFESTO}&rdquo;
            </p>

            <div className="mt-8 flex items-center gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 text-foreground/80 hover:border-foreground hover:text-foreground transition"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 text-foreground/80 hover:border-foreground hover:text-foreground transition"
              >
                <TikTokIcon className="size-3.5" />
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                aria-label="Email"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 text-foreground/80 hover:border-foreground hover:text-foreground transition"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="md:col-span-2 lg:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Pagamento
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
              <li>{PIX_DISCOUNT_LABEL}</li>
              <li>Compra 100% segura</li>
              <li>Envio pra todo Brasil</li>
            </ul>
            <div className="mt-5 flex items-center gap-2">
              <PixBadge />
            </div>
          </div>
        </div>

        {/* Wordmark billboard */}
        <div className="mt-20 select-none">
          <span
            aria-hidden
            className="block font-display font-bold tracking-[-0.04em] leading-none text-[clamp(4rem,18vw,16rem)] text-foreground/5"
          >
            11 · Of
          </span>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos
            reservados.
          </p>
          <p className="flex items-center gap-2">
            Feito no Brasil
            <span aria-hidden>🇧🇷</span>
            <span aria-hidden>·</span>
            <Link href="/sobre" className="inline-flex items-center gap-1 hover:text-foreground transition">
              Saiba mais <ArrowUpRight className="size-3" />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  );
}

function PixBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
      <svg viewBox="0 0 24 24" className="size-3 text-turf" aria-hidden>
        <path
          fill="currentColor"
          d="M8.5 3.5 3.5 8.5l5 5-5 5 5 5 5-5 5 5 5-5-5-5 5-5-5-5-5 5z"
        />
      </svg>
      PIX
    </span>
  );
}
