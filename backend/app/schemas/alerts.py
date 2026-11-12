"""Alert-related schemas (mirrors frontend/types/index.ts)."""

from enum import Enum

from pydantic import BaseModel


class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"


class Alert(BaseModel):
    """A threshold breach raised against a server metric."""

    id: str
    name: str
    severity: AlertSeverity
    status: AlertStatus
    serverId: str
    metric: str
    currentValue: float
    threshold: float
    unit: str
    triggeredAt: int
    resolvedAt: int | None
