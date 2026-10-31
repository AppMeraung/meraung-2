import { clearSessionCookie, isSameOrigin } from "../_lib/auth.mjs";
import { json, methodNotAllowed } from "../_lib/http.mjs";

export default function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return json(res, 403, { error: "invalid_origin" });
  return json(res, 200, { authenticated: false }, { "Set-Cookie": clearSessionCookie(req) });
}
