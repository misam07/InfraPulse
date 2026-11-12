"""Shared schema pieces: metrics and time ranges."""

from enum import Enum

from pydantic import BaseModel


class TimeRange(str, Enum):
    """Selectable historical window. Values match the frontend union type."""

    M15 = "15m"
    H1 = "1h"
    H6 = "6h"
    H24 = "24h"
    D7 = "7d"


class MetricPoint(BaseModel):
    """One sample of a metric at a moment in time (Unix ms)."""

    timestamp: int
    value: float


class MetricSeries(BaseModel):
    """A named, colored series drawn as one line on a chart."""

    name: str
    color: str
    points: list[MetricPoint]
