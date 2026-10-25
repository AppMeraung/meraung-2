# Meraung Studio 2.0

Static multi-page site: Home, Products (sidebar, features, prices, ready vs built), Services, Work, Pricing.
Prices are copied from each product's own source (meraung.com catalog, BizPOS, MyKiosk2U, AffilixHQ, Skola).

- Edit pages in `src/*.html`; shared top bar and footer live in `build.mjs`
- `npm test` — builds the pages, then checks links, files, contact email and prices
- Preview: `python3 -m http.server -d .`
- Product images in `shots/` are screenshots of the live apps
- Deploy: push to `main` (Vercel)
