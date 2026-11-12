"""Server management + metrics endpoints."""

import time

from fastapi import APIRouter, HTTPException, Query

from app.schemas.common import ListResponse
from app.schemas.containers import Container
from app.schemas.metrics import TimeRange
from app.schemas.servers import Server, ServerSeriesResponse
from app.services import fleet

router = APIRouter(prefix="/servers", tags=["servers"])


def _resolve_end(end: int | None) -> int:
    return end if end is not None else int(time.time() * 1000)


@router.get("", response_model=ListResponse[Server])
def list_servers() -> ListResponse[Server]:
    return ListResponse(items=fleet.get_servers())


@router.get("/{server_id}", response_model=Server)
def get_server(server_id: str) -> Server:
    server = fleet.get_server(server_id)
    if server is None:
        raise HTTPException(status_code=404, detail=f"Server '{server_id}' not found")
    return server


@router.get("/{server_id}/containers", response_model=ListResponse[Container])
def list_server_containers(server_id: str) -> ListResponse[Container]:
    if fleet.get_server(server_id) is None:
        raise HTTPException(status_code=404, detail=f"Server '{server_id}' not found")
    return ListResponse(items=fleet.get_containers_by_server(server_id))


@router.get("/{server_id}/series", response_model=ServerSeriesResponse)
def get_server_series(
    server_id: str,
    range_: TimeRange = Query(default=TimeRange.H1, alias="range"),
    end: int | None = Query(default=None, description="Window end (Unix ms)"),
) -> ServerSeriesResponse:
    server = fleet.get_server(server_id)
    if server is None:
        raise HTTPException(status_code=404, detail=f"Server '{server_id}' not found")

    return ServerSeriesResponse(
        serverId=server_id,
        range=range_,
        series=fleet.get_server_series(server, range_, _resolve_end(end)),
    )
