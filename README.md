# To‘y taklifnomasi — Muhammadmurod va Mehribonu

Сайт-приглашение + приём ответов гостей в Telegram. Размещается на Vercel.

## Что внутри
- `index.html`, `img/`, `fonts/`, `og.jpg` — сам сайт (og.jpg — картинка-превью ссылки).
- `api/rsvp.js` — принимает анкету гостя и отправляет её ботом в Telegram.

## Деплой на Vercel
1. vercel.com → **Add New → Project** → импортировать этот репозиторий.
2. Project Name: `toy-taklifnomasi` (адрес будет `https://toy-taklifnomasi.vercel.app`).
3. Framework Preset: **Other**, остальное по умолчанию.
4. **Environment Variables**:
   - `BOT_TOKEN` — токен бота от @BotFather
   - `ADMIN_CHAT_ID` — Telegram ID получателя ответов (можно несколько через запятую)
5. **Deploy**.

⚠️ Получатель (ADMIN_CHAT_ID) должен один раз открыть бота в Telegram и нажать **START** — иначе Telegram не разрешит боту ему писать.

Если адрес получится другим (имя занято), замените `https://toy-taklifnomasi.vercel.app` в `index.html` (тег `og:image`) на новый адрес — это нужно только для картинки-превью.

## Как поменять тексты
В `index.html` найдите блок `const CONFIG = {` — там имена, дата, адрес, ссылка на карту.
