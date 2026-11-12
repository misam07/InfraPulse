"use client";

import { useEffect, useState } from "react";
import { SIMULATION_ANCHOR_MS, toDisplayTime } from "@/lib/sim-time";
import { formatRelativeTime } from "@/lib/format";

interface TimeAgoProps {
  /** A "simulation time" timestamp from the data layer. */
  timestamp: number;
}

/**
 * Displays "how long ago" something happened.
 * Client island: timestamps are anchored to the simulation clock, and
 * once mounted this component rebases them to the real wall clock and
 * refreshes itself every 30 seconds.
 */
export function TimeAgo({ timestamp }: TimeAgoProps) {
  const [now, setNow] = useState(SIMULATION_ANCHOR_MS);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, []);

  return <>{formatRelativeTime(toDisplayTime(timestamp, now), now)}</>;
}
