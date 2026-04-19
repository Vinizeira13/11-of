# 11 Of

> Camisas oficiais das seleções da Copa do Mundo 2026. Tiragem controlada, editorial, PIX.

Storefront custom em Next.js 16, sem Shopify, pensado para o mercado brasileiro. Curadoria vertical: só camisas oficiais Nike da Copa 2026, despacho em 24h, PIX com 15% OFF automático.

**Brand:** 11 Of · **Stack:** Next 16 + React 19 + Tailwind v4 + Supabase + pague.dev

---

## Preview

- **Home** — Hero bento + countdown Copa + editorial das seleções + press + stats
- **Catálogo** (`/produtos`) — Filtros URL-sync (confederação, tamanho, estoque, sort)
- **PDP** (`/produtos/[slug]`) — Gallery separada de editorial, ColorSwatches, FitCalculator, Share, JSON-LD rich snippets
- **Editorial** (`/editorial`) — Lookbook bento de todos os editoriais Nike
- **Sobre** (`/sobre`) — Manifesto + values + stats
- **Favoritos** (`/favoritos`) — Wishlist em localStorage
- **Checkout** (`/checkout`) — Shopify-style 1-página com PIX em destaque
- **Pedido** (`/pedido/[id]`) — QR PIX + polling de status

---

## Stack

| Camada | Tech |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack, Server Actions) |
| UI | React 19.2, Tailwind v4 (CSS-first), shadcn/ui preset radix-nova |
| Typography | Geist Sans + Mono, Space Grotesk (display), Instrument Serif (editorial) |
| DB | Supabase Postgres + Storage + SSR (`@supabase/ssr`) |
| Pagamento | pague.dev — PIX exclusivo, HMAC webhook |
| Animação | GSAP + ScrollTrigger (reveals, flip, fly-to-cart) |
| Deploy | Vercel (auto em `main`) |

---

## Como rodar

### 1. Instalar

```bash
npm install
```

### 2. Variáveis de ambiente

Copie `.env.example` pra `.env.local` e preencha:

```bash
# Supabase (pegue em supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=<service role secret — SERVER ONLY>

# Cart cookie HMAC (>= 32 chars em produção)
CART_SECRET=<openssl rand -hex 32>

# pague.dev (pd_test_* em dev, pd_live_* em prod)
PAGUE_API_KEY=<api key>
PAGUE_WEBHOOK_SECRET=<webhook signing secret>

# Site (usado em metadata, JSON-LD, share URL)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase

Aplique a migration inicial com tabelas + RLS + RPCs (`reserve_stock` / `release_stock`). Suba imagens dos produtos em `storage/v1/object/public/jersey-assets/nike/<code>/` e referencie as URLs no array `products.images` do DB.

Seed das 8 seleções descrito em `src/lib/teams.ts` — metadata de time, jogador estrela, cor primária e confederação.

### 4. Dev

```bash
npm run dev      # Next dev + Turbopack (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint flat config
```

---

## Arquitetura

```
src/
├── app/
│   ├── (loja)/              route group com layout principal (header/footer)
│   │   ├── page.tsx         Home
│   │   ├── produtos/
│   │   ├── produtos/[slug]/ PDP
│   │   ├── editorial/
│   │   ├── sobre/
│   │   └── favoritos/
│   ├── checkout/            fora do group — layout próprio sem header/footer
│   ├── pedido/[id]/         QR PIX + polling
│   ├── api/webhooks/pague/  HMAC + idempotência via webhook_events
│   ├── _actions/            Server Actions (cart, checkout, pix)
│   ├── layout.tsx           fonts + metadata + Toaster
│   ├── loading.tsx          global shimmer
│   └── not-found.tsx        404 editorial
│
├── components/
│   ├── loja/                todos os componentes da loja
│   └── ui/                  shadcn primitives
│
├── lib/
│   ├── brand.ts             BRAND_NAME, slogan, PIX_DISCOUNT_PCT
│   ├── teams.ts             metadata das 8 seleções
│   ├── catalog.ts           queries Supabase
│   ├── cart.ts              cookie HMAC-signed
│   ├── images.ts            splitImages (product vs editorial)
│   ├── wishlist.ts          hook localStorage
│   ├── recently-viewed.ts   hook localStorage
│   ├── favorite-team.ts     hook localStorage
│   ├── pague/client.ts      createPixCharge + verifyWebhook
│   └── supabase/            server/client/service/middleware
│
└── data/
    ├── announcements.ts     barra superior
    └── press.ts             quotes da imprensa
```

---

## Schema Supabase

5 tabelas essenciais:

- `products` — slug, name, description, category, price_cents, compare_at_cents, images[], status, sort_order
- `product_variants` — product_id, size, sku, stock_qty
- `orders` — short_code, customer_*, shipping_address jsonb, cents, status, pix_*, paid_at
- `order_items` — order_id, product_id, variant_id, qty, unit_price_cents, snapshots
- `webhook_events` — event_id PK pra idempotência

**RLS:** products e variants com leitura pública apenas onde `status='published'`. Orders e items só service role.

**RPCs:** `reserve_stock(variant_id, qty)` atômico pra evitar race no checkout.

Money **sempre em cents** no DB; conversão pra BRL só na borda de pague.dev.

---

## Fluxo de compra

```
Home/PDP  →  addToCart  →  cart cookie HMAC-signed
                                    ↓
                             CartDrawer abre
                                    ↓
                            /checkout (1-página)
                                    ↓
    createOrderAction: reserve_stock RPC → insert order → pague.dev POST /v1/pix
                                    ↓
                          /pedido/[id]  (QR + polling 5s)
                                    ↓
                ← webhook POST /api/webhooks/pague (HMAC)
                   idempotente via webhook_events.event_id
                                    ↓
                          order.payment_status = paid
```

---

## Deploy

**Vercel:** push em `main` → auto-deploy (~1-2min). Configure as env vars no dashboard (todas do `.env.local` exceto `NEXT_PUBLIC_SITE_URL` — troque pela URL de produção).

**Webhook:** aponte o endpoint da pague.dev pra `https://<seu-domínio>/api/webhooks/pague`.

---

## Convenções

- Money sempre em **cents** (int). Display via `formatBRL(cents)`.
- pague.dev recebe `amount` em **BRL number** (não cents).
- PIX-only no MVP. Desconto 15% OFF em `PIX_DISCOUNT_PCT`.
- Brand name em 1 só lugar (`@/lib/brand.ts`).
- `src/lib/supabase/service.ts` e `src/lib/pague/*` são `server-only`. Nunca importar em Client Component.
- Cart cookie HMAC-signed, cap 20 linhas, max 10 qty/linha.
- `short_code` de pedido humano (`ON-2026-XXXXXX`). UUID é canonical.
- PIX TTL 30min. Botão "Gerar novo PIX" se expirado.
- Webhook idempotente via `INSERT INTO webhook_events ON CONFLICT DO NOTHING`.
- Next 16: `generateStaticParams` não pode chamar server client com cookies — PDP é dinâmico.

---

## Próximas frentes

- [ ] Integração real pague.dev em sandbox (`pd_test_*`)
- [ ] Homepage personalizada pelo `favoriteTeam` (localStorage)
- [ ] Color swatches Away/Third (quando artista entregar)
- [ ] Admin custom (hoje: Supabase Studio)
- [ ] Cupons / gift cards
- [ ] i18n (hoje: PT-BR only)

---

## Documentação para LLMs

Quem pegar esse projeto com Claude Code, Cursor, Aider ou qualquer outro LLM deve ler primeiro o [llms.txt](./llms.txt) — contexto denso com estrutura completa, gotchas, convenções e TODOs priorizados.

---

**Feito no Brasil** 🇧🇷
