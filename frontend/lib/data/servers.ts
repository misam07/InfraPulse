/**
 * Simulated data access — REPLACED in Phase 2.
 *
 * These modules now fetch from the FastAPI backend (NEXT_PUBLIC_API_URL).
 * The function signatures match what the components consume, so the UI did
 * not change — only the data source did. In later phases these keep
 * evolving (auth headers, caching) while the components stay untouched.
 */

import type {
  Container,
  FleetSeries,
  OverviewStats,
  Server,
  ServerSeries,
  TimeRange,
} from "@/types";
import { apiGet } from "@/lib/api";

// ---------------------------------------------------------------- Servers

export async function getServers(): Promise<Server[]> {
  const data = await apiGet<{ items: Server[] }>("/api/v1/servers");
  return data.items;
}

export async function getServer(serverId: string): Promise<Server> {
  return apiGet<Server>(`/api/v1/servers/${serverId}`);
}

export async function getOverviewStats(): Promise<OverviewStats> {
  return apiGet<OverviewStats>("/api/v1/overview/stats");
}

export async function getFleetSeries(
  range: TimeRange,
  endMs: number
): Promise<FleetSeries> {
  return apiGet<FleetSeries>(
    `/api/v1/overview/series?range=${range}&end=${endMs}`
  );
}

export async function getServerSeries(
  serverId: string,
  range: TimeRange,
  endMs: number
): Promise<ServerSeries | null> {
  const data = await apiGet<{ series: ServerSeries | null }>(
    `/api/v1/servers/${serverId}/series?range=${range}&end=${endMs}`
  );
  return data.series;
}

export async function getContainersByServer(
  serverId: string
): Promise<Container[]> {
  const data = await apiGet<{ items: Container[] }>(
    `/api/v1/servers/${serverId}/containers`
  );
  return data.items;
}
