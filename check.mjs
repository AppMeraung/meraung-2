// Site self-check: `npm test` (builds first). Fails loudly on broken links, missing files or wrong facts.
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { products } from "./data/products.mjs";

const pages = { "/": "index.html", "/products/": "products/index.html", "/services/": "services/index.html", "/work/": "work/index.html", "/pricing/": "pricing/index.html" };
const read = (f) => readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
const html = Object.fromEntries(Object.entries(pages).map(([u, f]) => [u, read(f)]));
const ids = (h) => new Set([...h.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const productIds = new Set(products.map((p) => p.id));

for (const [url, h] of Object.entries(html)) {
  for (const [, id] of h.matchAll(/href="#([^"]+)"/g)) assert.ok(ids(h).has(id), `${url}: missing #${id}`);
  for (const [, path, hash] of h.matchAll(/href="(\/[a-z]*\/?)(?:#([^"]+))?"/g)) {
    assert.ok(pages[path], `${url}: link to unknown page ${path}`);
    if (hash) assert.ok(ids(html[path]).has(hash), `${url}: ${path}#${hash} missing`);
  }
  for (const [, file] of h.matchAll(/(?:src|href)="\/([^"#?]+\.[a-z]+)"/g)) assert.ok(existsSync(new URL(`./${file}`, import.meta.url)), `${url}: missing /${file}`);
  // Every pop-up opener points at a real product.
  for (const [, id] of h.matchAll(/data-open="([^"]+)"/g)) assert.ok(productIds.has(id), `${url}: data-open="${id}" is not a product`);
  assert.ok(h.includes("mailto:info@meraung.com"), `${url}: contact email missing`);
  assert.ok(!h.includes("hello@meraung.com"), `${url}: wrong email`);
  assert.ok(h.includes('<dialog class="pop"') && h.includes('id="pdata"'), `${url}: product pop-up missing`);
  // Removed on request: there is no Meraung POS product and no Isuke.
  assert.ok(!/Meraung POS|isuke/i.test(h), `${url}: still mentions Meraung POS or Isuke`);
}

// Data: every product is complete enough for the pop-up and checkout.
for (const p of products) {
  assert.ok(p.need && p.what && p.bestFor && p.features.length && p.plans.length, `${p.id}: incomplete`);
  assert.ok(existsSync(new URL(`./shots/${p.img}.jpg`, import.meta.url)), `${p.id}: image missing`);
  if (p.type === "ready") assert.match(p.cta?.url || "", /^https:\/\//, `${p.id}: no sign-up link`);
  for (const pl of p.plans) assert.ok(pl.contact || [pl.monthly, pl.once, pl.from].some((v) => typeof v === "number"), `${p.id}/${pl.id}: no price`);
  // Each product has a card on the products page and a price table on the pricing page.
  assert.ok(html["/products/"].includes(`id="${p.id}"`), `${p.id}: no card on products page`);
  assert.ok(html["/pricing/"].includes(`id="price-${p.id}"`), `${p.id}: no price table`);
  assert.ok(html["/pricing/"].includes(`data-open="${p.id}" data-plan="${p.plans[0].id}"`), `${p.id}: no Choose button`);
}

// Prices match the source apps (spot checks on the built pricing page).
const pricing = html["/pricing/"];
for (const p of ["RM99", "RM199", "RM349", "RM1,069", "RM169", "RM269", "RM12,999", "RM19.90", "RM39.90", "RM79.90", "RM29", "RM290", "RM59", "RM149", "RM790", "RM1,500", "RM2,900", "RM8,000", "RM15,000", "RM25,000", "RM12,000", "RM20,000"]) {
  assert.ok(pricing.includes(p), `pricing: ${p} missing`);
}
assert.ok(!/From RM1,500 one-time/.test(html["/"]), "landing page must start from RM790");

console.log(`ok: ${Object.keys(pages).length} pages, ${products.length} products, links, pop-ups, prices`);
