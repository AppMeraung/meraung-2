import { authConfig, getSession } from "../_lib/auth.mjs";
import { json, methodNotAllowed } from "../_lib/http.mjs";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!authConfig()) return json(res, 503, { authenticated: false, error: "auth_not_configured" });
  const session = getSession(req);
  return json(res, 200, session ? { authenticated: true, user: session } : { authenticated: false });
}
