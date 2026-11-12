# InfraPulse — Development Handoff

Written: 2026-11-12 (end of day, after Phase 2 completion)

---

## 1. Project overview

**InfraPulse** is a self-hosted infrastructure monitoring platform: a
centralized dashboard for monitoring Linux servers and Docker containers.
It is being built phase-by-phase per `PROJECT.md` (the authoritative spec
and roadmap — read it first). Design direction: warm-neutral "precision ops"
look (near-black background, lime accent, warm chart colors) — no
purple/blue themes.

## 2. Current development phase

**Phase 2 — Backend Foundation: COMPLETE, including end-to-end
verification.**

Phases remaining (from PROJECT.md):

| Phase | Name | Status |
|---|---|---|
| 1 | Frontend Foundation | ✅ Complete |
| 2 | Backend Foundation | ✅ Complete (verified) |
| 3 | Database Integration | ⬜ **Next** |
| 4 | Real Infrastructure Monitoring (Prometheus) | ⬜ |
| 5 | Docker Monitoring | ⬜ |
| 6 | Alerting | ⬜ |
| 7 | Authentication and Deployment | ⬜ |

> Note: an earlier planning note said "next task: Phase 2 verification."
> That verification was completed this session (see §10), so the exact
> next task is **Phase 3 — Database Integration** (replace the in-memory
> simulated fleet with PostgreSQL persistence, per PROJECT.md §Phase 3).

## 3. Features implemented so far

**Overview page** — stat blocks (servers by status, avg CPU/memory,
containers running/total, active alerts, network), fleet CPU/memory/disk/
network charts, server health table. Live refresh every 15 s.

**Servers** — card list with status badges and progress bars; detail page
with 4 historical charts (CPU, memory, network in/out, disk), host info,
containers on the host, and the host's alerts. Offline server (srv-06)
shows an "unreachable" empty state instead of charts.

**Containers** — table with server link, state badge, CPU, memory bar,
uptime, restart count; detail page with CPU/memory history charts and info
table. Stopped containers show an empty state and no charts.

**Alerts** — list with All/Active/Resolved filter tabs, severity badges,
current-vs-threshold values, fired/resolved times, server links.

**Settings page** — static placeholder (Phase 3+).

**Cross-cutting** — loading skeletons matching each layout; error card with
"Try again" retry; friendly "cannot reach the API" message when the backend
is down; 404 page for unknown server/container IDs; time-range picker
(15m/1h/6h/24h/7d) re-fetching historical data; `TimeAgo` rebases fixed
simulation timestamps onto the real clock after mount.

## 4. Architecture

### Frontend (Next.js 16 App Router, Cache Components ON)

```
Pages are server components exporting metadata; client feature views are
separate files. Dynamic [id] routes wrap client views in <Suspense> and
unwrap params with use(params) (Next 16 requirement — awaiting params
outside Suspense breaks instant-shell prerendering).
```

Data flow: components → `lib/hooks/use-api.ts` (polling fetch hook) →
`lib/data/*.ts` (async accessors) → `lib/api.ts` (`apiGet` → backend).
Components never touch the API URL directly.

Key conventions (learned this phase):
- No `Math.random`/`Date.now` during render (Cache Components) — seeded
  PRNG and `useNow()` hook instead.
- `error.tsx` uses `retry()`; react-hooks lint forbids sync setState in
  effects and ref writes during render (fetcher ref is updated inside an
  effect; `loading` is derived state).
- `.env.local` change requires a dev-server restart (`NEXT_PUBLIC_*` is
  inlined at compile time).

### Backend (FastAPI)

```
run.py                  dev entrypoint (reads API_HOST/API_PORT)
app/main.py             app factory: CORS, routers, exception handler
app/api/                routers: health, v1/{overview,servers,containers,alerts}
app/core/config.py      pydantic-settings (env/.env driven, lru_cache)
app/schemas/            Pydantic models — camelCase field names to mirror TS types
app/services/fleet.py   simulated fleet + series aggregation (single data source)
app/services/simulation.py  mulberry32 seeded PRNG port of the old TS generator
```

Series are deterministic per (key, range, end) — same request → same
points. Series endpoints take `end` (Unix ms) so the frontend anchors
charts to the real clock. Offline servers/stopped containers return
`series: null`. CORS: GET only, `http://localhost:3000` by default.

## 5. Folder structure

```
Infrapulse/
├── PROJECT.md                 spec + roadmap (authoritative)
├── README.md                  root setup/startup guide (Phase 2)
├── HANDOFF.md                 this file
├── .gitignore                 covers .env*, .venv, node_modules, .next
├── backend/
│   ├── requirements.txt       fastapi, uvicorn[standard], pydantic-settings
│   ├── .env.example           committed config template
│   ├── run.py                 dev entrypoint
│   └── app/  (api/ core/ schemas/ services/)
└── frontend/
    ├── package.json           next 16.4.6, react 19.3, recharts, lucide-react
    ├── .env.local             NEXT_PUBLIC_API_URL=http://localhost:8000 (uncommitted)
    ├── .env.example           committed template
    ├── app/                   routes: /, servers, servers/[id], containers,
    │                          containers/[id], alerts, settings
    ├── components/            dashboard/ charts/ servers/ containers/ alerts/
    │                          layout/ states/ ui/
    ├── lib/                   api.ts, sim-time.ts, format.ts,
    │                          data/{servers,containers,alerts}.ts,
    │                          hooks/{use-api,use-now}.ts
    └── types/index.ts         shared TS types (mirror backend schemas)
```

Not committed to git yet — see §11.

## 6. Technologies and dependencies

| Layer | Tech | Version |
|---|---|---|
| Frontend | Next.js (Turbopack), Cache Components | 16.4.6 |
| | React / React DOM | 19.3.0 |
| | TypeScript | ^5 |
| | Tailwind CSS (via @tailwindcss/turbopack) | 4.3.3 |
| | Recharts | ^3.10.1 |
| | lucide-react (icons) | ^1.72.0 |
| | ESLint + eslint-config-next | ^9 |
| Backend | Python | 3.13.0 |
| | FastAPI | >=0.162,<1 |
| | uvicorn[standard] | >=0.41 |
| | pydantic-settings | >=2 |

Node 20.9+ (22 recommended). Backend venv already created at
`backend/.venv` with deps installed.

## 7. Startup commands

```powershell
# Terminal 1 — backend (from Infrapulse\backend)
.venv\Scripts\python run.py            # add --reload for dev auto-reload
# → http://localhost:8000  (docs at /docs, health at /health)

# Terminal 2 — frontend (from Infrapulse\frontend)
npm run dev
# → http://localhost:3000
```

Venv already exists; if rebuilding from scratch:
`python -m venv .venv` then `.venv\Scripts\pip install -r requirements.txt`.
On Linux/macOS use `.venv/bin/` instead of `.venv\Scripts\`.

## 8. Environment variables

Backend — copy `backend/.env.example` to `backend/.env` (all optional):

| Var | Default | Purpose |
|---|---|---|
| `API_HOST` | `127.0.0.1` | Bind address |
| `API_PORT` | `8000` | Bind port |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `ENVIRONMENT` | `development` | Reported by /health |

Frontend — copy `frontend/.env.example` to `frontend/.env.local`:

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL (no trailing slash) |

No secrets exist in this project yet. `.gitignore` already excludes
`.env`/`.env.local`/`.venv`/`node_modules`/`.next`.

## 9. Current running ports

| Service | Port | Notes |
|---|---|---|
| Backend (FastAPI/uvicorn) | 8000 | started via `run.py`; was running as a session background shell |
| Frontend (Next.js dev) | 3000 | `npm run dev`; same |

Both are dev servers started by the assistant's background shells — they
may or may not still be running after the session ends. **Restart them
manually with the §7 commands.** If a port is taken after an unclean
stop: `Get-NetTCPConnection -LocalPort <port> | Select -ExpandProperty
OwningProcess` then `Stop-Process -Id <pid>`.

## 10. Tests performed and results (Phase 2 verification)

| Test | Result |
|---|---|
| Backend REST checks (health, stats, servers, series 32 pts, alert filter, 404) | ✅ All passed |
| Browser: Overview renders live API data (6 servers, 51.4% avg CPU, 4 alerts, charts) | ✅ Passed, 0 console errors |
| Browser: /servers list, /servers/srv-03 detail (4 charts, 2 containers, critical alert) | ✅ Passed |
| Browser: /servers/srv-06 offline → "unreachable" empty state | ✅ Passed |
| Browser: /containers list + running detail (postgres-primary) + stopped detail (grafana, host resolves to cache-01) | ✅ Passed |
| Browser: /alerts with filter counts 6/4/2 and active/resolved badges | ✅ Passed |
| Browser: /servers/bogus-id → "Page not found" | ✅ Passed |
| Browser: time-range picker click "24h" → `range=24h` fetch | ✅ Passed |
| Failure UX: backend stopped → error card + message; restart + "Try again" → data loads | ✅ Passed |
| `npx tsc --noEmit`, `npm run lint`, `npm run build` (frontend) | ✅ All clean |

## 11. Known issues / unfinished work

- **Not committed to git.** The Infrapulse folder sits inside the user's
  home-directory git repo and is untracked. Recommend (tomorrow): create a
  dedicated git repo in `Infrapulse/` and make an initial commit.
- Data is simulated in-memory (`backend/app/services/fleet.py`); lost on
  restart. Replaced in Phase 3 (PostgreSQL) / Phase 4 (Prometheus).
- Alerts are display-only; threshold evaluation comes in Phase 6.
- Dev-mode React Strict Mode fires each fetch twice (harmless, standard).
- Backend log shows periodic `GET /v1/models` 404s — these come from the
  OpenCode session itself probing the port, not from InfraPulse. Ignorable.
- Settings page is a static placeholder.

## 12. Exact next task

**Phase 3 — Database Integration** (per PROJECT.md):

1. Read PROJECT.md §Phase 3 and re-read this handoff.
2. Set up PostgreSQL (local install or Docker container — user is a
   beginner; explain the choice before installing anything).
3. Introduce persistence: replace `backend/app/services/fleet.py`
   in-memory lists with database tables + a thin data-access layer.
4. Keep the API contract (`/api/v1/*`, camelCase schemas) unchanged so the
   frontend needs no changes.
5. Seed the database with the same fleet data so the UI looks identical.
6. Update READMEs and report what/how-to-test/limitations per PROJECT.md.

Rules from PROJECT.md that still apply: one phase at a time, no premature
features, explain decisions before major changes, update README.md per
phase, report what was done + how to test + limitations.
