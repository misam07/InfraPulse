"""
Simulated fleet data: servers, containers, alerts, and time series.

This module is the single source of application data for Phase 2.
Phase 3 swaps persistence for PostgreSQL; Phase 4 swaps metrics for
Prometheus queries. Routers never touch the data directly — they call
the functions below.
"""

from app.schemas.alerts import Alert, AlertSeverity, AlertStatus
from app.schemas.containers import Container, ContainerSeries, ContainerState
from app.schemas.metrics import MetricSeries, TimeRange
from app.schemas.servers import (
    FleetSeries,
    OverviewStats,
    Server,
    ServerSeries,
    ServerStatus,
)
from app.services.simulation import SIMULATION_ANCHOR_MS, SeriesOptions, generate_series

HOUR_MS = 60 * 60_000
DAY_MS = 24 * HOUR_MS

# ----------------------------------------------------------------- Servers

SERVERS: list[Server] = [
    Server(
        id="srv-01", name="web-prod-01", ipAddress="10.0.10.11",
        os="Ubuntu 24.04 LTS", status=ServerStatus.ONLINE,
        cpu=42.6, memory=61.3, disk=48.2, networkIn=84.2, networkOut=132.7,
        cores=16, memoryTotalGb=64, diskTotalGb=2000, uptimeHours=3744,
        lastSeen=SIMULATION_ANCHOR_MS - 12_000,
    ),
    Server(
        id="srv-02", name="web-prod-02", ipAddress="10.0.10.12",
        os="Ubuntu 24.04 LTS", status=ServerStatus.ONLINE,
        cpu=36.1, memory=54.8, disk=51.7, networkIn=78.9, networkOut=121.4,
        cores=16, memoryTotalGb=64, diskTotalGb=2000, uptimeHours=3744,
        lastSeen=SIMULATION_ANCHOR_MS - 9_000,
    ),
    Server(
        id="srv-03", name="db-primary", ipAddress="10.0.20.21",
        os="Debian 12", status=ServerStatus.ONLINE,
        cpu=91.4, memory=72.5, disk=63.9, networkIn=210.3, networkOut=95.6,
        cores=32, memoryTotalGb=128, diskTotalGb=4000, uptimeHours=8712,
        lastSeen=SIMULATION_ANCHOR_MS - 14_000,
    ),
    Server(
        id="srv-04", name="db-replica", ipAddress="10.0.20.22",
        os="Debian 12", status=ServerStatus.DEGRADED,
        cpu=67.8, memory=92.1, disk=58.4, networkIn=96.5, networkOut=44.2,
        cores=32, memoryTotalGb=128, diskTotalGb=4000, uptimeHours=2190,
        lastSeen=SIMULATION_ANCHOR_MS - 31_000,
    ),
    Server(
        id="srv-05", name="cache-01", ipAddress="10.0.30.31",
        os="Ubuntu 22.04 LTS", status=ServerStatus.ONLINE,
        cpu=18.9, memory=38.2, disk=22.6, networkIn=46.8, networkOut=38.1,
        cores=8, memoryTotalGb=32, diskTotalGb=512, uptimeHours=5256,
        lastSeen=SIMULATION_ANCHOR_MS - 7_000,
    ),
    Server(
        id="srv-06", name="backup-01", ipAddress="10.0.40.41",
        os="Ubuntu 22.04 LTS", status=ServerStatus.OFFLINE,
        cpu=0.0, memory=0.0, disk=93.8, networkIn=0.0, networkOut=0.0,
        cores=4, memoryTotalGb=16, diskTotalGb=8000, uptimeHours=0,
        lastSeen=SIMULATION_ANCHOR_MS - 3 * HOUR_MS,
    ),
]

# -------------------------------------------------------------- Containers

CONTAINERS: list[Container] = [
    Container(id="7d3f9a2c1e04", name="nginx-proxy", image="nginx:1.27-alpine", state=ContainerState.RUNNING, serverId="srv-01", cpuPercent=4.2, memoryUsedMb=96, memoryLimitMb=512, networkIn=32.4, networkOut=58.9, uptimeHours=3742, restarts=0),
    Container(id="b8e1c4f7a293", name="web-app", image="registry.local/webapp:2.4.1", state=ContainerState.RUNNING, serverId="srv-01", cpuPercent=22.7, memoryUsedMb=742, memoryLimitMb=2048, networkIn=28.1, networkOut=51.3, uptimeHours=3730, restarts=1),
    Container(id="c2a96f4d1b58", name="api-gateway", image="registry.local/api:1.9.0", state=ContainerState.RUNNING, serverId="srv-02", cpuPercent=31.4, memoryUsedMb=1180, memoryLimitMb=2048, networkIn=41.7, networkOut=63.2, uptimeHours=2208, restarts=2),
    Container(id="e5f0b3c8d741", name="worker-queue", image="registry.local/worker:1.3.7", state=ContainerState.RUNNING, serverId="srv-02", cpuPercent=12.9, memoryUsedMb=486, memoryLimitMb=1536, networkIn=8.3, networkOut=12.6, uptimeHours=2208, restarts=0),
    Container(id="f1d8a6e3c092", name="postgres-primary", image="postgres:17.2", state=ContainerState.RUNNING, serverId="srv-03", cpuPercent=68.3, memoryUsedMb=32400, memoryLimitMb=65536, networkIn=190.4, networkOut=82.1, uptimeHours=8709, restarts=1),
    Container(id="a9c3e7f2b516", name="pgbouncer", image="edoburu/pgbouncer:1.24", state=ContainerState.RUNNING, serverId="srv-03", cpuPercent=9.6, memoryUsedMb=210, memoryLimitMb=1024, networkIn=44.2, networkOut=39.8, uptimeHours=8709, restarts=0),
    Container(id="d4b7f1a9e283", name="redis-cache", image="redis:7.4-alpine", state=ContainerState.RUNNING, serverId="srv-05", cpuPercent=6.8, memoryUsedMb=4120, memoryLimitMb=16384, networkIn=31.9, networkOut=27.4, uptimeHours=5254, restarts=0),
    Container(id="8f2d5c0b3a71", name="prometheus", image="prom/prometheus:v3.1.0", state=ContainerState.RUNNING, serverId="srv-05", cpuPercent=14.5, memoryUsedMb=5860, memoryLimitMb=12288, networkIn=12.2, networkOut=6.8, uptimeHours=168, restarts=3),
    Container(id="3e6b9d4f8c25", name="grafana", image="grafana/grafana:11.5.0", state=ContainerState.STOPPED, serverId="srv-05", cpuPercent=0.0, memoryUsedMb=0.0, memoryLimitMb=1024, networkIn=0.0, networkOut=0.0, uptimeHours=0, restarts=11),
    Container(id="5c8a2e1d9f47", name="backup-agent", image="registry.local/backup:0.8.2", state=ContainerState.STOPPED, serverId="srv-06", cpuPercent=0.0, memoryUsedMb=0.0, memoryLimitMb=512, networkIn=0.0, networkOut=0.0, uptimeHours=0, restarts=0),
]

# ------------------------------------------------------------------ Alerts

ALERTS: list[Alert] = [
    Alert(id="al-01", name="High CPU utilization", severity=AlertSeverity.CRITICAL, status=AlertStatus.ACTIVE, serverId="srv-03", metric="CPU utilization", currentValue=91.4, threshold=85, unit="%", triggeredAt=SIMULATION_ANCHOR_MS - 2 * HOUR_MS, resolvedAt=None),
    Alert(id="al-02", name="Memory pressure", severity=AlertSeverity.WARNING, status=AlertStatus.ACTIVE, serverId="srv-04", metric="Memory utilization", currentValue=92.1, threshold=90, unit="%", triggeredAt=SIMULATION_ANCHOR_MS - 6 * HOUR_MS, resolvedAt=None),
    Alert(id="al-03", name="Low disk space", severity=AlertSeverity.WARNING, status=AlertStatus.ACTIVE, serverId="srv-06", metric="Disk utilization", currentValue=93.8, threshold=90, unit="%", triggeredAt=SIMULATION_ANCHOR_MS - 2 * DAY_MS - 5 * HOUR_MS, resolvedAt=None),
    Alert(id="al-04", name="Server unreachable", severity=AlertSeverity.CRITICAL, status=AlertStatus.ACTIVE, serverId="srv-06", metric="Availability", currentValue=0, threshold=0, unit="", triggeredAt=SIMULATION_ANCHOR_MS - 3 * HOUR_MS, resolvedAt=None),
    Alert(id="al-05", name="High CPU utilization", severity=AlertSeverity.WARNING, status=AlertStatus.RESOLVED, serverId="srv-01", metric="CPU utilization", currentValue=87.2, threshold=85, unit="%", triggeredAt=SIMULATION_ANCHOR_MS - DAY_MS - 8 * HOUR_MS, resolvedAt=SIMULATION_ANCHOR_MS - DAY_MS - 2 * HOUR_MS),
    Alert(id="al-06", name="Memory pressure", severity=AlertSeverity.WARNING, status=AlertStatus.RESOLVED, serverId="srv-02", metric="Memory utilization", currentValue=90.4, threshold=90, unit="%", triggeredAt=SIMULATION_ANCHOR_MS - 3 * DAY_MS, resolvedAt=SIMULATION_ANCHOR_MS - 3 * DAY_MS + 2 * HOUR_MS),
]

# ------------------------------------------------------------- Accessors

REPORTING_COLORS = {
    "cpu": "#a3e635",
    "memory": "#d9b457",
    "disk": "#c97b4f",
    "networkIn": "#56a877",
    "networkOut": "#d8c58f",
}


def get_servers() -> list[Server]:
    return SERVERS


def get_server(server_id: str) -> Server | None:
    return next((s for s in SERVERS if s.id == server_id), None)


def get_reporting_servers() -> list[Server]:
    return [s for s in SERVERS if s.status is not ServerStatus.OFFLINE]


def get_overview_stats() -> OverviewStats:
    reporting = get_reporting_servers()
    avg = lambda pick: sum(pick(s) for s in reporting) / len(reporting)  # noqa: E731

    return OverviewStats(
        totalServers=len(SERVERS),
        onlineServers=sum(1 for s in SERVERS if s.status is ServerStatus.ONLINE),
        degradedServers=sum(1 for s in SERVERS if s.status is ServerStatus.DEGRADED),
        offlineServers=sum(1 for s in SERVERS if s.status is ServerStatus.OFFLINE),
        avgCpu=round(avg(lambda s: s.cpu), 1),
        avgMemory=round(avg(lambda s: s.memory), 1),
        totalContainers=len(CONTAINERS),
        runningContainers=sum(1 for c in CONTAINERS if c.state is ContainerState.RUNNING),
        activeAlerts=sum(1 for a in ALERTS if a.status is AlertStatus.ACTIVE),
    )


def get_server_series(
    server: Server, range_: TimeRange, end_ms: int
) -> ServerSeries | None:
    """Historical metrics for one server. None when the server is offline."""
    if server.status is ServerStatus.OFFLINE:
        return None

    def series(metric: str, base: float, amplitude: float, noise: float, end_value: float):
        return generate_series(
            SeriesOptions(
                key=f"{server.id}:{metric}",
                range=range_,
                end_ms=end_ms,
                base=base,
                amplitude=amplitude,
                noise=noise,
                end_value=end_value,
            )
        )

    return ServerSeries(
        cpu=series("cpu", server.cpu, 9, 2.5, server.cpu),
        memory=series("memory", server.memory, 4, 1.2, server.memory),
        disk=series("disk", server.disk, 0.8, 0.3, server.disk),
        networkIn=series("net-in", server.networkIn, 22, 9, server.networkIn),
        networkOut=series("net-out", server.networkOut, 26, 11, server.networkOut),
    )


def get_fleet_series(range_: TimeRange, end_ms: int) -> FleetSeries:
    """Fleet-wide averages (CPU/memory/disk) and summed network traffic."""
    per_server = [
        s
        for s in (
            get_server_series(server, range_, end_ms)
            for server in get_reporting_servers()
        )
        if s is not None
    ]

    def combine(
        pick,  # Callable[[ServerSeries], list[MetricPoint]]
        aggregate: str,
        color: str,
        name: str,
    ) -> MetricSeries:
        base = pick(per_server[0])
        points = []
        for i, point in enumerate(base):
            total = sum(pick(s)[i].value for s in per_server)
            value = (
                round(total / len(per_server), 1)
                if aggregate == "avg"
                else round(total, 1)
            )
            points.append(point.model_copy(update={"value": value}))
        return MetricSeries(name=name, color=color, points=points)

    return FleetSeries(
        cpu=combine(lambda s: s.cpu, "avg", REPORTING_COLORS["cpu"], "Fleet avg CPU %"),
        memory=combine(lambda s: s.memory, "avg", REPORTING_COLORS["memory"], "Fleet avg memory %"),
        disk=combine(lambda s: s.disk, "avg", REPORTING_COLORS["disk"], "Fleet avg disk %"),
        networkIn=combine(lambda s: s.networkIn, "sum", REPORTING_COLORS["networkIn"], "Network in (Mbps)"),
        networkOut=combine(lambda s: s.networkOut, "sum", REPORTING_COLORS["networkOut"], "Network out (Mbps)"),
    )


# Containers

def get_containers() -> list[Container]:
    return CONTAINERS


def get_container(container_id: str) -> Container | None:
    return next((c for c in CONTAINERS if c.id == container_id), None)


def get_containers_by_server(server_id: str) -> list[Container]:
    return [c for c in CONTAINERS if c.serverId == server_id]


def get_container_series(
    container: Container, range_: TimeRange, end_ms: int
) -> ContainerSeries | None:
    """Historical CPU/memory for one container. None when stopped."""
    if container.state is ContainerState.STOPPED:
        return None

    common = {"range": range_, "end_ms": end_ms}
    return ContainerSeries(
        cpu=generate_series(
            SeriesOptions(
                key=f"{container.id}:cpu",
                base=container.cpuPercent,
                amplitude=container.cpuPercent * 0.35,
                noise=container.cpuPercent * 0.12,
                end_value=container.cpuPercent,
                **common,
            )
        ),
        memory=generate_series(
            SeriesOptions(
                key=f"{container.id}:memory",
                base=container.memoryUsedMb,
                amplitude=container.memoryUsedMb * 0.1,
                noise=container.memoryUsedMb * 0.03,
                end_value=container.memoryUsedMb,
                maximum=container.memoryLimitMb,
                **common,
            )
        ),
    )


# Alerts

def get_alerts() -> list[Alert]:
    return ALERTS


def get_alerts_by_server(server_id: str) -> list[Alert]:
    return [a for a in ALERTS if a.serverId == server_id]
