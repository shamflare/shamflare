import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { CategoryManager } from "@/features/admin/Blog";

export const metadata: Metadata = { title: "Blog categories" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <CategoryManager />
    </Suspense>
  );
}
