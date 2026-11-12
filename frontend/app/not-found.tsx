import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <SearchX className="h-10 w-10 text-muted" aria-hidden />
      <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you are looking for does not exist or the monitored target
        has been removed.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-accent/15 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/25"
      >
        Back to Overview
      </Link>
    </div>
  );
}
