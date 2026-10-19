import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { ServiceEditor } from "@/features/admin/Services";

export const metadata: Metadata = { title: "Edit service" };

export default function Page({ params }: PageProps<"/admin/services/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      {params.then(({ id }) => (
        <ServiceEditor key={id} id={id} />
      ))}
    </Suspense>
  );
}
