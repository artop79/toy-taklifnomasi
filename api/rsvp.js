// Приём ответов гостей с сайта-приглашения и отправка их в Telegram.
// Настройки (Vercel → Project → Settings → Environment Variables):
//   BOT_TOKEN      — токен бота от @BotFather
//   ADMIN_CHAT_ID  — Telegram ID получателя (можно несколько через запятую)
// Получатель должен один раз открыть бота и нажать START, иначе Telegram не даст боту ему писать.

const SIDES = { k: "🤵 Kuyov tomoni", n: "👰 Kelin tomoni" };
const EVENTS = { nikoh: "💍 Nikoh to‘yi (23-noyabr, 17:00)", qiz: "🌸 Qiz to‘yi — Mehribonu (23-noyabr, 10:00)" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method" });
  }

  const token = process.env.BOT_TOKEN;
  const chats = String(process.env.ADMIN_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || !chats.length) return res.status(500).json({ ok: false, error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // honeypot: bots fill the hidden "website" field, people don't
  if (body.website) return res.status(200).json({ ok: true });

  const event = EVENTS[body.event] ? body.event : "nikoh";
  const side = body.side === "k" || body.side === "n" ? body.side : null;
  const name = String(body.name || "").replace(/\s+/g, " ").trim().slice(0, 80);
  // the main wedding asks for the guest's side; the bride's celebration does not
  if (name.length < 2 || (event === "nikoh" && !side)) return res.status(400).json({ ok: false, error: "invalid" });

  const when = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const text = `🆕 <b>Yangi mehmon</b>\n${EVENTS[event]}\n👤 ${esc(name)}` + (side ? `\n${SIDES[side]}` : "") + `\n🕒 ${when}`;

  try {
    const results = await Promise.all(
      chats.map((chat_id) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text, parse_mode: "HTML" }),
        }).then((r) => r.json())
      )
    );
    const okCount = results.filter((r) => r.ok).length;
    if (!okCount) {
      console.error("Telegram error", results);
      return res.status(502).json({ ok: false, error: "telegram" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: "network" });
  }
};
