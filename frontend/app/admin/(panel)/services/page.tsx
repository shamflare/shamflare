import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { ServiceList } from "@/features/admin/Services";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ServiceList />
    </Suspense>
  );
}
