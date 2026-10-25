// Site self-check: run with `node check.mjs` (also `npm test`).
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

// Every in-page link points to a section that exists.
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(id), `missing section #${id}`);

// Every local file referenced exists.
for (const [, path] of html.matchAll(/(?:src|href)="\/([^"#?]+)"/g)) assert.ok(existsSync(new URL(`./${path}`, import.meta.url)), `missing file /${path}`);

// Contact uses the real address only.
assert.ok(html.includes("mailto:info@meraung.com"), "contact email missing");
assert.ok(!/hello@meraung\.com/.test(html), "wrong contact email");

// All four Meraung products are listed and linked.
for (const p of ["pos", "moto", "skola", "landing-page"]) assert.ok(html.includes(`https://meraung.com/${p}"`), `product link /${p} missing`);

// The six live apps from GitHub are listed in the Apps section.
const apps = html.slice(html.indexOf('id="apps"'), html.indexOf('id="services"'));
const appLinks = ["bizpos.my", "affilixhq.com", "mykiosk.meraung.com", "nearo-web-appmeraung-3317s-projects.vercel.app", "isuketravelandtours.com", "tujuan-ten.vercel.app"];
for (const u of appLinks) assert.ok(apps.includes(`href="https://${u}"`), `app ${u} missing`);
assert.equal((apps.match(/class="app fx"/g) || []).length, appLinks.length, "unexpected app count");

// The top bar has real navigation, on desktop and mobile.
assert.ok((html.match(/<nav /g) || []).length >= 2, "desktop or mobile nav missing");

console.log("ok: links, files, email, 4 products, 6 apps, nav");
