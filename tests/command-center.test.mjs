import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createSession, verifyCredentials, verifySession } from "../api/_lib/auth.mjs";
import { aggregateSnapshots, fetchProjectMetrics, normalizeSnapshot, sampleSnapshot, validateRange } from "../api/_lib/metrics.mjs";
import { saasProjects } from "../data/saas-projects.mjs";
import { isDemoModeAllowed, isLocalHttpMetricsAllowed } from "../api/_lib/runtime.mjs";
import commandCenterHandler from "../api/command-center.mjs";

const env = {
  MERAUNG_ADMIN_EMAIL: "owner@example.com",
  MERAUNG_ADMIN_PASSWORD_HASH: createHash("sha256").update("correct horse battery staple").digest("hex"),
  MERAUNG_SESSION_SECRET: "a-local-test-secret-that-is-at-least-32-characters",
};

test("owner credentials and signed session are verified server-side", () => {
  assert.equal(verifyCredentials("OWNER@example.com", "correct horse battery staple", env), true);
  assert.equal(verifyCredentials("owner@example.com", "wrong", env), false);
  const now = Date.UTC(2026, 9, 30, 10);
  const token = createSession("owner@example.com", env, now);
  assert.equal(verifySession(token, env, now + 1_000).email, "owner@example.com");
  assert.equal(verifySession(`${token}x`, env, now + 1_000), null);
  assert.equal(verifySession(token, env, now + 9 * 60 * 60 * 1_000), null);
});

test("metrics normalization separates subscription receipts from customer payment volume", () => {
  const project = saasProjects[0];
  const result = normalizeSnapshot({
    schemaVersion: 2, projectId: project.id, currency: "MYR", updatedAt: "2026-10-30T10:00:00Z",
    period: { start: "2026-10-01T00:00:00Z", end: "2026-10-30T10:00:00Z" },
    subscriptions: { grossReceiptsMinor: 10_000, refundsMinor: 1_500, mrrMinor: 4_000, newVendors: 3, active: 9, trialing: 2, pastDue: 1, canceled: 1 },
    customerPayments: { grossVolumeMinor: 90_000, refundsMinor: 5_000, states: { succeeded: 20, pending: 2, failed: 1, refunded: 1 } },
  }, project, "30d");
  assert.equal(result.subscriptions.netReceiptsMinor, 8_500);
  assert.equal(result.customerPayments.netVolumeMinor, 85_000);
  assert.equal(result.customerPayments.transactionCount, 24);
  assert.throws(() => normalizeSnapshot({
    schemaVersion: 2, projectId: "another-project", currency: "MYR", updatedAt: "2026-10-30T10:00:00Z",
    period: { start: "2026-10-01T00:00:00Z", end: "2026-10-30T10:00:00Z" }, subscriptions: null, customerPayments: null,
  }, project, "30d"), /project_mismatch/);
});

test("portfolio aggregate keeps SaaS receipts and customer payments separate", () => {
  const now = new Date("2026-10-30T10:00:00Z");
  const one = sampleSnapshot(saasProjects[0], "30d", now);
  const two = sampleSnapshot(saasProjects[1], "30d", now);
  const result = aggregateSnapshots([one, two, { projectId: "x", status: "unavailable" }], 3);
  assert.equal(result.subscriptions.netReceiptsMinor, one.subscriptions.netReceiptsMinor + two.subscriptions.netReceiptsMinor);
  assert.equal(result.subscriptions.mrrMinor, one.subscriptions.mrrMinor + two.subscriptions.mrrMinor);
  assert.equal(result.customerPayments.netVolumeMinor, one.customerPayments.netVolumeMinor + two.customerPayments.netVolumeMinor);
  assert.notEqual(result.subscriptions.netReceiptsMinor, result.customerPayments.netVolumeMinor);
  assert.equal(result.coverage.connected, 2);
  assert.equal(result.coverage.partial, true);
  assert.equal(result.subscriptions.coverage.available, 2);
  assert.equal(result.customerPayments.coverage.available, 2);
});

test("missing metric streams remain unavailable and period net may be negative", () => {
  const project = saasProjects[0];
  const paymentOnly = normalizeSnapshot({
    schemaVersion: 2, projectId: project.id, currency: "MYR", updatedAt: "2026-10-30T10:00:00Z",
    period: { start: "2026-10-01T00:00:00Z", end: "2026-10-30T10:00:00Z" },
    subscriptions: null,
    customerPayments: { grossVolumeMinor: 100, refundsMinor: 250, states: { succeeded: 1, pending: 0, failed: 0, refunded: 1 } },
  }, project, "30d");
  assert.equal(paymentOnly.subscriptions, null);
  assert.equal(paymentOnly.customerPayments.netVolumeMinor, -150);
  const aggregate = aggregateSnapshots([paymentOnly], 2);
  assert.equal(aggregate.subscriptions.coverage.available, 0);
  assert.equal(aggregate.customerPayments.coverage.available, 1);
});

test("adapter defaults to unavailable and never invents live values", async () => {
  const result = await fetchProjectMetrics(saasProjects[0], "30d", {});
  assert.deepEqual(result, { projectId: "moto", status: "unavailable", reason: "adapter_not_configured" });
});

test("only supported reporting ranges are accepted", () => {
  assert.equal(validateRange("7d"), "7d");
  assert.equal(validateRange("anything"), "30d");
  assert.equal(validateRange(undefined), "30d");
});

test("demo data and local HTTP adapters fail closed in production", async () => {
  assert.equal(isDemoModeAllowed({ MERAUNG_RUNTIME: "development", MERAUNG_DEMO_MODE: "true" }), true);
  assert.equal(isDemoModeAllowed({ MERAUNG_RUNTIME: "development", MERAUNG_DEMO_MODE: "true", VERCEL_ENV: "production" }), false);
  assert.equal(isDemoModeAllowed({ MERAUNG_DEMO_MODE: "true" }), false);
  assert.equal(isLocalHttpMetricsAllowed({ MERAUNG_RUNTIME: "development", MERAUNG_ALLOW_LOCAL_HTTP_METRICS: "true" }), true);
  assert.equal(isLocalHttpMetricsAllowed({ MERAUNG_RUNTIME: "development", MERAUNG_ALLOW_LOCAL_HTTP_METRICS: "true", NODE_ENV: "production" }), false);
  const project = saasProjects[0];
  const urlKey = `${project.metricsKey}_METRICS_URL`;
  const tokenKey = `${project.metricsKey}_METRICS_TOKEN`;
  const result = await fetchProjectMetrics(project, "30d", {
    [urlKey]: "http://127.0.0.1:9999/metrics",
    [tokenKey]: "test-only",
    MERAUNG_RUNTIME: "production",
  });
  assert.equal(result.reason, "adapter_requires_https");
});

test("every included project has a sample shape but production defaults remain unavailable", async () => {
  assert.equal(saasProjects.length, 9);
  const unavailable = [];
  for (const project of saasProjects) {
    assert.equal(sampleSnapshot(project, "30d", new Date("2026-10-30T10:00:00Z")).status, "sample");
    const result = await fetchProjectMetrics(project, "30d", {});
    assert.equal(result.status, "unavailable");
    unavailable.push(result);
  }
  const aggregate = aggregateSnapshots(unavailable, saasProjects.length);
  assert.equal(aggregate.subscriptions.netReceiptsMinor, null);
  assert.equal(aggregate.customerPayments.netVolumeMinor, null);
  assert.equal(aggregate.customerPayments.states.succeeded, null);
});

test("GitHub order is preserved for the nine eligible SaaS projects", () => {
  assert.deepEqual(saasProjects.map((project) => project.id), [
    "moto", "barber-pro", "bizpos", "mykiosk", "skola", "kendurikita", "eventsnap2u", "fonkita", "affilixhq",
  ]);
});

test("adapter rejects cross-project payloads and sends tenant-bound headers", async () => {
  const project = saasProjects[0];
  let request;
  const result = await fetchProjectMetrics(project, "30d", {
    MOTO_METRICS_URL: "https://metrics.example.test/v2",
    MOTO_METRICS_TOKEN: "server-only-token",
  }, async (url, options) => {
    request = { url: String(url), options };
    return { ok: true, json: async () => ({
      schemaVersion: 2, projectId: "barber-pro", currency: "MYR", updatedAt: "2026-10-30T10:00:00Z",
      period: { start: "2026-10-01T00:00:00Z", end: "2026-10-30T10:00:00Z" },
      subscriptions: null,
      customerPayments: { grossVolumeMinor: 10, refundsMinor: 0, states: { succeeded: 1, pending: 0, failed: 0, refunded: 0 } },
    }) };
  });
  assert.equal(request.options.headers["X-Meraung-Project-ID"], "moto");
  assert.equal(request.options.redirect, "error");
  assert.equal(result.reason, "project_mismatch");
});

test("requesting demo data never bypasses owner authentication", async () => {
  const result = { statusCode: 0, headers: {}, body: "" };
  const res = {
    setHeader(name, value) { result.headers[name] = value; },
    end(body) { result.body = body; },
    set statusCode(value) { result.statusCode = value; },
    get statusCode() { return result.statusCode; },
  };
  await commandCenterHandler({ method: "GET", headers: {}, query: { demo: "1" } }, res);
  assert.equal(result.statusCode, 401);
  assert.deepEqual(JSON.parse(result.body), { error: "authentication_required" });
});
