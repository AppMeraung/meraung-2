import { createSession, isSameOrigin, sessionCookie, verifyCredentials } from "../_lib/auth.mjs";
import { json, methodNotAllowed, readJsonBody } from "../_lib/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "invalid_origin" });
  try {
    const { email, password } = await readJsonBody(req);
    if (!verifyCredentials(email, password)) return json(res, 401, { error: "invalid_credentials" });
    const token = createSession(String(email).trim().toLowerCase());
    return json(res, 200, { authenticated: true }, { "Set-Cookie": sessionCookie(token, req) });
  } catch (error) {
    const status = error.message === "auth_not_configured" ? 503 : 400;
    return json(res, status, { error: error.message === "auth_not_configured" ? "auth_not_configured" : "invalid_request" });
  }
}
