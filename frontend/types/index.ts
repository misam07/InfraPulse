/**
 * Shared type definitions for the whole frontend.
 *
 * Every component and data function imports its shapes from here, so a
 * field rename (or a later switch from simulated to real API data) only
 * needs to happen in one place — TypeScript flags every mismatch.
 */

/** Selectable time window for historical charts. */
export type TimeRange = "15m" | "1h" | "6h" | "24h" | "7d";

/** One point of a time series (value sampled at a moment in time). */
export interface MetricPoint {
  /** Unix timestamp in milliseconds. */
  timestamp: number;
  value: number;
}

/** A named, colored series drawn as one line/area on a chart. */
export interface MetricSeries {
  name: string;
  /** Any valid CSS color, e.g. "#38bdf8". */
  color: string;
  points: MetricPoint[];
}

/** Health of a monitored server. */
export type ServerStatus = "online" | "degraded" | "offline";

/** A registered Linux server. */
export interface Server {
  id: string;
  name: string;
  /** Address used for monitoring (IP or hostname). */
  ipAddress: string;
  os: string;
  status: ServerStatus;
  /** Current utilization, in percent. */
  cpu: number;
  memory: number;
  disk: number;
  /** Current network throughput, in Mbps. */
  networkIn: number;
  networkOut: number;
  /** Hardware profile. */
  cores: number;
  memoryTotalGb: number;
  diskTotalGb: number;
  /** How long the machine has been up, in hours. */
  uptimeHours: number;
  /** Last successful metric collection (Unix ms). */
  lastSeen: number;
}

/** Lifecycle state of a Docker container. */
export type ContainerState = "running" | "stopped";

/** A monitored Docker container. */
export interface Container {
  id: string;
  name: string;
  image: string;
  state: ContainerState;
  /** Which server this container runs on. */
  serverId: string;
  /** Current resource usage. */
  cpuPercent: number;
  memoryUsedMb: number;
  memoryLimitMb: number;
  networkIn: number;
  networkOut: number;
  /** How long since the container started, in hours (0 when stopped). */
  uptimeHours: number;
  /** Number of restarts since creation. */
  restarts: number;
}

export type AlertSeverity = "critical" | "warning";

export type AlertStatus = "active" | "resolved";

/** A threshold breach raised against a server metric. */
export interface Alert {
  id: string;
  name: string;
  severity: AlertSeverity;
  status: AlertStatus;
  /** Server the alert refers to. */
  serverId: string;
  /** Human-readable metric label, e.g. "CPU utilization". */
  metric: string;
  /** Observed value when the alert fired. */
  currentValue: number;
  /** Configured threshold that was crossed. */
  threshold: number;
  unit: string;
  triggeredAt: number;
  /** Null while the alert is still active. */
  resolvedAt: number | null;
}

/** Historical metric set for one server, keyed by metric name. */
export interface ServerSeries {
  cpu: MetricPoint[];
  memory: MetricPoint[];
  disk: MetricPoint[];
  networkIn: MetricPoint[];
  networkOut: MetricPoint[];
}

/** Fleet-wide aggregate series returned by the overview endpoint. */
export interface FleetSeries {
  cpu: MetricSeries;
  memory: MetricSeries;
  disk: MetricSeries;
  networkIn: MetricSeries;
  networkOut: MetricSeries;
}

/** Historical metric set for one container. */
export interface ContainerSeries {
  cpu: MetricPoint[];
  memory: MetricPoint[];
}

/** Aggregated numbers shown on the Overview page. */
export interface OverviewStats {
  totalServers: number;
  onlineServers: number;
  degradedServers: number;
  offlineServers: number;
  avgCpu: number;
  avgMemory: number;
  totalContainers: number;
  runningContainers: number;
  activeAlerts: number;
}
