document.getElementById("y").textContent = new Date().getFullYear();

// Close the mobile menu after picking a link.
document.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => a.closest("details").removeAttribute("open")));

// Fade sections in once (staggered by --i); content stays visible if the observer is unavailable.
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.05 });
  document.querySelectorAll(".fx").forEach((el) => io.observe(el));

  // Category strip: underline the category on screen.
  const strip = document.querySelector(".cat-nav");
  if (strip) {
    const items = [...strip.querySelectorAll("a")];
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) items.forEach((a) => a.classList.toggle("on", a.hash === "#" + e.target.id));
    }), { rootMargin: "-35% 0px -55% 0px" });
    items.forEach((a) => { const t = document.querySelector(a.hash); if (t) spy.observe(t); });
  }
}

/* ---------- Product pop-up: details, pick a package, continue ---------- */
const products = JSON.parse(document.getElementById("pdata").textContent);
const byId = Object.fromEntries(products.map((p) => [p.id, p]));
const dlg = document.querySelector("dialog.pop");
const body = dlg.querySelector(".pop-body");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const rm = (n) => "RM" + (Number.isInteger(n) ? n.toLocaleString("en-MY") : n.toFixed(2));
let state = null; // { p, plan, cycle }

function priceOf(pl, cycle) {
  if (pl.contact) return { big: "Contact us", small: "" };
  if (pl.once !== undefined) return { big: rm(pl.once), small: pl.extra || "one-time" };
  if (pl.from !== undefined) return { big: "From " + rm(pl.from), small: pl.delivery || "" };
  if (cycle === "yearly" && pl.yearly) return { big: rm(pl.yearly), small: "per year" };
  return { big: rm(pl.monthly), small: pl.extra || "per month" };
}

function render() {
  const { p, plan, cycle } = state;
  const hasYearly = p.plans.some((x) => x.yearly);
  const chosen = p.plans.find((x) => x.id === plan) || p.plans[0];
  const pr = priceOf(chosen, cycle);
  const ready = p.type === "ready";
  const subject = encodeURIComponent(`${ready ? "Enquiry" : "Order"}: ${p.name} — ${chosen.name}`);
  const mail = `mailto:info@meraung.com?subject=${subject}&body=${encodeURIComponent(`Package: ${p.name} — ${chosen.name} (${pr.big}${pr.small ? " " + pr.small : ""})\nName:\nPhone / WhatsApp:\nBusiness:\nWhat I need:\n`)}`;
  let action;
  if (chosen.contact) action = `<a class="btn" href="${mail}">Contact us about ${esc(chosen.name)}</a>`;
  else if (ready) action = `<a class="btn" href="${esc(p.cta.url)}" target="_blank" rel="noopener">${esc(p.cta.label)} — ${esc(chosen.name)}</a>`;
  else action = `<a class="btn" href="${mail}">Order ${esc(p.name)} ${esc(chosen.name)}</a>`;

  body.innerHTML = `
    <div class="pop-media"><img src="/shots/${esc(p.img)}.jpg" alt="" />${p.imgNote ? `<span>${esc(p.imgNote)}</span>` : ""}</div>
    <div class="pop-info">
      <span class="badge ${p.type}">${ready ? esc(p.trial || "Ready to use") : "Built for you"}</span><span class="badge soon">${esc(p.platforms)}</span>
      <h2 id="pop-title">${esc(p.name)}</h2>
      <p class="pop-what">${esc(p.what)}</p>
      <p class="pop-for"><b>Best for:</b> ${esc(p.bestFor)}</p>
      <ul class="pop-feats">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <div class="pop-pick">
        <div class="pick-head"><h3>Choose a package</h3>${hasYearly ? `<div class="cycle" role="group" aria-label="Billing"><button type="button" data-cycle="monthly" aria-pressed="${cycle === "monthly"}">Monthly</button><button type="button" data-cycle="yearly" aria-pressed="${cycle === "yearly"}">Yearly${p.yearlyNote ? ` · ${esc(p.yearlyNote)}` : ""}</button></div>` : ""}</div>
        <div class="plans" role="group" aria-label="Packages">
          ${p.plans.map((pl) => { const x = priceOf(pl, cycle); return `<button type="button" class="plan-opt" data-plan="${pl.id}" aria-pressed="${pl.id === chosen.id}">
            <span class="po-name">${esc(pl.name)}${pl.popular ? ' <em>Most chosen</em>' : ""}</span>
            <span class="po-price">${esc(x.big)} <small>${esc(x.small)}</small></span>
            <span class="po-inc">${pl.limits ? `<b>${esc(pl.limits)}</b> · ` : ""}${esc(pl.includes)}</span>
          </button>`; }).join("")}
        </div>
      </div>
      <div class="pop-go">
        <div class="total"><span>${esc(chosen.name)}</span><b>${esc(pr.big)}</b> <small>${esc(pr.small)}</small></div>
        ${action}
      </div>
      <p class="pop-note">${ready ? esc(p.payNote || "") : "We reply within one working day to confirm the scope, the deposit and your start date."}</p>
    </div>`;
}

function open(id, planId) {
  const p = byId[id];
  if (!p) return false;
  state = { p, plan: planId || (p.plans.find((x) => x.popular) || p.plans[0]).id, cycle: "monthly" };
  render();
  if (!dlg.open) dlg.showModal();
  dlg.querySelector(".pop-body").scrollTop = 0;
  return true;
}

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener && !dlg.contains(opener)) {
    if (open(opener.dataset.open, opener.dataset.plan)) e.preventDefault();
    return;
  }
  const opt = e.target.closest(".plan-opt");
  if (opt) { state.plan = opt.dataset.plan; render(); dlg.querySelector(`.plan-opt[data-plan="${state.plan}"]`).focus(); return; }
  const cyc = e.target.closest("[data-cycle]");
  if (cyc) { state.cycle = cyc.dataset.cycle; render(); return; }
});
// Click on the dark backdrop closes the pop-up.
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

// Deep link: /products/#bizpos opens that product.
if (location.hash && byId[location.hash.slice(1)]) open(location.hash.slice(1));
