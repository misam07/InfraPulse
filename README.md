# InfraPulse

Self-hosted infrastructure monitoring platform — a centralized dashboard for
monitoring Linux servers and Docker containers.

See [PROJECT.md](PROJECT.md) for the full specification and roadmap.
For the current development state and how to resume work, see
[HANDOFF.md](HANDOFF.md).

## Status: Phase 2 — Backend Foundation (complete)

The dashboard now runs on a **FastAPI backend**: overview metrics, server
management, container monitoring, alert display, and historical charts are all
served from `/api/v1/*` endpoints, with loading skeletons, error/retry states,
and 15-second live polling on the frontend. Data is still **simulated** (the
seeded generator now lives in the backend) — PostgreSQL comes in Phase 3 and
real Prometheus metrics in Phase 4.

## Quick start

Requirements: Node.js 20.9+ and Python 3.12+.

**1. Backend** (from `backend/`):

```bash
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt   # Windows
.venv\Scripts\python run.py
```

API serves <http://localhost:8000> — interactive docs at `/docs`. On Linux/macOS
use `.venv/bin/...` instead of `.venv\Scripts\...`.

**2. Frontend** (from `frontend/`):

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Copy `frontend/.env.example` to
`frontend/.env.local` to point `NEXT_PUBLIC_API_URL` elsewhere
(default `http://localhost:8000`).

## Commands

| Where | Command | Purpose |
|---|---|---|
| `backend/` | `.venv\Scripts\python run.py` | Start the API (reads `API_HOST`/`API_PORT` from `.env`) |
| `backend/` | `... python run.py --reload` | Start with auto-reload for development |
| `frontend/` | `npm run dev` | Next.js dev server (http://localhost:3000) |
| `frontend/` | `npm run build` | Production build (type-checks and prerenders) |
| `frontend/` | `npm run lint` | ESLint checks |

## Structure

```
frontend/        Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Recharts
backend/         FastAPI + Pydantic (app/api, app/schemas, app/services)
monitoring/      (Phase 4) Prometheus + exporters
docker-compose.yml  (Phase 7)
```

- `backend/app/services/fleet.py` — simulated fleet (servers, containers,
  alerts) and series aggregation; the single data source until Phase 3/4.
- `backend/app/services/simulation.py` — deterministic seeded time-series
  generator; deleted in Phase 4 when Prometheus replaces simulation.
- `frontend/lib/data/*.ts` — async data accessors that call the API, behind
  the same function signatures the UI components consume.
- `frontend/lib/hooks/use-api.ts` — polling fetch hook with loading/error/retry.
