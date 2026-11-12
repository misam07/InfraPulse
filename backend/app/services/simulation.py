"""
Deterministic time-series simulation (Python port of frontend/lib/data/simulate.ts).

The same seeded generator and the same inputs produce the same numbers as the
frontend did in Phase 1: a mix of two slow sine waves plus noise, clamped to
[0, 100] (or a custom ceiling). When Phase 4 replaces simulation with real
Prometheus metrics, this module is deleted.

All functions are pure — no wall-clock reads — so responses are reproducible
and easy to test.
"""

import math
from dataclasses import dataclass
from datetime import UTC, datetime

from app.schemas.metrics import MetricPoint, TimeRange

# Fixed anchor "now" (Unix ms). Matches Date.parse("2026-11-12T09:00:00Z").
SIMULATION_ANCHOR_MS = int(
    datetime(2026, 11, 12, 9, 0, 0, tzinfo=UTC).timestamp() * 1000
)

_U32 = 0xFFFFFFFF


def _imul(x: int, y: int) -> int:
    """Emulate JS Math.imul: 32-bit truncated multiplication."""
    return (x * y) & _U32


def _hash_seed(key: str) -> int:
    """FNV-1a hash of a string (matches the TypeScript hashSeed)."""
    h = 2166136261
    for byte in key.encode("ascii"):
        h ^= byte
        h = _imul(h, 16777619)
    return h


def mulberry32(seed: int):
    """Seeded PRNG yielding floats in [0, 1). Bit-identical to the TS version."""
    state = seed & _U32

    def rand() -> float:
        nonlocal state
        state = _u32(state + 0x6D2B79F5)
        t = _imul(state ^ (state >> 15), _u32(1 | state))
        t = _u32(_u32(t + _imul(t ^ (t >> 7), _u32(61 | t))) ^ t)
        return _u32(t ^ (t >> 14)) / 4294967296

    return rand


def _u32(x: int) -> int:
    return x & _U32


# Points per window and gap between samples (mirrors the frontend config).
RANGE_CONFIG: dict[TimeRange, tuple[int, int]] = {
    TimeRange.M15: (16, 60_000),
    TimeRange.H1: (32, 2 * 60_000),
    TimeRange.H6: (36, 10 * 60_000),
    TimeRange.H24: (48, 30 * 60_000),
    TimeRange.D7: (56, 3 * 60 * 60_000),
}


@dataclass(frozen=True)
class SeriesOptions:
    key: str
    range: TimeRange
    end_ms: int
    base: float
    amplitude: float
    noise: float
    minimum: float = 0.0
    maximum: float = 100.0
    end_value: float | None = None


def generate_series(options: SeriesOptions) -> list[MetricPoint]:
    """Generate a smooth, deterministic series ending at end_ms."""
    count, interval_ms = RANGE_CONFIG[options.range]
    start_ms = options.end_ms - (count - 1) * interval_ms

    rand = mulberry32(_hash_seed(options.key))
    phase1 = rand() * math.pi * 2
    phase2 = rand() * math.pi * 2

    points: list[MetricPoint] = []
    for i in range(count):
        t = i / (count - 1)
        wave = (
            math.sin(t * math.pi * 2 + phase1) * 0.7
            + math.sin(t * math.pi * 5 + phase2) * 0.3
        )
        jitter = (rand() - 0.5) * 2 * options.noise
        raw = options.base + wave * options.amplitude + jitter
        value = min(options.maximum, max(options.minimum, raw))
        points.append(MetricPoint(timestamp=start_ms + i * interval_ms, value=round(value, 10)))

    if options.end_value is not None:
        points[-1] = MetricPoint(timestamp=points[-1].timestamp, value=options.end_value)
    return points
