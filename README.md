# CodeCraft: Galactic Developer

> Build a space colony by writing real HTML, CSS, and JavaScript.

Live: https://codecraft-dev-one.vercel.app

## What it does

CodeCraft is an educational coding game. You write real front-end code in a Monaco editor and watch it become structures in a 3D space colony. Challenges teach HTML structure, CSS layout, and JavaScript through colony-building objectives, with hints, rewards, and progress tracking.

## Features

- HTML/CSS/JS challenges with starter templates and validation
- Live 3D colony feedback (React Three Fiber) as you code
- Built-in hints, mastery tracking, and daily streaks
- Optional multiplayer, analytics, and playground routes

## Getting started

```bash
git clone https://github.com/forbiddenlink/codecraft-dev
cd codecraft-dev
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Requires Node 20 or newer (`engines`). Every service in `.env.example` is marked optional: PostHog, Liveblocks, PartyKit, xAPI learning record store, Sentry, Cloudflare R2, Judge0 code execution, Axiom, and feature flags.

## Tech stack

- **Framework:** Next.js (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Editor:** Monaco
- **3D:** Three.js / React Three Fiber
- **State:** Redux Toolkit
- **State machines:** XState
- **Multiplayer (optional):** Liveblocks, Yjs and PartyKit
- **Tests:** Jest and Playwright
- **Lint and format:** Biome
- **Package manager:** pnpm

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm start` | Serve the production build |
| `pnpm build` | Production build (robots and sitemap come from `src/app/robots.ts` and `sitemap.ts`) |
| `pnpm test` | Jest unit tests |
| `pnpm test:e2e` | Playwright e2e |
| `pnpm lint` | Biome lint |
| `pnpm biome:check` | Biome lint and format check |
| `pnpm test:coverage` | Jest with coverage |

## License

MIT. See `LICENSE`.
