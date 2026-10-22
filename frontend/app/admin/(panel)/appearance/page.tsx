import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { AppearanceEditor } from "@/features/admin/appearance/AppearanceEditor";

export const metadata: Metadata = { title: "Appearance" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <AppearanceEditor />
    </Suspense>
  );
}
