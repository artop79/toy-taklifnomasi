// Сервер для Railway (или любого хостинга с Node.js 18+): отдаёт сайт и принимает анкеты гостей.
// Переменные окружения: BOT_TOKEN, ADMIN_CHAT_ID (см. api/rsvp.js), PORT задаёт сам Railway.
const http = require("http");
const fs = require("fs");
const path = require("path");
const rsvp = require("./api/rsvp.js");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".webp": "image/webp", ".jpg": "image/jpeg",
  ".woff2": "font/woff2", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
};
const PUBLIC_DIRS = ["img", "fonts"];
const PUBLIC_FILES = ["index.html", "og.jpg"];

// --- simple per-IP rate limit for the form: 8 submissions / 10 minutes
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 8;
}

function withHelpers(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(o)); };
  return res;
}

function siteUrl(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  withHelpers(res);

  if (url.pathname === "/api/rsvp") {
    if (req.method === "POST" && limited(ip)) return res.status(429).json({ ok: false, error: "rate_limited" });
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 10000) req.destroy(); });
    req.on("end", () => {
      try { req.body = JSON.parse(body || "{}"); } catch { req.body = {}; }
      Promise.resolve(rsvp(req, res)).catch((e) => { console.error(e); res.status(500).json({ ok: false }); });
    });
    return;
  }

  if (url.pathname === "/health") return res.status(200).json({ ok: true });

  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  const top = rel.split("/")[0];
  if (!(PUBLIC_FILES.includes(rel) || (PUBLIC_DIRS.includes(top) && rel.split("/").length === 2))) rel = "index.html";
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) return res.status(400).end();

  fs.readFile(file, (err, data) => {
    if (err) return res.status(404).end("Not found");
    const ext = path.extname(file);
    res.setHeader("Content-Type", TYPES[ext] || "application/octet-stream");
    if (ext === ".html") {
      res.setHeader("Cache-Control", "no-cache");
      data = data.toString("utf8").replace(/__SITE_URL__/g, siteUrl(req));
    } else {
      res.setHeader("Cache-Control", "public, max-age=604800");
    }
    res.end(data);
  });
}).listen(PORT, "0.0.0.0", () => console.log(`toy-taklifnomasi: http://0.0.0.0:${PORT}`));
