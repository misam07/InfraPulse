"""Overview endpoints: aggregate stats and fleet-wide series."""

import time

from fastapi import APIRouter, Query

from app.schemas.metrics import TimeRange
from app.schemas.servers import FleetSeries, OverviewStats
from app.services import fleet

router = APIRouter(prefix="/overview", tags=["overview"])


def _resolve_end(end: int | None) -> int:
    """Use the caller-provided window end, or the current wall clock (Unix ms)."""
    return end if end is not None else int(time.time() * 1000)


@router.get("/stats", response_model=OverviewStats)
def get_stats() -> OverviewStats:
    return fleet.get_overview_stats()


@router.get("/series", response_model=FleetSeries)
def get_series(
    range_: TimeRange = Query(default=TimeRange.H1, alias="range"),
    end: int | None = Query(default=None, description="Window end (Unix ms)"),
) -> FleetSeries:
    return fleet.get_fleet_series(range_, _resolve_end(end))
