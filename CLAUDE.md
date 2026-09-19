# CodeCraft: Galactic Developer

Educational coding game. You write real HTML, CSS, and JavaScript in a Monaco editor and watch
it become structures in a 3D space colony. Challenges teach HTML/CSS/JS through colony-building
objectives, with hints, rewards, and progress tracking. Live at
[codecraft-dev.vercel.app](https://codecraft-dev.vercel.app).

## Stack

Next.js 16 (App Router, Turbopack dev), React 19, TypeScript, Tailwind CSS v4, pnpm. Monaco
editor, React Three Fiber / Three.js / React Spring for the 3D colony, Redux Toolkit for state,
XState for game/state machines, Liveblocks + Yjs + PartyKit for optional multiplayer, Arcjet,
Sentry, PostHog, Axiom/Pino logging. Env is validated with `@t3-oss/env-nextjs` in `src/env.ts`.

## Commands

```bash
pnpm dev              # next dev --turbopack
pnpm build            # next build (+ postbuild: next-sitemap)
pnpm start
pnpm lint             # biome lint .
pnpm lint:fix
pnpm format           # biome format --write .
pnpm biome:check
pnpm biome:fix
pnpm test             # jest
pnpm test:watch
pnpm test:coverage
pnpm test:e2e         # playwright
pnpm test:e2e:ui
pnpm analyze          # ANALYZE=true next build
```

Copy `.env.example` to `.env.local` before `pnpm dev`; optional services (PostHog, Sentry,
Liveblocks, Judge0) are documented there.

## Layout

- `src/app` - routes: `api`, `playground`, `privacy`, `terms`
- `src/components` - `achievements`, `analytics`, `dialogue`, `editor`, `game`, `integration`,
  `multiplayer`, `onboarding`, `playground`, `resources`, `ui`
- `src/game` - `mapping`, `systems` (game logic separate from UI)
- `src/store` - Redux Toolkit `slices` and `middleware`
- `src/hooks`, `src/lib`, `src/utils`, `src/data` - each has its own `__tests__`
- `src/middleware.ts` - Next.js middleware
- `party/index.ts` - PartyKit server for multiplayer
- `docs/` - `TECHNICAL_ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `GAME_CODE_MAPPING.md`
  (HTML/CSS-to-game-world mapping rules, matches `src/game/mapping/`)
- `thoughts/` - continuity ledger for this project (gitignored, not tracked)

## Environment variables

Full validated schema in `src/env.ts` (`@t3-oss/env-nextjs`); `.env.example` mirrors it.

- Server: `GROQ_API_KEY` (required), `AXIOM_TOKEN`, `JUDGE0_API_KEY`, `JUDGE0_API_URL`,
  `JUDGE0_RAPIDAPI_HOST`, `LIVEBLOCKS_SECRET_KEY`, `R2_ACCESS_KEY_ID`, `R2_ACCOUNT_ID`,
  `R2_BUCKET_NAME`, `R2_SECRET_ACCESS_KEY`, `SENTRY_AUTH_TOKEN`, `XAPI_LRS_ENDPOINT`,
  `XAPI_LRS_PASSWORD`, `XAPI_LRS_USERNAME`
- Client: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ASSETS_URL`,
  `NEXT_PUBLIC_AXIOM_DATASET`, `NEXT_PUBLIC_DEBUG_MODE`, `NEXT_PUBLIC_ENABLE_ANALYTICS`,
  `NEXT_PUBLIC_ENABLE_MULTIPLAYER`, `NEXT_PUBLIC_ENABLE_SOUND`,
  `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`, `NEXT_PUBLIC_PARTYKIT_HOST`, `NEXT_PUBLIC_POSTHOG_HOST`,
  `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SENTRY_DSN`

## Conventions

- Biome for lint and format (not ESLint, despite `eslint`/`eslint-config-next` being present in
  devDependencies)
- pnpm, with a large `pnpm.overrides` block in `package.json` pinning transitive deps for
  security advisories
- Jest + Testing Library for unit tests (`jest.config.js` uses `next/jest`, jsdom environment,
  `@/*` maps to `src/*`); Playwright for e2e
- No Server Actions in use; data mutation goes through API routes under `src/app/api`

## Claude Code specific

- `.claude/` (gitignored) holds local permissions in a `settings.local.json` a session creates
- Version-matched Next.js docs are bundled at `node_modules/next/dist/docs/`; check there for
  APIs specific to the installed Next.js version before assuming training-data behavior.
