/**
 * Generic visual primitives (Card, Badge, StatusDot, ...) shared by all pages.
 * Plain presentational components — no state, no data fetching.
 *
 * "Precision ops" styling: flat surfaces, hairline borders, no shadows,
 * no large radii. Type and alignment carry the hierarchy.
 */

import type { ReactNode } from "react";

interface CardProps {
  children?: ReactNode;
  className?: string;
}

/** Standard dashboard panel: hairline border, flat surface. */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-[3px] border border-border bg-surface ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <div>
        <h2 className="text-[13px] font-medium text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

const BADGE_TONES: Record<BadgeTone, string> = {
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
  info: "border-info/40 text-info",
  accent: "border-accent/40 text-accent",
  neutral: "border-border-strong text-muted",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * Outline-only mono tag (no filled pills). Reads like a classification
 * label: CRITICAL, RUNNING, RESOLVED...
 */
export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusDotProps {
  tone: "success" | "warning" | "danger" | "muted" | "accent";
  pulse?: boolean;
}

/** Tiny square status marker used next to states and in lists. */
export function StatusDot({ tone, pulse = false }: StatusDotProps) {
  const colorClass = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    accent: "bg-accent",
    muted: "bg-muted/60",
  }[tone];

  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {pulse ? (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${colorClass}`}
        />
      ) : null}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${colorClass}`} />
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  tone?: "success" | "warning" | "danger" | "accent" | "muted";
  className?: string;
}

/** 2px utilization ruler that shifts color at warning/critical levels. */
export function ProgressBar({ value, tone, className = "" }: ProgressBarProps) {
  const resolvedTone =
    tone ??
    (value >= 90 ? "danger" : value >= 75 ? "warning" : value >= 40 ? "accent" : "muted");

  const colorClass = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    accent: "bg-accent",
    muted: "bg-muted/50",
  }[resolvedTone];

  return (
    <div className={`h-0.5 w-full bg-border ${className}`}>
      <div
        className={`h-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Pulsing placeholder block shown while a section is loading. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[2px] bg-border/70 ${className}`} />;
}
