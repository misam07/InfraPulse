"""FastAPI application factory."""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.v1.router import api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        summary="Self-hosted infrastructure monitoring platform.",
        version="0.2.0",
        # Interactive API docs at /docs (Swagger UI) and /redoc
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Allow the configured frontend origins to call the API during development.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    # Liveness at the root level (used by Docker health checks in Phase 7).
    app.include_router(health_router)
    # Versioned API surface.
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Last-resort handler: log the traceback, return a clean error body."""
        logger = logging.getLogger(settings.app_name)
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    logging.basicConfig(level=settings.log_level.upper())
    logging.getLogger(settings.app_name).info(
        "Starting %s (%s) — CORS origins: %s",
        settings.app_name,
        settings.environment,
        settings.cors_origin_list,
    )
    return app


app = create_app()
