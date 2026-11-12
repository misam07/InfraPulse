# InfraPulse Backend

FastAPI service that provides all dashboard data (`/api/v1/*`). Data is
simulated in-memory until Phase 3 (PostgreSQL) and Phase 4 (Prometheus).

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt   # Windows; .venv/bin/ on Linux/macOS
.venv\Scripts\python run.py                     # add --reload during development
```

- API base: <http://localhost:8000>
- Interactive docs: <http://localhost:8000/docs> (Swagger) and `/redoc`
- Liveness: <http://localhost:8000/health>

## Configuration

Copy `.env.example` to `.env` (all values optional; defaults shown there):

| Variable | Default | Purpose |
|---|---|---|
| `API_HOST` | `127.0.0.1` | Bind address |
| `API_PORT` | `8000` | Bind port |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins (GET only) |
| `ENVIRONMENT` | `development` | Shown in `/health` |

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness probe |
| GET | `/api/v1/overview/stats` | Aggregated fleet numbers |
| GET | `/api/v1/overview/series?range=&end=` | Fleet-wide series (avg CPU/mem/disk, summed network) |
| GET | `/api/v1/servers` · `/api/v1/servers/{id}` | Server list / detail |
| GET | `/api/v1/servers/{id}/containers` | Containers on one server |
| GET | `/api/v1/servers/{id}/series?range=&end=` | Historical metrics (`series: null` when offline) |
| GET | `/api/v1/containers` · `/api/v1/containers/{id}` | Container list / detail |
| GET | `/api/v1/containers/{id}/series?range=&end=` | CPU/memory history (`series: null` when stopped) |
| GET | `/api/v1/alerts?status=active\|resolved` | Alert list with optional filter |

`range` is one of `15m, 1h, 6h, 24h, 7d`; `end` is a Unix-ms timestamp the
window ends at (omit to use the current wall clock).

## Layout

```
app/
├── api/          # Routers: health + /api/v1 (overview, servers, containers, alerts)
├── core/         # Settings (pydantic-settings, env/.env driven)
├── schemas/      # Pydantic response models (camelCase, mirrors frontend types)
└── services/     # fleet.py (data + aggregation), simulation.py (seeded PRNG)
run.py            # Dev entrypoint reading API_HOST/API_PORT
```

Series are deterministic: the same key, range, and `end` always produce the
same points (mulberry32 PRNG seeded per-metric), so responses are cacheable
and testable.
