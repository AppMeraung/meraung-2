export function isProductionRuntime(env = process.env) {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production" || env.MERAUNG_RUNTIME === "production";
}

// Demo data is opt-in twice and is always disabled by any production marker.
export function isDemoModeAllowed(env = process.env) {
  return env.MERAUNG_RUNTIME === "development"
    && env.MERAUNG_DEMO_MODE === "true"
    && !isProductionRuntime(env);
}

// HTTP metrics URLs are permitted only for an explicitly enabled local dev process.
export function isLocalHttpMetricsAllowed(env = process.env) {
  return env.MERAUNG_RUNTIME === "development"
    && env.MERAUNG_ALLOW_LOCAL_HTTP_METRICS === "true"
    && !env.VERCEL_ENV
    && !isProductionRuntime(env);
}
