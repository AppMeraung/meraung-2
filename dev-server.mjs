import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import login from "./api/auth/login.mjs";
import logout from "./api/auth/logout.mjs";
import session from "./api/auth/session.mjs";
import commandCenter from "./api/command-center.mjs";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const handlers = new Map([
  ["/api/auth/login", login], ["/api/auth/logout", logout], ["/api/auth/session", session], ["/api/command-center", commandCenter],
]);
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".ico":"image/x-icon" };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (handlers.has(url.pathname)) {
    req.query = Object.fromEntries(url.searchParams);
    return handlers.get(url.pathname)(req, res);
  }
  try {
    let relative = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, "");
    if (!relative || url.pathname.endsWith("/")) relative += "index.html";
    const file = join(root, relative);
    if (!file.startsWith(root)) throw new Error("bad_path");
    if (!(await stat(file)).isFile()) throw new Error("not_file");
    res.setHeader("Content-Type", mime[extname(file)] || "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404; res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}/command-center/?demo=1`));
