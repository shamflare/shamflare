import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { ProjectList } from "@/features/admin/Portfolio";

export const metadata: Metadata = { title: "Portfolio" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProjectList />
    </Suspense>
  );
}
