import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "meraung_owner_session";
const SESSION_SECONDS = 60 * 60 * 8;

const b64url = (value) => Buffer.from(value).toString("base64url");
const fromB64url = (value) => Buffer.from(value, "base64url").toString("utf8");
const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
};

export function authConfig(env = process.env) {
  const email = String(env.MERAUNG_ADMIN_EMAIL || "").trim().toLowerCase();
  const passwordHash = String(env.MERAUNG_ADMIN_PASSWORD_HASH || "").trim().toLowerCase();
  const secret = String(env.MERAUNG_SESSION_SECRET || "");
  if (!email || !/^[a-f0-9]{64}$/.test(passwordHash) || secret.length < 32) return null;
  return { email, passwordHash, secret };
}

export function verifyCredentials(email, password, env = process.env) {
  const config = authConfig(env);
  if (!config || typeof password !== "string") return false;
  const suppliedEmail = String(email || "").trim().toLowerCase();
  const suppliedHash = createHash("sha256").update(password).digest("hex");
  return safeEqual(suppliedEmail, config.email) && safeEqual(suppliedHash, config.passwordHash);
}

export function createSession(email, env = process.env, now = Date.now()) {
  const config = authConfig(env);
  if (!config) throw new Error("auth_not_configured");
  const payload = b64url(JSON.stringify({ sub: email, iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + SESSION_SECONDS }));
  const signature = createHmac("sha256", config.secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(token, env = process.env, now = Date.now()) {
  const config = authConfig(env);
  if (!config || typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", config.secret).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(fromB64url(payload));
    if (parsed.sub !== config.email || !Number.isInteger(parsed.exp) || parsed.exp <= Math.floor(now / 1000)) return null;
    return { email: parsed.sub, expiresAt: new Date(parsed.exp * 1000).toISOString() };
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = String(req.headers?.cookie || "");
  return Object.fromEntries(header.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const i = part.indexOf("=");
    return [decodeURIComponent(i < 0 ? part : part.slice(0, i)), decodeURIComponent(i < 0 ? "" : part.slice(i + 1))];
  }));
}

export function getSession(req, env = process.env, now = Date.now()) {
  return verifySession(parseCookies(req)[COOKIE_NAME], env, now);
}

export function sessionCookie(token, req) {
  const host = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "");
  const secure = !/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(req) {
  const host = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "");
  const secure = !/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function isSameOrigin(req) {
  const origin = String(req.headers?.origin || "");
  const host = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
