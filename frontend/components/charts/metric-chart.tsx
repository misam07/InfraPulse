"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricSeries, TimeRange } from "@/types";
import { formatClockTime } from "@/lib/format";
import { EmptyState } from "@/components/states/empty-state";
import { ChartColumn } from "lucide-react";

interface MetricChartProps {
  series: MetricSeries[];
  now: number;
  range: TimeRange;
  unit?: string;
  /** Y-axis ceiling; defaults to a bit above the tallest data point. */
  maxY?: number;
  height?: number;
}

/**
 * Precision-ops chart: thin lines, dotted hairline grid, vertical
 * crosshair on hover, compact mono tooltip. No gradient fills, no glow.
 */
export function MetricChart({
  series,
  now,
  unit = "",
  maxY,
  height = 240,
}: MetricChartProps) {
  const hasData = series.some((s) => s.points.length > 0);

  // Recharts draws multiple series from ONE dataset, so we merge every
  // series' points into rows like { timestamp, "CPU %": 42, ... }.
  const data = useMemo(() => {
    if (!hasData) return [];
    const byTimestamp = new Map<number, Record<string, number>>();
    for (const s of series) {
      for (const point of s.points) {
        const row = byTimestamp.get(point.timestamp) ?? { timestamp: point.timestamp };
        row[s.name] = point.value;
        byTimestamp.set(point.timestamp, row);
      }
    }
    return [...byTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp);
  }, [series, hasData]);

  if (!hasData) {
    return (
      <EmptyState
        icon={ChartColumn}
        title="No data for this period"
        message="Metrics will appear here once the target reports again."
      />
    );
  }

  const yCeiling =
    maxY ??
    Math.max(
      ...series.flatMap((s) => s.points.map((p) => p.value)),
      1
    ) * 1.1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#232325" strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t) => formatClockTime(Number(t), now)}
          tick={{ fill: "#8f8b84", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          domain={[0, Math.ceil(yCeiling)]}
          tickFormatter={(v: number) => `${v}`}
          tick={{ fill: "#8f8b84", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={34}
        />
        <Tooltip
          cursor={{ stroke: "#2f2f31", strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: "#131314",
            border: "1px solid #2f2f31",
            borderRadius: 3,
            padding: "6px 10px",
            fontSize: 11,
          }}
          labelStyle={{
            color: "#737a84",
            fontSize: 10,
            marginBottom: 2,
            fontFamily: "var(--font-geist-mono), monospace",
          }}
          labelFormatter={(label) => formatClockTime(Number(label), now)}
          formatter={(value, name) => [
            `${typeof value === "number" ? value.toFixed(1) : String(value ?? "")}${unit}`,
            name,
          ]}
        />
        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            name={s.name}
            stroke={s.color}
            strokeWidth={1.5}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 2.5, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
