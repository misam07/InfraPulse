"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Bell, ChevronLeft } from "lucide-react";
import type { TimeRange } from "@/types";
import { useApi } from "@/lib/hooks/use-api";
import { useNow } from "@/lib/hooks/use-now";
import { formatPercent, formatUptime } from "@/lib/format";
import {
  getContainersByServer,
  getServer,
  getServerSeries,
} from "@/lib/data/servers";
import { getAlerts } from "@/lib/data/alerts";
import { TimeRangePicker } from "@/components/charts/time-range-picker";
import { MetricChart } from "@/components/charts/metric-chart";
import { Badge, Card, CardHeader, Skeleton } from "@/components/ui";
import { ServerStatusBadge } from "@/components/servers/status-badges";
import { EmptyState } from "@/components/states/empty-state";
import { LoadError } from "@/components/states/load-error";
import { TimeAgo } from "@/components/ui/time-ago";

interface ServerDetailProps {
  serverId: string;
}

/**
 * Server detail view. Fetches the server, its series, containers and
 * alerts from the API; historical charts refresh every 15 s.
 */
export function ServerDetail({ serverId }: ServerDetailProps) {
  const now = useNow();
  const [range, setRange] = useState<TimeRange>("1h");

  const serverApi = useApi(() => getServer(serverId), [serverId]);
  const seriesApi = useApi(
    () => getServerSeries(serverId, range, Date.now()),
    [serverId, range],
    15_000
  );
  const containersApi = useApi(() => getContainersByServer(serverId), [serverId]);
  const alertsApi = useApi(getAlerts, []);

  const server = serverApi.data;
  const series = seriesApi.data;
  const containers = containersApi.data;
  const alerts = alertsApi.data?.filter((a) => a.serverId === serverId) ?? [];

  // Unknown server → route not-found page.
  if (serverApi.errorStatus === 404) {
    notFound();
  }

  if (serverApi.error && !server) {
    return <LoadError message={serverApi.error} retry={serverApi.retry} />;
  }

  if (!server) {
    return <ServerDetailSkeleton />;
  }

  const hostInfo = [
    ["Operating system", server.os],
    ["Cores", String(server.cores)],
    ["Memory", `${server.memoryTotalGb} GB`],
    [
      "Disk",
      server.diskTotalGb >= 1024
        ? `${(server.diskTotalGb / 1024).toFixed(0)} TB`
        : `${server.diskTotalGb} GB`,
    ],
    ["Uptime", formatUptime(server.uptimeHours)],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb header */}
      <div>
        <Link
          href="/servers"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Servers
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {server.name}
          </h1>
          <span className="font-mono text-sm text-muted">{server.ipAddress}</span>
          <ServerStatusBadge status={server.status} />
        </div>
      </div>

      {/* Charts (only when the server reports metrics) */}
      {series ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-muted">Resource utilization</h2>
            <TimeRangePicker value={range} onChange={setRange} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="CPU utilization" subtitle={`Last ${range}`} />
              <div className="p-3 pt-2">
                <MetricChart series={[{ name: "CPU %", color: "#a3e635", points: series.cpu }]} now={now} range={range} unit="%" />
              </div>
            </Card>
            <Card>
              <CardHeader title="Memory utilization" subtitle={`Last ${range}`} />
              <div className="p-3 pt-2">
                <MetricChart series={[{ name: "Memory %", color: "#d9b457", points: series.memory }]} now={now} range={range} unit="%" />
              </div>
            </Card>
            <Card>
              <CardHeader title="Network traffic" subtitle={`Last ${range}`} />
              <div className="p-3 pt-2">
                <MetricChart
                  series={[
                    { name: "In (Mbps)", color: "#56a877", points: series.networkIn },
                    { name: "Out (Mbps)", color: "#d8c58f", points: series.networkOut },
                  ]}
                  now={now}
                  range={range}
                  unit=" Mbps"
                />
              </div>
            </Card>
            <Card>
              <CardHeader title="Disk utilization" subtitle={`Last ${range}`} />
              <div className="p-3 pt-2">
                <MetricChart series={[{ name: "Disk %", color: "#c97b4f", points: series.disk }]} now={now} range={range} unit="%" />
              </div>
            </Card>
          </div>
        </>
      ) : seriesApi.error ? (
        <LoadError message={seriesApi.error} retry={seriesApi.retry} />
      ) : (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Server unreachable"
            message={`No metrics have been collected from ${server.name} recently. Historical charts are unavailable until it reports again.`}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Host info */}
        <Card>
          <CardHeader title="Host information" />
          <dl className="flex flex-col px-4 py-1.5">
            {hostInfo.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between border-b border-border/60 py-2 text-[13px] last:border-0"
              >
                <dt className="text-muted">{label}</dt>
                <dd className="font-mono text-[12px] tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between py-2 text-[13px]">
              <dt className="text-muted">Last seen</dt>
              <dd className="font-mono text-[12px] tabular-nums text-foreground">
                <TimeAgo timestamp={server.lastSeen} />
              </dd>
            </div>
          </dl>
        </Card>

        {/* Containers on this host */}
        <Card>
          <CardHeader
            title="Containers"
            subtitle={containers ? `${containers.length} on this server` : "…"}
          />
          {!containers ? (
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : containers.length === 0 ? (
            <EmptyState title="No containers" message="No Docker containers are registered on this server." />
          ) : (
            <ul className="flex flex-col px-4 py-1.5">
              {containers.map((container) => (
                <li
                  key={container.id}
                  className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-[13px] last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/containers/${container.id}`}
                      className="truncate font-medium text-foreground hover:text-accent"
                    >
                      {container.name}
                    </Link>
                    <p className="truncate font-mono text-[11px] text-muted">{container.image}</p>
                  </div>
                  <Badge tone={container.state === "running" ? "success" : "neutral"}>
                    {container.state}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Alerts for this server */}
        <Card>
          <CardHeader
            title="Alerts"
            subtitle={`${alerts.filter((a) => a.status === "active").length} active`}
          />
          {alertsApi.error && alerts.length === 0 ? (
            <LoadError message={alertsApi.error} retry={alertsApi.retry} />
          ) : alerts.length === 0 ? (
            <EmptyState title="No alerts" message="No thresholds have been breached for this server." />
          ) : (
            <ul className="flex flex-col px-4 py-1.5">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex items-start gap-3 border-b border-border/60 py-2 text-[13px] last:border-0">
                  <Bell
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${alert.severity === "critical" ? "text-danger" : "text-warning"}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{alert.name}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {alert.metric}
                      {alert.unit ? ` · ${formatPercent(alert.currentValue)} vs ${alert.threshold}%` : ""}
                    </p>
                  </div>
                  <Badge tone={alert.status === "active" ? (alert.severity === "critical" ? "danger" : "warning") : "neutral"}>
                    {alert.status === "active" ? "Active" : "Resolved"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/** Loading placeholder matching the detail layout. */
function ServerDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[300px]" />
        ))}
      </div>
    </div>
  );
}
