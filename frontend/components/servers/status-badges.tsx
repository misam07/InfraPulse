import { StatusDot } from "@/components/ui";

/**
 * Status labels: dot + plain text, no filled pills. Color carries the
 * meaning; the text stays readable and quiet.
 */

/** Status label for a server's health. */
export function ServerStatusBadge({ status }: { status: "online" | "degraded" | "offline" }) {
  const config = {
    online: { tone: "success" as const, pulse: true, label: "Online", text: "text-success" },
    degraded: { tone: "warning" as const, pulse: true, label: "Degraded", text: "text-warning" },
    offline: { tone: "danger" as const, pulse: false, label: "Offline", text: "text-danger" },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${config.text}`}
    >
      <StatusDot tone={config.tone} pulse={config.pulse} />
      {config.label}
    </span>
  );
}

/** Status label for a container's lifecycle state. */
export function ContainerStateBadge({ state }: { state: "running" | "stopped" }) {
  return state === "running" ? (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-success">
      <StatusDot tone="success" pulse />
      Running
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
      <StatusDot tone="muted" />
      Stopped
    </span>
  );
}
