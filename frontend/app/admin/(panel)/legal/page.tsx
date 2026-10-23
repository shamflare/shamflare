import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { LegalEditor } from "@/features/admin/Legal";

export const metadata: Metadata = { title: "Legal pages" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <LegalEditor />
    </Suspense>
  );
}
