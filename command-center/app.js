const $ = (selector) => document.querySelector(selector);
const loading = $("#loading");
const login = $("#login");
const dashboard = $("#dashboard");
let range = "30d";

const api = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "same-origin", ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || "request_failed"), { status: response.status });
  return body;
};

const show = (element) => {
  [loading, login, dashboard].forEach((node) => { node.hidden = node !== element; });
};

const money = (minor, currency = "MYR") => new Intl.NumberFormat("en-MY", {
  style: "currency", currency, maximumFractionDigits: 0,
}).format((minor || 0) / 100);

const unavailable = (node) => { node.textContent = "Unavailable"; node.classList.add("muted-value"); };
const metric = (id, value, formatter = String) => {
  const node = $(id); node.classList.remove("muted-value");
  if (value === null || value === undefined) unavailable(node); else node.textContent = formatter(value);
};

function render(data) {
  const { aggregate, projects, mode } = data;
  const hasSubscriptions = aggregate.subscriptions.coverage.available > 0;
  const hasPayments = aggregate.customerPayments.coverage.available > 0;
  const formatMoney = (value) => money(value, aggregate.currency);
  const count = (value) => value.toLocaleString("en-MY");
  metric("#net-revenue", hasSubscriptions ? aggregate.subscriptions.netReceiptsMinor : null, formatMoney);
  metric("#net-revenue-small", hasSubscriptions ? aggregate.subscriptions.netReceiptsMinor : null, formatMoney);
  metric("#gross-revenue", hasSubscriptions ? aggregate.subscriptions.grossReceiptsMinor : null, formatMoney);
  metric("#refunds", hasSubscriptions ? aggregate.subscriptions.refundsMinor : null, (value) => `− ${formatMoney(value)}`);
  metric("#mrr", hasSubscriptions ? aggregate.subscriptions.mrrMinor : null, formatMoney);
  metric("#new-vendors", hasSubscriptions ? aggregate.subscriptions.newVendors : null, count);
  metric("#active-subscriptions", hasSubscriptions ? aggregate.subscriptions.active : null, count);
  metric("#payment-gross", hasPayments ? aggregate.customerPayments.grossVolumeMinor : null, formatMoney);
  metric("#payment-refunds", hasPayments ? aggregate.customerPayments.refundsMinor : null, (value) => `− ${formatMoney(value)}`);
  metric("#payment-net", hasPayments ? aggregate.customerPayments.netVolumeMinor : null, formatMoney);
  metric("#payment-transactions", hasPayments ? aggregate.customerPayments.transactionCount : null, count);
  metric("#payments-succeeded", hasPayments ? aggregate.customerPayments.states.succeeded : null, count);
  metric("#payments-pending", hasPayments ? aggregate.customerPayments.states.pending : null, count);
  metric("#payments-failed", hasPayments ? aggregate.customerPayments.states.failed : null, count);
  metric("#payments-refunded", hasPayments ? aggregate.customerPayments.states.refunded : null, count);
  $("#connection-count").textContent = `${aggregate.coverage.connected} / ${aggregate.coverage.total}`;
  $("#updated-at").textContent = `Updated ${new Date(data.generatedAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}`;

  const banner = $("#data-banner");
  banner.className = "data-banner";
  if (mode === "sample") {
    banner.textContent = "SAMPLE PREVIEW — These values are illustrative only and are not live income. Connect each project adapter before production use.";
  } else if (!hasSubscriptions && !hasPayments) {
    banner.classList.add("empty");
    banner.textContent = "No live metrics are connected yet. Subscription receipts and customer payments are unavailable — nothing here is estimated.";
  } else {
    banner.classList.add("live");
    const subCoverage = `${aggregate.subscriptions.coverage.available}/${aggregate.subscriptions.coverage.total} subscription streams`;
    const payCoverage = `${aggregate.customerPayments.coverage.available}/${aggregate.customerPayments.coverage.total} payment streams`;
    banner.textContent = `LIVE DATA — ${subCoverage}; ${payCoverage}. Any partial totals exclude unavailable projects.`;
  }

  const rows = $("#project-rows");
  rows.replaceChildren(...projects.map((project) => {
    const tr = document.createElement("tr");
    const stats = project.metrics;
    const sub = stats.subscriptions;
    const pay = stats.customerPayments;
    const sourceLabel = stats.status === "sample" ? "Sample" : sub && pay ? "Subs + payments" : sub ? "Subscriptions" : pay ? "Payments" : "Not connected";
    const cells = [
      `<div class="project-name"><span class="project-mark">${project.name.slice(0,2).toUpperCase()}</span><span><b>${project.name}</b><small>${project.category} · ${project.vendorNoun}</small></span></div>`,
      `<span class="status ${stats.status}">${sourceLabel}</span>`,
      sub ? formatMoney(sub.netReceiptsMinor) : `<span class="muted-value">Unavailable</span>`,
      sub ? formatMoney(sub.mrrMinor) : `<span class="muted-value">—</span>`,
      sub ? count(sub.newVendors) : `<span class="muted-value">—</span>`,
      sub ? count(sub.active) : `<span class="muted-value">—</span>`,
      pay ? formatMoney(pay.netVolumeMinor) : `<span class="muted-value">Unavailable</span>`,
      pay ? count(pay.states.succeeded) : `<span class="muted-value">—</span>`,
      pay ? count(pay.states.pending) : `<span class="muted-value">—</span>`,
    ];
    cells.forEach((html) => { const td = document.createElement("td"); td.innerHTML = html; tr.append(td); });
    const linkCell = document.createElement("td");
    const link = project.links[0];
    if (link) { const a = document.createElement("a"); a.className = "project-link"; a.href = link.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open ↗"; linkCell.append(a); }
    tr.append(linkCell);
    return tr;
  }));
}

async function loadDashboard() {
  try {
    const demo = new URLSearchParams(location.search).get("demo") === "1" ? "&demo=1" : "";
    render(await api(`/api/command-center?range=${range}${demo}`));
  } catch (error) {
    if (error.status === 401) return show(login);
    const banner = $("#data-banner"); banner.className = "data-banner empty"; banner.textContent = "Dashboard data could not be loaded. Please try again.";
  }
}

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button");
  const error = $("#login-error");
  button.disabled = true; error.textContent = "";
  try {
    const values = Object.fromEntries(new FormData(form));
    await api("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    form.reset(); show(dashboard); await loadDashboard();
  } catch (err) {
    error.textContent = err.message === "auth_not_configured" ? "Owner access is not configured on this server." : "Email or password is incorrect.";
  } finally { button.disabled = false; }
});

$("#logout").addEventListener("click", async () => {
  try { await api("/api/auth/logout", { method: "POST" }); } finally { show(login); }
});

document.querySelectorAll("[data-range]").forEach((button) => button.addEventListener("click", async () => {
  range = button.dataset.range;
  document.querySelectorAll("[data-range]").forEach((item) => item.classList.toggle("on", item === button));
  button.closest(".ranges").setAttribute("aria-busy", "true");
  await loadDashboard();
  button.closest(".ranges").removeAttribute("aria-busy");
}));

(async () => {
  try {
    const session = await api("/api/auth/session");
    if (!session.authenticated) return show(login);
    $("#owner-email").textContent = session.user.email;
    show(dashboard); await loadDashboard();
  } catch { show(login); }
})();
