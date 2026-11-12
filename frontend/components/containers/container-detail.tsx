"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Boxes, ChevronLeft, Network } from "lucide-react";
import type { TimeRange } from "@/types";
import { useApi } from "@/lib/hooks/use-api";
import { useNow } from "@/lib/hooks/use-now";
import { formatMemoryMb, formatMbps, formatUptime } from "@/lib/format";
import { getContainer, getContainerSeries } from "@/lib/data/containers";
import { getServer } from "@/lib/data/servers";
import { TimeRangePicker } from "@/components/charts/time-range-picker";
import { MetricChart } from "@/components/charts/metric-chart";
import { Card, CardHeader, Skeleton } from "@/components/ui";
import { ContainerStateBadge } from "@/components/servers/status-badges";
import { EmptyState } from "@/components/states/empty-state";
import { LoadError } from "@/components/states/load-error";

interface ContainerDetailProps {
  containerId: string;
}

/** Container detail view. Fetches container, series and host from the API. */
export function ContainerDetail({ containerId }: ContainerDetailProps) {
  const now = useNow();
  const [range, setRange] = useState<TimeRange>("1h");

  const containerApi = useApi(() => getContainer(containerId), [containerId]);
  const seriesApi = useApi(
    () => getContainerSeries(containerId, range, Date.now()),
    [containerId, range],
    15_000
  );

  const container = containerApi.data;
  const series = seriesApi.data;
  const serverApi = useApi(
    () => (container ? getServer(container.serverId) : Promise.resolve(null)),
    [container?.serverId]
  );

  if (containerApi.errorStatus === 404) {
    notFound();
  }

  if (containerApi.error && !container) {
    return <LoadError message={containerApi.error} retry={containerApi.retry} />;
  }

  if (!container) {
    return <ContainerDetailSkeleton />;
  }

  const server = serverApi.data;
  const memPercent =
    container.memoryLimitMb > 0
      ? (container.memoryUsedMb / container.memoryLimitMb) * 100
      : 0;

  const info = [
    ["Image", container.image],
    ["Host server", server?.name ?? "Unknown"],
    ["Uptime", container.state === "running" ? formatUptime(container.uptimeHours) : "—"],
    ["Memory limit", formatMemoryMb(container.memoryLimitMb)],
    [
      "Memory usage",
      container.state === "running"
        ? `${formatMemoryMb(container.memoryUsedMb)} (${memPercent.toFixed(1)}%)`
        : "—",
    ],
    [
      "Network I/O",
      container.state === "running"
        ? `${formatMbps(container.networkIn)} in · ${formatMbps(container.networkOut)} out`
        : "—",
    ],
    ["Restarts", String(container.restarts)],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb header */}
      <div>
        <Link
          href="/containers"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Containers
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {container.name}
          </h1>
          <span className="font-mono text-sm text-muted">{container.image}</span>
          <ContainerStateBadge state={container.state} />
        </div>
      </div>

      {series ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-muted">Resource usage</h2>
            <TimeRangePicker value={range} onChange={setRange} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="CPU utilization" subtitle={`Last ${range}`} />
              <div className="p-3 pt-2">
                <MetricChart
                  series={[{ name: "CPU %", color: "#a3e635", points: series.cpu }]}
                  now={now}
                  range={range}
                  unit="%"
                />
              </div>
            </Card>
            <Card>
              <CardHeader title="Memory usage" subtitle={`Last ${range}`} />
              <div className="p-3 pt-2">
                <MetricChart
                  series={[{ name: "Memory (MB)", color: "#d9b457", points: series.memory }]}
                  now={now}
                  range={range}
                  unit=" MB"
                />
              </div>
            </Card>
          </div>
        </>
      ) : seriesApi.error ? (
        <LoadError message={seriesApi.error} retry={seriesApi.retry} />
      ) : (
        <Card>
          <EmptyState
            icon={Boxes}
            title="Container is stopped"
            message="No live metrics are collected from stopped containers. Start the container to see resource usage here."
          />
        </Card>
      )}

      <Card>
        <CardHeader title="Container information" />
        <dl className="flex flex-col px-4 py-1.5">
          {info.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 border-b border-border/60 py-2 text-[13px] last:border-0"
            >
              <dt className="shrink-0 text-muted">{label}</dt>
              <dd className="text-right font-mono text-[12px] tabular-nums text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted">
        <Network className="h-3.5 w-3.5" aria-hidden />
        Container actions (start/stop/restart) arrive in a later phase — monitoring is read-only.
      </p>
    </div>
  );
}

/** Loading placeholder matching the detail layout. */
function ContainerDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="h-[300px]" />
        ))}
      </div>
    </div>
  );
}
