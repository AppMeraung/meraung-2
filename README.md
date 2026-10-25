# Meraung Studio 2.0

Static multi-page site: Home, Products (by business type, tap a product for a pop-up to pick a package), Services, Work, Pricing.
Prices are copied from each product's own source (meraung.com catalog, BizPOS, MyKiosk2U, AffilixHQ, Skola).

- Products, plans and prices live in `data/products.mjs` (one source for cards, pop-ups and price tables)
- Edit pages in `src/*.html`; shared top bar, footer and pop-up live in `build.mjs`
- `npm test` — builds the pages, then checks links, files, contact email and prices
- Preview: `python3 -m http.server -d .`
- Product images in `shots/` are screenshots of the live apps
- Deploy: push to `main` (Vercel)
