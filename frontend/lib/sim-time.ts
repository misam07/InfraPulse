/**
 * Simulation-time helpers.
 *
 * Fixed event timestamps (server "last seen", alert "triggered at") are
 * stored relative to a fixed anchor. Once the app mounts, TimeAgo rebases
 * them onto the real wall clock so they keep their "3h ago"-style meaning.
 * Live metric series are NOT affected — the API anchors those to the real
 * clock via the `end` query parameter.
 */

/** Fixed anchor matching the backend (2026-11-12T09:00:00Z). */
export const SIMULATION_ANCHOR_MS = Date.parse("2026-11-12T09:00:00Z");

/** Maps a simulation timestamp to real wall-clock time after mount. */
export function toDisplayTime(simMs: number, nowMs: number): number {
  const shift = Math.max(0, nowMs - SIMULATION_ANCHOR_MS);
  return simMs + shift;
}
