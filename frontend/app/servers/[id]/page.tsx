import type { Metadata } from "next";
import { Suspense } from "react";
import { ServerDetailRoute } from "./server-detail-route";

interface Params {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Server detail",
};

export default function ServerDetailPage({ params }: Params) {
  return (
    // The client detail view reads `params` and fetches the server from the
    // API, so it renders behind a Suspense boundary (Cache Components).
    <Suspense fallback={null}>
      <ServerDetailRoute params={params} />
    </Suspense>
  );
}
