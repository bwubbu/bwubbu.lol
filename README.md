# bwubbu.lol

Static portfolio built with Astro, styled as **bwubbuOS xp** — a Windows
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
  content/      projects/*.md  + config.ts (schema)
  layouts/      Base.astro (head + Bliss background)
  pages/        index.astro    — the whole desktop + windowing script
                projects/[slug].astro — deep-link page per project
  styles/       global.css     — the entire XP (Luna) theme
public/         favicon.svg
```

Things you'll want to personalise, all in `src/pages/index.astro`:
the `EMAIL` and `GITHUB` constants at the top, the `about.txt` Notepad
text, and the Recycle Bin easter-egg files.

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
