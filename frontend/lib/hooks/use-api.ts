"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

export interface ApiState<T> {
  data: T | null;
  error: string | null;
  /** HTTP status of the failed request, or 0 when unreachable. */
  errorStatus: number | null;
  /** True only while there is nothing to display yet (first load). */
  loading: boolean;
  retry: () => void;
}

/**
 * Minimal data-fetching hook for the dashboard.
 *
 * - Fetches on mount and whenever `deps` change (e.g. the time range).
 * - Optionally re-fetches on an interval so charts feel live.
 * - `loading` is derived (no state flash on background refreshes):
 *   it is only true while there is no data AND no error to show.
 *
 * The fetcher closure is read through a ref (kept fresh in an effect),
 * so passing an inline arrow function that captures Date.now() is safe.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  intervalMs?: number
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await fetcherRef.current();
        if (!cancelled) {
          setData(result);
          setError(null);
          setErrorStatus(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setErrorStatus(e instanceof ApiError ? e.status : 0);
        }
      }
    };

    void run();

    let timer: ReturnType<typeof setInterval> | undefined;
    if (intervalMs && intervalMs > 0) {
      timer = setInterval(() => void run(), intervalMs);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  // Event handler (not an effect), so resetting state here is fine.
  const retry = useCallback(() => {
    setData(null);
    setError(null);
    setErrorStatus(null);
    setAttempt((n) => n + 1);
  }, []);

  const loading = data === null && error === null && errorStatus === null;

  return { data, error, errorStatus, loading, retry };
}
