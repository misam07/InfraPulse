import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  /** Optional color for the value (defaults to foreground). */
  tone?: "accent" | "success" | "warning" | "danger" | "info";
}

const VALUE_TONES = {
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
} as const;

/**
 * Overview stat block: micro label, large mono value, small context line.
 * No icon chips, no card chrome — the overview grid supplies hairline
 * dividers, these supply content.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  tone,
}: MetricCardProps) {
  return (
    <div className="flex flex-col gap-2 bg-background px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <div className="truncate font-mono text-[22px] font-medium leading-none tabular-nums text-foreground">
        <span className={tone ? VALUE_TONES[tone] : ""}>{value}</span>
      </div>
      {subtitle ? (
        <div className="text-[11px] leading-tight text-muted">{subtitle}</div>
      ) : null}
    </div>
  );
}
