"use client";

import { useEffect, useState } from "react";
import { SIMULATION_ANCHOR_MS } from "@/lib/sim-time";

/**
 * Returns the "current time" used across the dashboard.
 *
 * The first render returns the fixed simulation anchor so the prerendered
 * page is deterministic (a Next.js 16 requirement — Date.now() is not
 * allowed during render). As soon as the component mounts, the real
 * clock takes over and keeps ticking on an interval, which makes the
 * simulated metrics feel live.
 */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(SIMULATION_ANCHOR_MS);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
