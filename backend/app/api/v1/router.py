"""Aggregated v1 API router mounted by the application factory."""

from fastapi import APIRouter

from app.api import alerts, containers, overview, servers

api_router = APIRouter()
api_router.include_router(overview.router)
api_router.include_router(servers.router)
api_router.include_router(containers.router)
api_router.include_router(alerts.router)
