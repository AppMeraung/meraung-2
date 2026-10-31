import { isLocalHttpMetricsAllowed } from "./runtime.mjs";

const RANGES = new Set(["7d", "30d", "90d", "ytd"]);

export function validateRange(value) {
  return RANGES.has(value) ? value : "30d";
}

const asMinor = (value, field) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`invalid_${field}`);
  return value;
};
const asCount = (value, field) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`invalid_${field}`);
  return value;
};
const iso = (value, field) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`invalid_${field}`);
  return date.toISOString();
};

export function periodForRange(range, now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);
  if (range === "ytd") {
    start.setUTCMonth(0, 1);
    start.setUTCHours(0, 0, 0, 0);
  } else start.setUTCDate(start.getUTCDate() - Number.parseInt(range, 10));
  return { start: start.toISOString(), end: end.toISOString() };
}

function normalizeSubscriptions(raw) {
  if (raw === null || raw === undefined) return null;
  const grossReceiptsMinor = asMinor(raw.grossReceiptsMinor, "subscription_gross_receipts");
  const refundsMinor = asMinor(raw.refundsMinor, "subscription_refunds");
  return {
    grossReceiptsMinor,
    refundsMinor,
    netReceiptsMinor: grossReceiptsMinor - refundsMinor,
    mrrMinor: asMinor(raw.mrrMinor, "subscription_mrr"),
    newVendors: asCount(raw.newVendors, "new_vendors"),
    active: asCount(raw.active, "active_subscriptions"),
    trialing: asCount(raw.trialing, "trialing_subscriptions"),
    pastDue: asCount(raw.pastDue, "past_due_subscriptions"),
    canceled: asCount(raw.canceled, "canceled_subscriptions"),
  };
}

function normalizeCustomerPayments(raw) {
  if (raw === null || raw === undefined) return null;
  const grossVolumeMinor = asMinor(raw.grossVolumeMinor, "customer_payment_gross_volume");
  const refundsMinor = asMinor(raw.refundsMinor, "customer_payment_refunds");
  const states = {
    succeeded: asCount(raw.states?.succeeded, "customer_payment_succeeded"),
    pending: asCount(raw.states?.pending, "customer_payment_pending"),
    failed: asCount(raw.states?.failed, "customer_payment_failed"),
    refunded: asCount(raw.states?.refunded, "customer_payment_refunded"),
  };
  return {
    grossVolumeMinor,
    refundsMinor,
    netVolumeMinor: grossVolumeMinor - refundsMinor,
    transactionCount: Object.values(states).reduce((sum, value) => sum + value, 0),
    states,
  };
}

// Schema v2 separates Meraung subscription receipts from customer-to-vendor
// payment volume. A missing stream remains null and is never presented as zero.
export function normalizeSnapshot(raw, project, range, source = "connected") {
  if (!raw || typeof raw !== "object") throw new Error("invalid_payload");
  if (raw.schemaVersion !== 2) throw new Error("unsupported_schema_version");
  if (raw.projectId !== project.id) throw new Error("project_mismatch");
  const currency = String(raw.currency || "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("invalid_currency");
  const period = { start: iso(raw.period?.start, "period_start"), end: iso(raw.period?.end, "period_end") };
  if (period.start >= period.end) throw new Error("invalid_period");
  const subscriptions = normalizeSubscriptions(raw.subscriptions);
  const customerPayments = normalizeCustomerPayments(raw.customerPayments);
  if (!subscriptions && !customerPayments) throw new Error("no_metric_streams");
  return {
    projectId: project.id,
    status: source,
    range,
    currency,
    period,
    updatedAt: iso(raw.updatedAt, "updated_at"),
    subscriptions,
    customerPayments,
  };
}

function adapterConfig(project, env) {
  const url = env[`${project.metricsKey}_METRICS_URL`];
  const token = env[`${project.metricsKey}_METRICS_TOKEN`];
  if (!url || !token) return null;
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error("invalid_adapter_url"); }
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(parsed.hostname);
  if (parsed.protocol !== "https:" && !(isLocal && isLocalHttpMetricsAllowed(env))) throw new Error("adapter_requires_https");
  const allowed = String(env.MERAUNG_METRICS_ALLOWED_HOSTS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(parsed.hostname)) throw new Error("adapter_host_not_allowed");
  return { url: parsed, token };
}

export async function fetchProjectMetrics(project, range, env = process.env, fetchImpl = fetch) {
  let config;
  try { config = adapterConfig(project, env); } catch (error) {
    return { projectId: project.id, status: "unavailable", reason: error.message };
  }
  if (!config) return { projectId: project.id, status: "unavailable", reason: "adapter_not_configured" };
  config.url.searchParams.set("range", range);
  try {
    const response = await fetchImpl(config.url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/json",
        "X-Meraung-Project-ID": project.id,
        "X-Meraung-Schema-Version": "2",
      },
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { projectId: project.id, status: "unavailable", reason: `upstream_${response.status}` };
    return normalizeSnapshot(await response.json(), project, range, "connected");
  } catch (error) {
    const known = ["unsupported_schema_version", "project_mismatch", "invalid_currency", "invalid_period", "no_metric_streams"];
    const safeReason = known.includes(error.message) || error.message.startsWith("invalid_")
      ? error.message : error.name === "TimeoutError" ? "upstream_timeout" : "upstream_error";
    return { projectId: project.id, status: "unavailable", reason: safeReason };
  }
}

const sampleBase = {
  "barber-pro": { s: [245000, 12000, 198000, 7, 24, 4, 1, 2], p: [1860000, 52000, 113, 8, 4, 3] },
  fonkita: { s: [391000, 8000, 249000, 5, 18, 3, 1, 1], p: [7420000, 184000, 254, 19, 11, 8] },
  bizpos: { s: [826000, 31000, 487000, 11, 42, 7, 2, 3], p: [12840000, 263000, 418, 31, 14, 9] },
  mykiosk: { s: [512000, 18000, 321000, 6, 27, 5, 2, 2], p: [9680000, 197000, 336, 23, 9, 7] },
  affilixhq: { s: [278000, 9000, 176000, 4, 15, 3, 1, 1], p: [2340000, 45000, 129, 12, 5, 4] },
  skola: { s: [196000, 4000, 128000, 8, 31, 6, 1, 2], p: [860000, 12000, 71, 4, 3, 2] },
  moto: { s: [143000, 3000, 92000, 9, 38, 8, 2, 3], p: [420000, 5000, 48, 3, 2, 1] },
  kendurikita: { s: [88000, 0, 41000, 3, 7, 2, 0, 1], p: [1170000, 25000, 62, 6, 2, 2] },
  eventsnap2u: { s: [124000, 0, 0, 6, 12, 4, 0, 1], p: [690000, 8000, 39, 4, 2, 1] },
};

export function sampleSnapshot(project, range, now = new Date()) {
  const { s, p } = sampleBase[project.id];
  const scale = { "7d": 0.25, "30d": 1, "90d": 3, ytd: 10 }[range];
  return normalizeSnapshot({
    schemaVersion: 2,
    projectId: project.id,
    currency: "MYR",
    period: periodForRange(range, now),
    updatedAt: now.toISOString(),
    subscriptions: {
      grossReceiptsMinor: Math.round(s[0] * scale), refundsMinor: Math.round(s[1] * scale), mrrMinor: s[2],
      newVendors: Math.round(s[3] * scale), active: s[4], trialing: s[5], pastDue: s[6], canceled: Math.round(s[7] * scale),
    },
    customerPayments: {
      grossVolumeMinor: Math.round(p[0] * scale), refundsMinor: Math.round(p[1] * scale),
      states: { succeeded: Math.round(p[2] * scale), pending: Math.round(p[3] * scale), failed: Math.round(p[4] * scale), refunded: Math.round(p[5] * scale) },
    },
  }, project, range, "sample");
}

function coverage(available, total) {
  return { available, total, partial: available !== total };
}

export function aggregateSnapshots(snapshots, totalProjects) {
  const usable = snapshots.filter((item) => item.status === "connected" || item.status === "sample");
  const currencies = new Set(usable.map((item) => item.currency));
  if (currencies.size > 1) throw new Error("mixed_currencies");
  const subscriptionRows = usable.filter((item) => item.subscriptions);
  const paymentRows = usable.filter((item) => item.customerPayments);
  const sum = (rows, path) => rows.reduce((total, item) => total + path(item), 0);
  const sumOrNull = (rows, path) => rows.length ? sum(rows, path) : null;
  return {
    currency: usable[0]?.currency || "MYR",
    subscriptions: {
      grossReceiptsMinor: sumOrNull(subscriptionRows, (x) => x.subscriptions.grossReceiptsMinor),
      refundsMinor: sumOrNull(subscriptionRows, (x) => x.subscriptions.refundsMinor),
      netReceiptsMinor: sumOrNull(subscriptionRows, (x) => x.subscriptions.netReceiptsMinor),
      mrrMinor: sumOrNull(subscriptionRows, (x) => x.subscriptions.mrrMinor),
      newVendors: sumOrNull(subscriptionRows, (x) => x.subscriptions.newVendors),
      active: sumOrNull(subscriptionRows, (x) => x.subscriptions.active),
      trialing: sumOrNull(subscriptionRows, (x) => x.subscriptions.trialing),
      pastDue: sumOrNull(subscriptionRows, (x) => x.subscriptions.pastDue),
      canceled: sumOrNull(subscriptionRows, (x) => x.subscriptions.canceled),
      coverage: coverage(subscriptionRows.length, totalProjects),
    },
    customerPayments: {
      grossVolumeMinor: sumOrNull(paymentRows, (x) => x.customerPayments.grossVolumeMinor),
      refundsMinor: sumOrNull(paymentRows, (x) => x.customerPayments.refundsMinor),
      netVolumeMinor: sumOrNull(paymentRows, (x) => x.customerPayments.netVolumeMinor),
      transactionCount: sumOrNull(paymentRows, (x) => x.customerPayments.transactionCount),
      states: {
        succeeded: sumOrNull(paymentRows, (x) => x.customerPayments.states.succeeded),
        pending: sumOrNull(paymentRows, (x) => x.customerPayments.states.pending),
        failed: sumOrNull(paymentRows, (x) => x.customerPayments.states.failed),
        refunded: sumOrNull(paymentRows, (x) => x.customerPayments.states.refunded),
      },
      coverage: coverage(paymentRows.length, totalProjects),
    },
    coverage: { connected: usable.length, total: totalProjects, partial: usable.length !== totalProjects },
  };
}
