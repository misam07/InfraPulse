"""Container-related schemas (mirrors frontend/types/index.ts)."""

from enum import Enum

from pydantic import BaseModel

from app.schemas.metrics import MetricPoint


class ContainerState(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"


class Container(BaseModel):
    """A monitored Docker container with its current reading."""

    id: str
    name: str
    image: str
    state: ContainerState
    serverId: str
    cpuPercent: float
    memoryUsedMb: float
    memoryLimitMb: float
    networkIn: float
    networkOut: float
    uptimeHours: float
    restarts: int


class ContainerSeries(BaseModel):
    """Historical metric points for one container."""

    cpu: list[MetricPoint]
    memory: list[MetricPoint]


class ContainerSeriesResponse(BaseModel):
    """Reply for the per-container series endpoint (null when stopped)."""

    containerId: str
    range: str
    series: ContainerSeries | None
