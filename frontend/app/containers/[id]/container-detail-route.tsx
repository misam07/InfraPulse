"use client";

import { use } from "react";
import { ContainerDetail } from "@/components/containers/container-detail";

/**
 * Unwraps the dynamic route param on the client, then renders the
 * detail view which fetches everything it needs from the API.
 */
export function ContainerDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ContainerDetail containerId={id} />;
}
