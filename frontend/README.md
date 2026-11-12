# InfraPulse Frontend

Next.js 16 (App Router, Cache Components) + React 19 + TypeScript +
Tailwind CSS 4 + Recharts. All data is fetched from the FastAPI backend.

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

Configuration: copy `.env.example` to `.env.local` — `NEXT_PUBLIC_API_URL`
is the backend base URL (default `http://localhost:8000`). Restart the dev
server after changing it (the value is inlined at compile time).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (type-checks and prerenders) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## How data flows

- `lib/api.ts` — `apiGet` client; failures normalize into `ApiError`
  (`status: 0` = backend unreachable).
- `lib/data/*.ts` — async accessors (`getServers`, `getFleetSeries`, …) that
  call `/api/v1/*`; the UI components know nothing about the backend.
- `lib/hooks/use-api.ts` — `useApi(fetcher, deps, intervalMs)` hook:
  fetches on mount/deps change, optional interval polling (15 s on live
  views), and derived `loading`/`error`/`errorStatus` plus a stable `retry`.
- `lib/sim-time.ts` — fixed simulation anchor; `TimeAgo` rebases fixed
  event timestamps onto the real clock after mount, while metric series are
  anchored to real time via the API's `end` parameter.

Pages are server components that export `metadata`; dynamic `[id]` routes
wrap the client detail views in `<Suspense>` and unwrap `params` with
`use()` (Cache Components requirement).
