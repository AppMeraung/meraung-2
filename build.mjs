// Builds the static pages: wraps each src/<page>.html body with the shared head, top bar, footer
// and product pop-up, and fills <!--slots--> from data/products.mjs.
// Run `npm run pages` after editing src/ or data/. Output is committed, so Vercel needs no build step.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { categories, products, addons, rm, fromPrice } from "./data/products.mjs";

const pages = [
  { src: "home", out: "index.html", nav: "", title: "Meraung Studio 2.0 — Business software, made in Malaysia", desc: "Ready-to-use business software (BizPOS, MyKiosk2U, MOTO, Skola, AffilixHQ) and landing pages, websites and systems built for you." },
  { src: "products", out: "products/index.html", nav: "products", title: "Products — Meraung Studio 2.0", desc: "Pick a product by business type, see what it does and choose a package." },
  { src: "services", out: "services/index.html", nav: "services", title: "Services — Meraung Studio 2.0", desc: "Landing pages, websites, web applications, mobile apps, backends and payments, with prices and delivery times." },
  { src: "work", out: "work/index.html", nav: "work", title: "Work — Meraung Studio 2.0", desc: "Apps we built and run, and live systems we delivered for clients." },
  { src: "pricing", out: "pricing/index.html", nav: "pricing", title: "Pricing — Meraung Studio 2.0", desc: "Every price in one place: product plans, landing page, website, custom system and restaurant POS packages, and add-ons." },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const byId = Object.fromEntries(products.map((p) => [p.id, p]));

// One product card. Opens the pop-up; falls back to the products page without JS.
const card = (p, i = 0, withId = false) => `<a class="pcard fx"${withId ? ` id="${p.id}"` : ""} style="--i:${i}" href="/products/#${p.id}" data-open="${p.id}">
          <div class="img"><img src="/shots/${p.img}.jpg" alt="" loading="lazy" /></div>
          <span class="label${p.type === "build" ? " build" : ""}">${esc(p.type === "ready" ? (p.trial ? p.trial.split(",")[0] + "." : "Ready to use.") : "Built for you.")}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.what)}</p>
          <span class="from">${esc(fromPrice(p))}</span>
        </a>`;
const cards = (list, withId = false) => `<div class="grid4">\n        ${list.map((p, i) => card(p, i, withId)).join("\n        ")}\n      </div>`;

const planPrice = (pl) => pl.contact ? "Contact us"
  : pl.once !== undefined ? `${rm(pl.once)} one-time`
  : pl.from !== undefined ? `From ${rm(pl.from)}`
  : pl.monthly === 0 ? "RM0 / month" : `${rm(pl.monthly)} / month`;

// Price table for one product, with a Choose button per plan.
const table = (p) => {
  const yearly = p.plans.some((x) => x.yearly);
  const delivery = p.plans.some((x) => x.delivery);
  const head = `<tr><th>Plan</th><th>Price</th>${yearly ? `<th>Yearly${p.yearlyNote ? ` (${esc(p.yearlyNote)})` : ""}</th>` : ""}${delivery ? "<th>Delivery</th>" : ""}<th>Includes</th><th></th></tr>`;
  const rows = p.plans.map((pl) => `<tr${pl.popular ? ' class="hl"' : ""}><td>${esc(pl.name)}</td><td class="price">${esc(planPrice(pl))}${pl.extra ? `<small>${esc(pl.extra)}</small>` : ""}</td>${yearly ? `<td class="price">${pl.yearly ? rm(pl.yearly) : '<span class="muted">—</span>'}</td>` : ""}${delivery ? `<td>${esc(pl.delivery || "")}</td>` : ""}<td>${pl.limits ? `<b>${esc(pl.limits)}</b> · ` : ""}${esc(pl.includes)}</td><td><button class="btn sm ghost" data-open="${p.id}" data-plan="${pl.id}">Choose</button></td></tr>`).join("\n              ");
  return `<h3 class="sub" id="price-${p.id}">${esc(p.name)} <span class="badge ${p.type}">${esc(p.type === "ready" ? (p.trial || "Ready to use") : "Built for you")}</span></h3>
          <div class="scroll-x"><table class="ptable">
            <thead>${head}</thead>
            <tbody>
              ${rows}
            </tbody>
          </table></div>${p.payNote ? `\n          <p class="note">${esc(p.payNote)}</p>` : ""}`;
};

const guide = () => `<div class="scroll-x"><table class="ptable">
            <thead><tr><th>I run / I want…</th><th>Choose</th><th>Price</th><th>Ready when?</th><th></th></tr></thead>
            <tbody>
              ${products.map((p) => `<tr><td>${esc(p.need)}</td><td>${esc(p.name)}</td><td class="price">${esc(fromPrice(p).replace(" / month", "/mo"))}</td><td><span class="badge ${p.type}">${p.type === "ready" ? "Today" : esc(p.plans.find((x) => x.delivery)?.delivery || "After quote")}</span></td><td><button class="btn sm ghost" data-open="${p.id}">View</button></td></tr>`).join("\n              ")}
            </tbody>
          </table></div>`;

const slots = {
  "cards:featured": () => cards(["bizpos", "mykiosk", "moto", "affilixhq"].map((id) => byId[id])),
  "cards:built": () => cards(["landing", "website", "custom"].map((id) => byId[id])),
  "categories": () => categories.map((c) => `<section id="${c.id}" class="cat-block">
        <div class="head row fx"><div><h2>${esc(c.name)}.</h2><p class="cat-line">${esc(c.line)}</p></div><span class="cat-count">${products.filter((p) => p.cat === c.id).length} options</span></div>
        ${cards(products.filter((p) => p.cat === c.id), true)}
      </section>`).join("\n\n      "),
  "category-nav": () => categories.map((c) => `<a href="#${c.id}">${esc(c.name)}</a>`).join(""),
  "pricing:ready": () => products.filter((p) => p.type === "ready").map(table).join("\n\n          "),
  "pricing:built": () => products.filter((p) => p.type === "build").map(table).join("\n\n          "),
  "pricing:guide": guide,
  "pricing:addons": () => `<div class="scroll-x"><table class="ptable"><thead><tr><th>Item</th><th>Price</th></tr></thead><tbody>
              ${addons.map(([n, pr]) => `<tr><td>${esc(n)}</td><td class="price">${esc(pr)}</td></tr>`).join("\n              ")}
            </tbody></table></div>`,
};

const links = [["products", "Products"], ["services", "Services"], ["work", "Work"], ["pricing", "Pricing"]];
const navLinks = (cur) => links.map(([k, label]) => `<a href="/${k}/"${k === cur ? ' aria-current="page"' : ""}>${label}</a>`).join("\n          ");
const modalData = JSON.stringify(products).replace(/</g, "\\u003c");

const layout = (p, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${p.title}</title>
  <meta name="description" content="${p.desc}" />
  <meta name="theme-color" content="#0b1f45" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <!-- Generated by build.mjs from src/${p.src}.html — edit the source, not this file. -->
  <div class="announce">Free trial on most products — try before you pay. <a href="/pricing/">See all prices</a></div>
  <header class="top">
    <div class="wrap bar">
      <nav class="nav" aria-label="Main">
          ${navLinks(p.nav)}
      </nav>
      <details class="menu">
        <summary aria-label="Open menu"><span></span><span></span><span></span></summary>
        <nav aria-label="Mobile">
          <a href="/"${p.nav === "" ? ' aria-current="page"' : ""}>Home</a>
          ${navLinks(p.nav)}
          <a href="#contact">Contact</a>
          <a class="btn" href="mailto:info@meraung.com?subject=Enquiry%20(Meraung%20Studio%202.0)">Email info@meraung.com</a>
        </nav>
      </details>
      <a class="logo" href="/"><img src="/brand/meraung-navy.png" alt="" width="26" height="26" />Meraung<span class="ver">2.0</span></a>
      <div class="right">
        <a class="hide-m" href="#contact">Contact</a>
        <a class="btn sm" href="/pricing/">Prices</a>
      </div>
    </div>
  </header>

  <main id="top">
${Object.entries(slots).reduce((html, [k, fn]) => html.replaceAll(`<!--${k}-->`, () => fn()), body).trim()}

    <section id="contact" class="wrap contact-wrap">
      <div class="cta fx">
        <div><h2>Not sure which one fits?</h2><p>Tell us about your business and we will point you to the right product or package. We reply within one working day.</p></div>
        <div class="actions">
          <a class="btn light" href="mailto:info@meraung.com?subject=Enquiry%20(Meraung%20Studio%202.0)">Email info@meraung.com</a>
          <a class="btn line" href="/pricing/">See all prices</a>
        </div>
      </div>
    </section>
  </main>

  <div class="foot-outer"><footer class="wrap foot">
    <div class="foot-grid">
      <div><a class="logo" href="/"><img src="/brand/meraung-navy.png" alt="" width="30" height="30" />Meraung<span class="ver">2.0</span></a><p>Putrajaya · Kuala Lumpur<br />Malaysia</p></div>
      <div><h4>Products</h4>${products.filter((x) => x.type === "ready").map((x) => `<a href="/products/#${x.id}" data-open="${x.id}">${esc(x.name)}</a>`).join("")}</div>
      <div><h4>Built for you</h4>${products.filter((x) => x.type === "build").map((x) => `<a href="/products/#${x.id}" data-open="${x.id}">${esc(x.name)}</a>`).join("")}</div>
      <div><h4>Contact</h4><a href="mailto:info@meraung.com">info@meraung.com</a><a href="/work/">Work</a><a href="https://meraung.com/privacy">Privacy</a><a href="https://meraung.com/terms">Terms</a></div>
    </div>
    <p class="copy">© <span id="y">2026</span> Meraung Studio · Prices in Malaysian ringgit (RM).</p>
  </footer></div>

  <dialog class="pop" aria-labelledby="pop-title">
    <form method="dialog" class="pop-x"><button aria-label="Close">×</button></form>
    <div class="pop-body"></div>
  </dialog>
  <script id="pdata" type="application/json">${modalData}</script>
  <script src="/site.js" defer></script>
</body>
</html>
`;

for (const p of pages) {
  const body = readFileSync(new URL(`./src/${p.src}.html`, import.meta.url), "utf8");
  const out = new URL(`./${p.out}`, import.meta.url);
  mkdirSync(new URL(".", out), { recursive: true });
  const html = layout(p, body);
  const left = html.match(/<!--[a-z:-]+-->/);
  if (left) throw new Error(`${p.src}: unknown slot ${left[0]}`);
  writeFileSync(out, html);
}
console.log(`built ${pages.length} pages`);
