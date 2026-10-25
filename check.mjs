// Site self-check: `npm test` (builds first). Fails loudly on broken links, missing files or wrong facts.
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const pages = { "/": "index.html", "/products/": "products/index.html", "/services/": "services/index.html", "/work/": "work/index.html", "/pricing/": "pricing/index.html" };
const read = (f) => readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
const html = Object.fromEntries(Object.entries(pages).map(([u, f]) => [u, read(f)]));
const ids = (h) => new Set([...h.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));

for (const [url, h] of Object.entries(html)) {
  // In-page anchors exist on the same page.
  for (const [, id] of h.matchAll(/href="#([^"]+)"/g)) assert.ok(ids(h).has(id), `${url}: missing #${id}`);
  // Links to other pages (and their anchors) exist.
  for (const [, path, hash] of h.matchAll(/href="(\/[a-z]*\/?)(?:#([^"]+))?"/g)) {
    assert.ok(pages[path], `${url}: link to unknown page ${path}`);
    if (hash) assert.ok(ids(html[path]).has(hash), `${url}: ${path}#${hash} missing`);
  }
  // Local files exist.
  for (const [, file] of h.matchAll(/(?:src|href)="\/([^"#?]+\.[a-z]+)"/g)) assert.ok(existsSync(new URL(`./${file}`, import.meta.url)), `${url}: missing /${file}`);
  // Real contact address only, and the shared top bar is present.
  assert.ok(h.includes("mailto:info@meraung.com"), `${url}: contact email missing`);
  assert.ok(!h.includes("hello@meraung.com"), `${url}: wrong email`);
  assert.ok(h.includes('class="announce"') && h.includes('aria-label="Mobile"'), `${url}: top bar missing`);
}

// Products page: every product has a section, a price table and a status label.
const products = html["/products/"];
for (const id of ["pos", "bizpos", "mykiosk", "moto", "skola", "affilixhq", "resto-pos", "landing", "custom"]) {
  const start = products.indexOf(`<article id="${id}"`);
  assert.ok(start > 0, `product #${id} missing`);
  const block = products.slice(start, products.indexOf("</article>", start));
  assert.ok(block.includes('class="ptable"'), `#${id}: no price table`);
  assert.ok(/badge (ready|build)/.test(block), `#${id}: no ready/built label`);
}

// Prices match the source apps (spot checks).
const pricing = html["/pricing/"];
for (const p of ["RM79", "RM149", "RM249", "RM99", "RM199", "RM349", "RM169", "RM269", "RM12,999", "RM19.90", "RM39.90", "RM79.90", "RM29", "RM59", "RM790", "RM1,500", "RM2,900", "RM8,000", "RM15,000", "RM25,000"]) {
  assert.ok(pricing.includes(p), `pricing: ${p} missing`);
}
assert.ok(!/RM1,500<\/b> one-time|From RM1,500/.test(html["/"]), "landing page must start from RM790");

console.log(`ok: ${Object.keys(pages).length} pages, links, files, email, products, prices`);
