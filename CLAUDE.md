@AGENTS.md

# 11 Of development context

Read [README.md](./README.md) for setup and [llms.txt](./llms.txt) for the source map and external database contract. Treat source code as authoritative when implementation and older notes disagree.

## Conventions

- Keep the interface in Brazilian Portuguese and display currency in BRL.
- Store and calculate money in integer cents. The PagNet client sends cents.
- Centralize brand and pricing constants in `src/lib/brand.ts`.
- Keep `src/lib/cart.ts` and `src/lib/pagnet/client.ts` on the server; both import `server-only`.
- Only expose values intended for browsers through `NEXT_PUBLIC_*` variables.
- Keep dependency upgrades separate from routine edits; the pinned major versions have compatibility constraints.
- Preserve the signed cart format, line and quantity limits, and personalization validation.
- `/checkout` intentionally sits outside the `(loja)` route group.
- The active payment integration is PagNet, under `src/lib/pagnet/` and `/api/webhooks/pagnet`.
- Database policies and RPC implementations are external to this checkout. Do not assume they match an older README or infer verified authorization from client code alone.

## Checks

Run `npm run lint` and `npm run build` for relevant code changes. Use an isolated, configured database and payment environment for integration checks. A successful build does not establish that checkout, payment reconciliation or fulfillment works end to end.
