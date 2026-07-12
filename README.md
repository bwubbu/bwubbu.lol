# bwubbu.lol

Static portfolio built with Astro. Retro 8-bit, dark theme, React island for the animated hero.

## Stack

- **Astro** — static site generator, ships zero JS except islands
- **React** — used only for the animated `Hero` component (`client:load`)
- **Tailwind** — styling, custom 8-bit palette in `tailwind.config.mjs`
- Fonts: `Press Start 2P` (headings), `IBM Plex Mono` (body), via Google Fonts

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

It auto-appears on the homepage and gets its own page at `/projects/my-thing`.
Frontmatter is type-checked by the schema in `src/content/config.ts`.

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

## Structure

```
src/
  components/   Hero.tsx (React island), ProjectCard.astro (static)
  content/      projects/*.md  + config.ts (schema)
  layouts/      Base.astro
  pages/        index.astro, projects/[slug].astro
  styles/       global.css (CRT overlay, fonts)
public/         favicon.svg, static assets
```
