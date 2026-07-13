# bwubbu.lol

Static portfolio built with Astro, styled as **blubOS xp** — a Windows
XP-era desktop. Boot screen, Bliss-style wallpaper, draggable windows,
taskbar, start menu, balloon tips, error-dialog easter eggs.

All chrome is hand-rolled CSS/SVG (no Microsoft assets), all fonts are
system fonts (Tahoma / Trebuchet MS), and the only dependency is Astro
itself. The whole windowing system is one vanilla `<script>` — no
framework ships to the browser.

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
```

## Adding a project

Create a new markdown file in `src/content/projects/`, e.g. `my-thing.md`:

```md
---
title: "My Thing"
summary: "One-line pitch."
tech: ["Rust", "WASM"]
repo: "https://github.com/bwubbu/my-thing"
demo: "https://my-thing.bwubbu.lol"
featured: false
date: 2026-07-01
---

## What it is
...
```

It appears as a file in the **My Projects** Explorer window and opens in
its own window on double-click. It also gets a static deep-link page at
`/projects/my-thing` (styled as a lone XP window) for sharing and SEO.
Frontmatter is type-checked by the schema in `src/content/config.ts`.

## Where things live

```text
src/
  components/   XpWindow (window chrome) · Icon (XP icon set) · Boot ·
                Blubamp (spotify widget) · Taskbar · StartMenu ·
                BrowserWindow (the about.html page) · ProjectsExplorer
  content/      projects/*.md  + config.ts (schema)
  layouts/      Base.astro (head + Bliss background)
  pages/        index.astro    — composes the desktop from components
                projects/[slug].astro — deep-link page per project
  scripts/      desktop.ts     — windowing + all desktop behaviour
  styles/       global.css     — the entire XP (Luna) theme
api/            now-playing.js — Vercel serverless fn for the widget
scripts/        spotify-token.mjs — one-time Spotify token helper
public/         favicon.svg
```

Things you'll want to personalise: the `EMAIL` and `GITHUB` constants
at the top of `src/pages/index.astro`, and everything inside
`src/components/BrowserWindow.astro` (the profile page content).

## Spotify widget (blubamp)

The desktop has a Winamp-style widget that shows what you're currently
playing on Spotify (or your last-played track). It's powered by one Vercel
serverless function, `api/now-playing.js` — the Astro site stays fully
static. Without configuration (and on `npm run dev`, which doesn't serve
`api/`), the widget just shows "nothing playing rn".

One-time setup:

1. Create an app at developer.spotify.com/dashboard with redirect URI
   `http://127.0.0.1:8888/callback`, and note the Client ID and Secret.
2. Run `node scripts/spotify-token.mjs <client_id> <client_secret>`,
   open the URL it prints, approve — it prints your refresh token.
3. In Vercel: Settings -> Environment Variables, add
   `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`,
   then redeploy.

The app can stay in Spotify's "development mode" — only your own account
is read. Never commit the secret or token; they live only in Vercel.

## Deploy to Vercel

1. Push this repo to GitHub.
2. On vercel.com: New Project -> import the repo. Astro is auto-detected
   (build `astro build`, output `dist`). No config needed.
3. Every push to `main` redeploys; every branch/PR gets a preview URL.

## Point bwubbu.lol at Vercel

1. In Vercel project: Settings -> Domains -> add `bwubbu.lol`.
2. Vercel shows you DNS records. In Porkbun (your registrar), either:
   - set the **A record** for `@` to Vercel's IP, and a **CNAME** for `www`
     to `cname.vercel-dns.com`, OR
   - change Porkbun's nameservers to Vercel's (simplest for apex domains).
3. HTTPS is issued automatically once DNS resolves.
