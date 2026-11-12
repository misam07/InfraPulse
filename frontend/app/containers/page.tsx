import type { Metadata } from "next";
import { ContainersView } from "@/components/containers/containers-view";

export const metadata: Metadata = {
  title: "Containers",
};

export default function ContainersPage() {
  return <ContainersView />;
}
