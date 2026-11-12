"use client";

import Link from "next/link";
import { useState } from "react";
import { BellOff, CircleAlert } from "lucide-react";
import type { AlertStatus } from "@/types";
import { useApi } from "@/lib/hooks/use-api";
import { getServers } from "@/lib/data/servers";
import { getAlerts } from "@/lib/data/alerts";
import { formatPercent } from "@/lib/format";
import { Badge, Card, Skeleton } from "@/components/ui";
import { EmptyState } from "@/components/states/empty-state";
import { LoadError } from "@/components/states/load-error";
import { TimeAgo } from "@/components/ui/time-ago";

type Filter = "all" | AlertStatus;

/**
 * Alert list with All / Active / Resolved filter tabs. Data is fetched
 * from the backend API; threshold evaluation arrives in Phase 6.
 */
export function AlertsList() {
  const [filter, setFilter] = useState<Filter>("all");

  const alertsApi = useApi(getAlerts, []);
  const serversApi = useApi(getServers, []);

  const alerts = alertsApi.data;
  const servers = serversApi.data;
  const serverName = (id: string) => servers?.find((s) => s.id === id)?.name ?? "Unknown";

  if (alertsApi.error && !alerts) {
    return <LoadError message={alertsApi.error} retry={alertsApi.retry} />;
  }

  const activeCount = alerts?.filter((a) => a.status === "active").length ?? 0;
  const resolvedCount = (alerts?.length ?? 0) - activeCount;

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: alerts?.length ?? 0 },
    { value: "active", label: "Active", count: activeCount },
    { value: "resolved", label: "Resolved", count: resolvedCount },
  ];

  const visible = (alerts ?? []).filter(
    (alert) => filter === "all" || alert.status === filter
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="inline-flex w-fit rounded-[3px] border border-border bg-surface">
        {FILTERS.map(({ value, label, count }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`px-3 py-1.5 font-mono text-[11px] tabular-nums transition-colors ${
              filter === value
                ? "bg-accent/10 text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <Card>
        {!alerts ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="No alerts here"
            message="Nothing matches this filter. Configured thresholds are evaluated in a later phase."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {visible.map((alert) => (
              <li key={alert.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                {/* Severity icon */}
                <CircleAlert
                  className={`h-4 w-4 shrink-0 ${
                    alert.severity === "critical" ? "text-danger" : "text-warning"
                  }`}
                  aria-hidden
                />

                <div className="min-w-[180px] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{alert.name}</span>
                    <Badge tone={alert.severity === "critical" ? "danger" : "warning"}>
                      {alert.severity === "critical" ? "Crit" : "Warn"}
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-muted">{alert.metric}</p>
                </div>

                {/* Affected server */}
                <Link
                  href={`/servers/${alert.serverId}`}
                  className="font-mono text-[11px] text-muted hover:text-accent"
                >
                  {serverName(alert.serverId)}
                </Link>

                {/* Current vs threshold */}
                <div className="min-w-[150px] font-mono text-[12px] tabular-nums">
                  <span className={alert.status === "active" ? "text-danger" : "text-muted"}>
                    {alert.unit ? formatPercent(alert.currentValue) : "unreachable"}
                  </span>
                  <span className="text-[11px] text-muted">
                    {" "}
                    / {alert.unit ? `${alert.threshold}%` : "—"} threshold
                  </span>
                </div>

                {/* Timing */}
                <div className="min-w-[130px] text-right font-mono text-[11px] text-muted">
                  <p>
                    Fired <TimeAgo timestamp={alert.triggeredAt} />
                  </p>
                  {alert.resolvedAt ? (
                    <p>
                      Resolved <TimeAgo timestamp={alert.resolvedAt} />
                    </p>
                  ) : null}
                </div>

                <Badge tone={alert.status === "active" ? "danger" : "success"}>
                  {alert.status === "active" ? "Active" : "Resolved"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
