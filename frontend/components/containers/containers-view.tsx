"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks/use-api";
import { formatMemoryMb, formatPercent, formatUptime } from "@/lib/format";
import { getContainers } from "@/lib/data/containers";
import { getServers } from "@/lib/data/servers";
import { Card, ProgressBar, Skeleton } from "@/components/ui";
import { ContainerStateBadge } from "@/components/servers/status-badges";
import { LoadError } from "@/components/states/load-error";

/** Containers list view. Data is fetched from the backend API. */
export function ContainersView() {
  const containersApi = useApi(getContainers, []);
  const serversApi = useApi(getServers, []);

  const containers = containersApi.data;
  const servers = serversApi.data;
  const serverName = (id: string) => servers?.find((s) => s.id === id)?.name ?? "—";

  if (containersApi.error && !containers) {
    return <LoadError message={containersApi.error} retry={containersApi.retry} />;
  }

  const running = containers?.filter((c) => c.state === "running").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Containers
        </h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {containers
            ? `${running} running · ${containers.length - running} stopped · ${containers.length} total`
            : "Loading…"}
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-2 font-medium">Container</th>
                <th className="px-4 py-2 font-medium">Server</th>
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">CPU</th>
                <th className="px-4 py-2 font-medium">Memory</th>
                <th className="px-4 py-2 font-medium">Uptime</th>
                <th className="px-4 py-2 font-medium">Restarts</th>
              </tr>
            </thead>
            <tbody>
              {!containers
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/60 last:border-0">
                      <td colSpan={7} className="px-4 py-2.5">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : containers.map((container) => {
                    const memPercent =
                      container.memoryLimitMb > 0
                        ? (container.memoryUsedMb / container.memoryLimitMb) * 100
                        : 0;

                    return (
                      <tr
                        key={container.id}
                        className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-hover/50"
                      >
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/containers/${container.id}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {container.name}
                          </Link>
                          <p className="font-mono text-[11px] text-muted">{container.image}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/servers/${container.serverId}`}
                            className="font-mono text-[11px] text-muted hover:text-accent"
                          >
                            {serverName(container.serverId)}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">
                          <ContainerStateBadge state={container.state} />
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[12px] tabular-nums text-muted">
                          {container.state === "running" ? formatPercent(container.cpuPercent) : "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          {container.state === "running" ? (
                            <div className="flex w-32 flex-col gap-1.5">
                              <span className="font-mono text-[11px] tabular-nums text-muted">
                                {formatMemoryMb(container.memoryUsedMb)} / {formatMemoryMb(container.memoryLimitMb)}
                              </span>
                              <ProgressBar value={memPercent} />
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-muted">
                          {container.state === "running" ? formatUptime(container.uptimeHours) : "—"}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums text-muted">
                          {container.restarts}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
