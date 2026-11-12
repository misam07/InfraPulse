import type { Metadata } from "next";
import { Suspense } from "react";
import { ContainerDetailRoute } from "./container-detail-route";

interface Params {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Container detail",
};

export default function ContainerDetailPage({ params }: Params) {
  return (
    // The client detail view reads `params` and fetches from the API,
    // so it renders behind a Suspense boundary (Cache Components).
    <Suspense fallback={null}>
      <ContainerDetailRoute params={params} />
    </Suspense>
  );
}
