import type { Metadata } from "next";
import { Overview } from "@/features/admin/Overview";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return <Overview />;
}
