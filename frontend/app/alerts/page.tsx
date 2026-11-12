import type { Metadata } from "next";
import { AlertsList } from "@/components/alerts/alerts-list";

export const metadata: Metadata = {
  title: "Alerts",
};

export default function AlertsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Alerts
        </h1>
        <p className="mt-0.5 text-[13px] text-muted">
          Threshold breaches across your infrastructure.
        </p>
      </div>
      <AlertsList />
    </div>
  );
}
