import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted">Application preferences.</p>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Settings className="h-8 w-8 text-muted" aria-hidden />
          <p className="text-sm font-medium text-foreground">Nothing to configure yet</p>
          <p className="max-w-md text-xs text-muted">
            Settings arrive in later phases: alert threshold configuration
            (Phase 6), user accounts and authentication (Phase 7), and
            monitoring target management (Phase 3). Phase 1 is a
            display-only dashboard.
          </p>
        </div>
      </Card>
    </div>
  );
}
