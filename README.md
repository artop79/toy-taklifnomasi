# To‘y taklifnomasi — Muhammadmurod va Mehribonu

Сайт-приглашение + приём ответов гостей в Telegram.

## Что внутри
- `index.html`, `img/`, `fonts/`, `og.jpg` — сам сайт (og.jpg — картинка-превью ссылки).
- `server.js` — сервер: отдаёт сайт и принимает анкеты (`POST /api/rsvp`).
- `api/rsvp.js` — отправляет анкету гостя ботом в Telegram.

## Деплой на Railway
1. railway.com → **New Project → Deploy from GitHub repo** → `toy-taklifnomasi`.
2. В сервисе → **Variables** → добавить:
   - `BOT_TOKEN` — токен бота от @BotFather
   - `ADMIN_CHAT_ID` — Telegram ID получателя ответов (можно несколько через запятую)
3. **Settings → Networking → Generate Domain** → при желании изменить имя на `toy-taklifnomasi` → адрес `https://toy-taklifnomasi.up.railway.app`.
4. Railway сам соберёт и запустит (`npm start`). Каждый push в `main` — автоматическое обновление.

⚠️ Получатель (ADMIN_CHAT_ID) должен один раз открыть бота в Telegram и нажать **START** — иначе Telegram не разрешит боту ему писать.

## Как поменять тексты
В `index.html` найдите блок `const CONFIG = {` — там имена, дата, адрес, ссылка на карту.
