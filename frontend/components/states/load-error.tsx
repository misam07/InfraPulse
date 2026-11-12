import { RotateCcw, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui";

interface LoadErrorProps {
  message: string;
  retry?: () => void;
}

/**
 * Inline error panel for failed data fetches, with an optional retry
 * action. Used by every client view that loads from the API.
 */
export function LoadError({ message, retry }: LoadErrorProps) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <TriangleAlert className="h-8 w-8 text-danger" aria-hidden />
        <p className="text-sm font-medium text-foreground">Could not load data</p>
        <p className="max-w-sm text-xs text-muted">{message}</p>
        {retry ? (
          <button
            type="button"
            onClick={retry}
            className="mt-2 inline-flex items-center gap-2 rounded-[3px] border border-border-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-foreground hover:bg-surface-hover"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </button>
        ) : null}
      </div>
    </Card>
  );
}
