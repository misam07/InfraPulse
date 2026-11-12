"use client";

import { use } from "react";
import { ServerDetail } from "@/components/servers/server-detail";

/**
 * Unwraps the dynamic route param on the client, then renders the
 * detail view which fetches everything it needs from the API.
 */
export function ServerDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ServerDetail serverId={id} />;
}
