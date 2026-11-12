"use client";

import type { TimeRange } from "@/types";

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
];

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

/**
 * Segmented mono control for selecting the historical time window.
 * Used above every historical chart.
 */
export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  return (
    <div
      className="inline-flex rounded-[3px] border border-border bg-surface"
      role="group"
      aria-label="Time range"
    >
      {OPTIONS.map(({ value: option, label }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`px-2.5 py-1 font-mono text-[11px] tabular-nums transition-colors ${
            value === option
              ? "bg-accent/10 text-accent"
              : "text-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
