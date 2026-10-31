# Meraung Studio 2.0

Static multi-page site: Home, Products (by business type, tap a product for a pop-up to pick a package), Services, Work, Pricing.
Prices are copied from each product's own source (meraung.com catalog, BizPOS, MyKiosk2U, AffilixHQ, Skola).

- Products, plans and prices live in `data/products.mjs` (one source for cards, pop-ups and price tables)
- Edit pages in `src/*.html`; shared top bar, footer and pop-up live in `build.mjs`
- `npm test` — builds the pages, then checks links, files, contact email and prices
- Preview: `python3 -m http.server -d .`
- Product images in `shots/` are screenshots of the live apps
- Deploy: push to `main` (Vercel)

## Private owner Command Center

`/command-center/` is a private Super Admin dashboard for SaaS subscriptions and customer payments inside the apps. The public portfolio pages and navigation are unchanged.

- Authentication is verified by serverless functions. The session is signed and stored in an `HttpOnly`, `SameSite=Strict` cookie.
- Live values are never estimated. A project stays **Unavailable** until its server-side adapter is configured.
- Subscription receipts and customer-to-vendor payment volume are separate streams. Both use integer minor units and derive `net = gross - refunds`.
- Customer payment volume is not Meraung revenue. MRR is displayed separately and is never added to period receipts.
- Vendor counts intentionally exclude customer sign-ups.
- Sample preview requires `MERAUNG_DEMO_MODE=true`, is labeled throughout, and should stay disabled in production.

Required server-only environment keys are documented in `.env.example`. Each project adapter expects an HTTPS JSON endpoint and bearer token. The tenant-bound v2 contract is documented in [`docs/metrics-adapter-v2.md`](docs/metrics-adapter-v2.md); missing streams remain unavailable instead of becoming zero.

```json
{
  "schemaVersion": 2,
  "projectId": "barber-pro",
  "currency": "MYR",
  "period": { "start": "2026-10-01T00:00:00Z", "end": "2026-10-30T10:00:00Z" },
  "updatedAt": "2026-10-30T10:00:00Z",
  "subscriptions": { "grossReceiptsMinor": 10000, "refundsMinor": 500, "mrrMinor": 4000, "newVendors": 3, "active": 12, "trialing": 2, "pastDue": 1, "canceled": 1 },
  "customerPayments": { "grossVolumeMinor": 90000, "refundsMinor": 2500, "states": { "succeeded": 20, "pending": 2, "failed": 1, "refunded": 1 } }
}
```

Use `npm run dev` for local preview and `npm test` for the public-site and Command Center checks.

The GitHub-derived inclusion/exclusion record for all 19 AppMeraung repositories is in [`docs/saas-inventory.md`](docs/saas-inventory.md).

Production guards are fail-closed: demo data additionally requires `MERAUNG_RUNTIME=development`, and any `NODE_ENV=production`, `VERCEL_ENV=production` or `MERAUNG_RUNTIME=production` marker disables it. Plain HTTP metrics endpoints require a separate local-development opt-in and must resolve to localhost; production adapters require HTTPS.
