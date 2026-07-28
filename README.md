# CodeCraft: Galactic Developer

> Build a space colony by writing real HTML, CSS, and JavaScript.

[![Live Demo](https://img.shields.io/badge/Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://codecraft-dev.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## What It Does

CodeCraft is an educational coding game. You write real front-end code in a Monaco editor and watch it become structures in a 3D space colony. Challenges teach HTML structure, CSS layout, and JavaScript through colony-building objectives — with hints, rewards, and progress tracking.

## Features

- HTML/CSS/JS challenges with starter templates and validation
- Live 3D colony feedback (React Three Fiber) as you code
- Built-in hints, mastery tracking, and daily streaks
- Optional multiplayer, analytics, and playground routes

## Getting Started

```bash
git clone https://github.com/forbiddenlink/codecraft-dev
cd codecraft-dev
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Optional services (PostHog, Sentry, Liveblocks, Judge0) are documented in `.env.example`.

## Tech Stack

- **Framework:** Next.js (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Editor:** Monaco
- **3D:** Three.js / React Three Fiber
- **State:** Redux Toolkit
- **Package manager:** pnpm

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build + sitemap |
| `pnpm test` | Jest unit tests |
| `pnpm test:e2e` | Playwright e2e |
| `pnpm lint` | Biome lint |
