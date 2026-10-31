# Metrics adapter v2

Each eligible project exposes one read-only server endpoint. Command Center calls it with:

- `Authorization: Bearer <project-specific token>`
- `X-Meraung-Project-ID: <registry project id>`
- `X-Meraung-Schema-Version: 2`
- query parameter `range=7d|30d|90d|ytd`

The endpoint must return its exact project ID. A mismatch is rejected, preventing one tenant/project adapter from being counted under another. Redirects are rejected so bearer credentials cannot be forwarded. Production URLs require HTTPS; tokens and raw provider credentials remain server-only.

## Response

```json
{
  "schemaVersion": 2,
  "projectId": "mykiosk",
  "currency": "MYR",
  "period": {
    "start": "2026-10-01T00:00:00.000Z",
    "end": "2026-10-31T00:00:00.000Z"
  },
  "updatedAt": "2026-10-31T00:01:00.000Z",
  "subscriptions": {
    "grossReceiptsMinor": 10000,
    "refundsMinor": 500,
    "mrrMinor": 4000,
    "newVendors": 3,
    "active": 12,
    "trialing": 2,
    "pastDue": 1,
    "canceled": 1
  },
  "customerPayments": {
    "grossVolumeMinor": 90000,
    "refundsMinor": 2500,
    "states": { "succeeded": 20, "pending": 2, "failed": 1, "refunded": 1 }
  }
}
```

`subscriptions` means money paid to Meraung for the vendor SaaS plan. `customerPayments` means checkout volume paid by app customers to the vendor. Customer payment volume is never counted as Meraung revenue. Either stream may be `null`; a missing stream is displayed as unavailable, not zero. Net values are derived by Command Center and may be negative when period refunds exceed period receipts.

## Verified integration evidence and gaps

Integration work follows GitHub order: MOTO, Barber PRO, BizPOS, MyKiosk2U, Skola, KenduriKita, EventSnap2U, FonKita, AffilixHQ.

- MyKiosk2U source contains RevenueCat subscription sync and CHIP flows. Its production notes say end-to-end retail settlement is not production-certified, so neither stream is connected automatically.
- FonKita has observed RevenueCat products, but product-to-entitlement mapping and a valid purchase flow remain unverified. No live values are consumed.
- EventSnap2U documents host packages as roadmap work and says payment is not built.
- Barber PRO documents payment/backend as future work.
- The other projects have no verified Command Center metrics endpoint or approved server credential in this workspace.

Remaining per project: implement the read-only aggregation endpoint inside that project's trusted backend, verify its tenant filters and settlement semantics, then configure only its `*_METRICS_URL` and `*_METRICS_TOKEN` on Meraung's server. Creating credentials or changing payment providers is outside this implementation.
