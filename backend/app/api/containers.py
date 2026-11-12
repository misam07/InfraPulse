"""Docker container monitoring endpoints (read-only)."""

import time

from fastapi import APIRouter, HTTPException, Query

from app.schemas.common import ListResponse
from app.schemas.containers import Container, ContainerSeriesResponse
from app.schemas.metrics import TimeRange
from app.services import fleet

router = APIRouter(prefix="/containers", tags=["containers"])


def _resolve_end(end: int | None) -> int:
    return end if end is not None else int(time.time() * 1000)


@router.get("", response_model=ListResponse[Container])
def list_containers() -> ListResponse[Container]:
    return ListResponse(items=fleet.get_containers())


@router.get("/{container_id}", response_model=Container)
def get_container(container_id: str) -> Container:
    container = fleet.get_container(container_id)
    if container is None:
        raise HTTPException(
            status_code=404, detail=f"Container '{container_id}' not found"
        )
    return container


@router.get("/{container_id}/series", response_model=ContainerSeriesResponse)
def get_container_series(
    container_id: str,
    range_: TimeRange = Query(default=TimeRange.H1, alias="range"),
    end: int | None = Query(default=None, description="Window end (Unix ms)"),
) -> ContainerSeriesResponse:
    container = fleet.get_container(container_id)
    if container is None:
        raise HTTPException(
            status_code=404, detail=f"Container '{container_id}' not found"
        )

    return ContainerSeriesResponse(
        containerId=container_id,
        range=range_,
        series=fleet.get_container_series(container, range_, _resolve_end(end)),
    )
