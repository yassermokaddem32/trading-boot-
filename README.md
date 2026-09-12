# Dashboard Prototype — standalone build

A static, front-end-only React app. Static demo data, no backend, no
database, no wallet/exchange integration, no real financial functionality.
Everything you see (balance, chart, trade history) is hard-coded in
`src/App.jsx`.

## 1. Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## 2. Build the static site

```bash
npm run build
```

This produces a `dist/` folder containing plain HTML/CSS/JS — that folder
is the entire deployable app. `npm run preview` serves it locally if you
want to sanity-check the production build before deploying.

## 3. Get a public HTTPS URL

I can't provision a live URL for you directly — this environment can't
reach hosting providers. But `dist/` is a completely static site, so any
static host works. All of these give you a free HTTPS URL in a few
minutes:

**Netlify (drag-and-drop, no CLI needed)**
1. Run `npm run build`.
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder onto the page.
4. Netlify gives you a URL like `https://random-name.netlify.app`.

**Vercel**
```bash
npm install -g vercel
vercel --prod
```
Vercel prints the deployed HTTPS URL.

**GitHub Pages**
1. Push this project to a GitHub repo.
2. `npm install --save-dev gh-pages`, add `"deploy": "gh-pages -d dist"` to
   `package.json` scripts, then `npm run build && npm run deploy`.
3. Enable Pages in the repo settings, pointed at the `gh-pages` branch.

Any of these satisfy Telegram's requirement that a Mini App URL be served
over HTTPS.

## 4. Register it as a Telegram Mini App

Telegram Mini Apps are configured through **BotFather** — no separate SDK
setup is required beyond what's already in `index.html`
(`telegram-web-app.js`).

1. Message **@BotFather** on Telegram.
2. If you don't already have a bot: `/newbot` and follow the prompts.
3. Run `/newapp`, choose your bot, and when asked for the **Web App URL**,
   paste the HTTPS URL from step 3 (e.g. the Netlify/Vercel URL).
4. To make the app open from a button in the bot's chat (rather than only
   via a slash command), also run `/setmenubutton`, choose your bot, and
   set the same HTTPS URL as the button's Web App URL, with a label like
   "Open Dashboard".
5. Open a chat with your bot in Telegram — you should see the menu button
   (or the app link from `/newapp`) open this exact interface inside
   Telegram.

That's the entire setup. There's no bot backend needed to *display* the
Mini App — BotFather just points Telegram at your static URL. A bot
server process is only required later if you want the bot to respond to
messages/commands or push notifications, which is out of scope for this
prototype.

## 5. What's intentionally not here

- No backend, API, or database.
- No real wallet addresses, QR generation, or file upload — the Deposit
  modal's address and QR box are static placeholders.
- No withdrawal processing — the Withdraw modal only validates input
  client-side and shows a static confirmation screen.
- No Telegram `initData` authentication — the app doesn't identify or
  verify who opened it. `useTelegramWebApp()` in `src/App.jsx` only calls
  Telegram's `ready()`/`expand()` so the app renders correctly inside
  Telegram's UI chrome; it reads no user data.

All of the above is exactly what a real integration phase would add,
once the design itself is approved.
