import { Inbox, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  /** Optional icon component; defaults to a generic inbox. */
  icon?: LucideIcon;
}

/**
 * Friendly placeholder when there is no data to show
 * (e.g. an offline server has no metrics to chart).
 */
export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-muted" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-xs text-muted">{message}</p>
    </div>
  );
}
