/** Alert data access — now served by the backend API (Phase 2). */

import type { Alert } from "@/types";
import { apiGet } from "@/lib/api";

export async function getAlerts(): Promise<Alert[]> {
  const data = await apiGet<{ items: Alert[] }>("/api/v1/alerts");
  return data.items;
}
