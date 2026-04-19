@AGENTS.md

# Loja — Convenções

## Princípio: Subtração (Steve Jobs)
Adicione apenas o que serve à venda. Sem reviews, sem discount codes, sem auth de cliente, sem admin custom no MVP. Tudo isso é v2 — quando doer, adiciona.

## Stack
- Next.js 16.2.x (App Router, Server Actions, Turbopack default)
- React 19.2.x
- Tailwind v4 (CSS-first, sem `tailwind.config.*`)
- shadcn/ui preset Nova (Lucide + Geist), base color `neutral`
- Supabase (`@supabase/ssr` 0.10+, `@supabase/supabase-js` 2.103+)
- pague.dev — PIX único método de pagamento
- Vercel deploy

## Conventions
- **Money**: sempre em cents (int) no DB, código e tipos. Exibe via `formatBRL(cents)` de `@/lib/money`.
- **API pague.dev**: requer `amount` em BRL (não cents) — converter na borda em `@/lib/pague/client.ts`.
- **Brand**: única fonte é `@/lib/brand.ts` (`BRAND_NAME`, `BRAND_TAGLINE`, etc.). Renomear lá.
- **Locale**: PT-BR only. Datas, moeda, mensagens.
- **Server-only files**: tudo em `@/lib/supabase/service.ts` e `@/lib/pague/*` é server-only. NUNCA importar em Client Component.
- **Env vars**: prefixo `NEXT_PUBLIC_` apenas para o client. Service keys e segredos jamais.
- **Cart**: cookie httpOnly assinado. Cap 20 items. Sem persistência em DB no MVP.
- **Pedidos**: `short_code` humano (LJ-2026-0001). UUID `id` é canonical.
- **PIX**: 30 min de TTL (1800s). Botão "Gerar novo PIX" se expirar.
- **Webhook**: idempotência via tabela `webhook_events` (`event_id` PK).
- **RLS**: público lê só `status='published'`. Pedidos só com service role.

## Comandos
- `npm run dev` — Turbopack dev
- `npm run build` — production build
- `npm run lint` — ESLint flat config

## Plan source of truth
`/Users/caio/.claude/plans/vast-churning-bear.md`
