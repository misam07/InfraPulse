"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatPercent, formatUptime } from "@/lib/format";
import { getServers } from "@/lib/data/servers";
import { Card, ProgressBar, Skeleton } from "@/components/ui";
import { ServerStatusBadge } from "@/components/servers/status-badges";
import { TimeAgo } from "@/components/ui/time-ago";
import { LoadError } from "@/components/states/load-error";

/** Servers list view. Data is fetched from the backend API. */
export function ServersView() {
  const serversApi = useApi(getServers, []);
  const servers = serversApi.data;

  if (serversApi.error && !servers) {
    return <LoadError message={serversApi.error} retry={serversApi.retry} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Servers
        </h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {servers ? `${servers.length} registered Linux servers.` : "Loading…"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!servers
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)
          : servers.map((server) => (
              <Link key={server.id} href={`/servers/${server.id}`} className="group">
                <Card className="h-full transition-colors group-hover:border-accent/40">
                  <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[13px] font-medium text-foreground">
                        {server.name}
                        <ChevronRight className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                      </div>
                      <p className="font-mono text-[11px] text-muted">{server.ipAddress}</p>
                      <p className="text-[11px] text-muted">{server.os}</p>
                    </div>
                    <ServerStatusBadge status={server.status} />
                  </div>

                  <div className="flex flex-col gap-3 px-4 py-3.5">
                    {(
                      [
                        ["CPU", server.cpu],
                        ["Memory", server.memory],
                        ["Disk", server.disk],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted">{label}</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {formatPercent(value)}
                          </span>
                        </div>
                        <ProgressBar value={value} />
                      </div>
                    ))}

                    <div className="flex justify-between border-t border-border/60 pt-3 font-mono text-[11px] text-muted">
                      <span>Uptime {formatUptime(server.uptimeHours)}</span>
                      <span>
                        Last seen <TimeAgo timestamp={server.lastSeen} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
