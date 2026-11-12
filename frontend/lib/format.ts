/**
 * Number/date formatting helpers so every page presents values the same way.
 */

/** 42.63 -> "42.6%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** 32400 -> "31.6 GB" (input is megabytes) */
export function formatMemoryMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

/** 2000 -> "2.0 TB", 512 -> "512 GB" */
export function formatDiskGb(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(gb >= 10240 ? 0 : 1)} TB`;
  return `${gb} GB`;
}

/** 84.2 -> "84.2 Mbps" */
export function formatMbps(value: number): string {
  return `${value.toFixed(1)} Mbps`;
}

/** 3744 -> "5mo 4d", 26 -> "1d 2h" */
export function formatUptime(hours: number): string {
  if (hours <= 0) return "—";
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  if (days >= 60) {
    const months = Math.floor(days / 30);
    return `${months}mo ${days % 30}d`;
  }
  if (days >= 1) return `${days}d ${remainingHours}h`;
  return `${remainingHours}h`;
}

/** Difference between two timestamps as "3h 12m ago". */
export function formatRelativeTime(timestampMs: number, nowMs: number): string {
  const diff = Math.max(0, nowMs - timestampMs);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ago`;
}

/** Absolute clock time, e.g. "09:14" or "Nov 10, 14:32" for older dates. */
export function formatClockTime(timestampMs: number, nowMs: number): string {
  const sameDay =
    new Date(timestampMs).toDateString() === new Date(nowMs).toDateString();
  return new Date(timestampMs).toLocaleString(undefined, sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
