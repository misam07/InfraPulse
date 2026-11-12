/** Container data access — now served by the backend API (Phase 2). */

import type { Container, ContainerSeries, TimeRange } from "@/types";
import { apiGet } from "@/lib/api";

export async function getContainers(): Promise<Container[]> {
  const data = await apiGet<{ items: Container[] }>("/api/v1/containers");
  return data.items;
}

export async function getContainer(containerId: string): Promise<Container> {
  return apiGet<Container>(`/api/v1/containers/${containerId}`);
}

export async function getContainerSeries(
  containerId: string,
  range: TimeRange,
  endMs: number
): Promise<ContainerSeries | null> {
  const data = await apiGet<{ series: ContainerSeries | null }>(
    `/api/v1/containers/${containerId}/series?range=${range}&end=${endMs}`
  );
  return data.series;
}
