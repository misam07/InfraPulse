"""Server-related schemas (mirrors frontend/types/index.ts)."""

from enum import Enum

from pydantic import BaseModel

from app.schemas.metrics import MetricPoint, MetricSeries


class ServerStatus(str, Enum):
    ONLINE = "online"
    DEGRADED = "degraded"
    OFFLINE = "offline"


class Server(BaseModel):
    """A registered Linux server with its current reading."""

    id: str
    name: str
    ipAddress: str
    os: str
    status: ServerStatus
    cpu: float
    memory: float
    disk: float
    networkIn: float
    networkOut: float
    cores: int
    memoryTotalGb: int
    diskTotalGb: int
    uptimeHours: float
    lastSeen: int


class OverviewStats(BaseModel):
    """Aggregated numbers for the Overview page."""

    totalServers: int
    onlineServers: int
    degradedServers: int
    offlineServers: int
    avgCpu: float
    avgMemory: float
    totalContainers: int
    runningContainers: int
    activeAlerts: int


class ServerSeries(BaseModel):
    """Historical metric points for one server."""

    cpu: list[MetricPoint]
    memory: list[MetricPoint]
    disk: list[MetricPoint]
    networkIn: list[MetricPoint]
    networkOut: list[MetricPoint]


class FleetSeries(BaseModel):
    """Fleet-wide aggregate series for the Overview charts."""

    cpu: MetricSeries
    memory: MetricSeries
    disk: MetricSeries
    networkIn: MetricSeries
    networkOut: MetricSeries


class ServerSeriesResponse(BaseModel):
    """Reply for the per-server series endpoint (null when offline)."""

    serverId: str
    range: str
    series: ServerSeries | None
