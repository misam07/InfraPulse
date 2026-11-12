"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

/**
 * Global route error boundary (required to be a Client Component).
 * Uses the Next.js 16 `retry` prop — the replacement for `reset`.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <TriangleAlert className="h-10 w-10 text-danger" aria-hidden />
      <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted">
        An unexpected error occurred while rendering this page.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-accent/15 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/25"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}
