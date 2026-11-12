"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Boxes,
  Cpu,
  MemoryStick,
  Network,
  Server,
} from "lucide-react";
import type { TimeRange } from "@/types";
import { useApi } from "@/lib/hooks/use-api";
import { useNow } from "@/lib/hooks/use-now";
import { formatPercent } from "@/lib/format";
import {
  getFleetSeries,
  getOverviewStats,
  getServers,
} from "@/lib/data/servers";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TimeRangePicker } from "@/components/charts/time-range-picker";
import { MetricChart } from "@/components/charts/metric-chart";
import { Card, CardHeader, ProgressBar, Skeleton } from "@/components/ui";
import { ServerStatusBadge } from "@/components/servers/status-badges";
import { TimeAgo } from "@/components/ui/time-ago";
import { LoadError } from "@/components/states/load-error";

/**
 * Overview page content. All data now comes from the backend API:
 * stats and fleet series refresh every 15 s, and the time-range picker
 * re-fetches the historical charts.
 */
export function OverviewDashboard() {
  const now = useNow();
  const [range, setRange] = useState<TimeRange>("1h");

  const statsApi = useApi(getOverviewStats, [], 15_000);
  const fleetApi = useApi(() => getFleetSeries(range, Date.now()), [range], 15_000);
  const serversApi = useApi(getServers, []);

  const stats = statsApi.data;
  const fleet = fleetApi.data;
  const servers = serversApi.data;

  const loading = statsApi.loading || fleetApi.loading || serversApi.loading;
  const error = statsApi.error ?? fleetApi.error ?? serversApi.error;
  const retry = () => {
    statsApi.retry();
    fleetApi.retry();
    serversApi.retry();
  };

  if (error && !stats && !fleet) {
    return <LoadError message={error} retry={retry} />;
  }

  if (loading || !stats || !fleet || !servers) {
    return <OverviewSkeleton />;
  }

  const networkSeries = [fleet.networkIn, fleet.networkOut];

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="mt-0.5 text-[13px] text-muted">
            Fleet health across {stats.totalServers} servers and{" "}
            {stats.totalContainers} containers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Live
          </span>
          <TimeRangePicker value={range} onChange={setRange} />
        </div>
      </div>

      {/* Stat blocks — one bordered grid, hairline internal dividers */}
      <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={Server}
          label="Servers"
          value={String(stats.totalServers)}
          subtitle={`${stats.onlineServers} online · ${stats.degradedServers} degraded · ${stats.offlineServers} offline`}
        />
        <MetricCard
          icon={Cpu}
          label="Avg CPU"
          value={formatPercent(stats.avgCpu)}
          tone={stats.avgCpu >= 85 ? "danger" : stats.avgCpu >= 75 ? "warning" : undefined}
          subtitle="across reporting servers"
        />
        <MetricCard
          icon={MemoryStick}
          label="Avg Memory"
          value={formatPercent(stats.avgMemory)}
          tone={stats.avgMemory >= 90 ? "danger" : stats.avgMemory >= 75 ? "warning" : undefined}
          subtitle="across reporting servers"
        />
        <MetricCard
          icon={Boxes}
          label="Containers"
          value={`${stats.runningContainers}/${stats.totalContainers}`}
          subtitle="running / total"
        />
        <MetricCard
          icon={Bell}
          label="Active Alerts"
          value={String(stats.activeAlerts)}
          tone={stats.activeAlerts > 0 ? "danger" : "success"}
          subtitle="need attention"
        />
        <MetricCard
          icon={Network}
          label="Network"
          value={`${(fleet.networkIn.points.at(-1)?.value ?? 0).toFixed(0)}`}
          subtitle="Mbps aggregate in"
        />
      </div>

      {/* Historical charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="CPU utilization"
            subtitle={`Fleet average over the last ${range}`}
          />
          <div className="p-3 pt-2">
            <MetricChart series={[fleet.cpu]} now={now} range={range} unit="%" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Memory utilization" subtitle="Fleet average" />
          <div className="p-3 pt-2">
            <MetricChart series={[fleet.memory]} now={now} range={range} unit="%" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Network traffic" subtitle="Aggregate across servers" />
          <div className="p-3 pt-2">
            <MetricChart series={networkSeries} now={now} range={range} unit=" Mbps" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Disk utilization" subtitle="Fleet average" />
          <div className="p-3 pt-2">
            <MetricChart series={[fleet.disk]} now={now} range={range} unit="%" />
          </div>
        </Card>
      </div>

      {/* Server health table */}
      <Card>
        <CardHeader title="Server health" subtitle="Current resource pressure per server" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-2 font-medium">Server</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">CPU</th>
                <th className="px-4 py-2 font-medium">Memory</th>
                <th className="px-4 py-2 font-medium">Disk</th>
                <th className="px-4 py-2 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr
                  key={server.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-hover/50"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/servers/${server.id}`}
                      className="text-[13px] font-medium text-foreground hover:text-accent"
                    >
                      {server.name}
                    </Link>
                    <p className="font-mono text-[11px] text-muted">{server.ipAddress}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <ServerStatusBadge status={server.status} />
                  </td>
                  {(
                    [
                      ["cpu", server.cpu],
                      ["memory", server.memory],
                      ["disk", server.disk],
                    ] as const
                  ).map(([key, value]) => (
                    <td key={key} className="px-4 py-2.5">
                      <div className="flex w-28 flex-col gap-1.5">
                        <span className="font-mono text-[11px] tabular-nums text-muted">
                          {formatPercent(value)}
                        </span>
                        <ProgressBar value={value} />
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted">
                    <TimeAgo timestamp={server.lastSeen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/** Loading placeholder matching the overview layout. */
function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-background px-4 py-3.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[300px]" />
        ))}
      </div>
      <Card className="h-64" />
    </div>
  );
}
