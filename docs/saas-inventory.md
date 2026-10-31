# AppMeraung SaaS inventory

Read-only discovery through the connected GitHub installation on 30 October 2026 returned **19 repositories**. The Command Center includes products that have, or are explicitly being built for, vendor/host/business accounts. A repository alone is not treated as a SaaS product.

## Included in Command Center (9)

The order below is the eligible-project order from the connected GitHub repository listing, after non-SaaS repositories are filtered out. The registry and dashboard use this same order.

| Command Center project | Repository evidence | Inclusion basis | Live metrics |
| --- | --- | --- | --- |
| MOTO | `AppMeraung/App-Meeting-On-The-Go` | Organisation/team subscription product in the official catalogue | Unavailable until adapter is configured |
| Barber PRO | `AppMeraung/barber-booking` | Multi-branch barbershop booking product requested by owner | Unavailable until adapter is configured; current README identifies it as a prototype |
| BizPOS | `AppMeraung/bizpos` | Business POS in the official Meraung product catalogue | Unavailable until adapter is configured |
| MyKiosk2U | `AppMeraung/mykiosk2u` | Multi-store kiosk with owner sessions and subscriptions | Unavailable until adapter is configured |
| Skola | `AppMeraung/App-Meraung-Studio` | Education-provider subscription product in the official catalogue | Unavailable until adapter is configured |
| KenduriKita | `AppMeraung/kendurikita` | Wedding/kenduri platform with vendor-facing scope | Unavailable until adapter is configured |
| EventSnap2U | `AppMeraung/eventsnap2u` | Host-facing event product with planned paid packages | Unavailable; repository says host payment is not built yet |
| FonKita | `AppMeraung/fonkita` | Merchant marketplace and admin portal | Unavailable until adapter is configured; current README identifies it as an MVP |
| AffilixHQ | `AppMeraung/affilixhq` | Brand/merchant affiliate subscription product in the official catalogue | Unavailable until adapter is configured |

## Repositories not represented as separate SaaS rows (10)

| Repository | Reason |
| --- | --- |
| `AppMeraung/motomeraung` | Archived predecessor/duplicate of MOTO |
| `AppMeraung/isuke` | Single travel-agency booking product, not a multi-vendor subscription SaaS |
| `AppMeraung/isuke-ai-agent` | Internal WhatsApp service/booking agent for ISUKE staff; README explicitly says no self sign-up |
| `AppMeraung/makeup-store` | Reusable/client storefront, not a vendor subscription platform |
| `AppMeraung/tujuan` | Client/custom-work example; no repository evidence of vendor subscriptions |
| `AppMeraung/neavora` | Client/work example; no repository evidence of vendor subscriptions |
| `AppMeraung/meraung` | Archived Meraung website |
| `AppMeraung/meraung-2` | Current public studio portfolio, not a SaaS product |
| `AppMeraung/rider-life-3d-mobile` | Mobile game prototype |
| `AppMeraung/barber-pro-support` | Static public support/privacy repository for Barber PRO, not a separate product |

This classification is intentionally conservative: an excluded repository can be promoted into the registry when evidence shows distinct vendor accounts and revenue/subscription semantics.
