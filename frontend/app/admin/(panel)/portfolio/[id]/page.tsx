import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { ProjectEditor } from "@/features/admin/Portfolio";

export const metadata: Metadata = { title: "Edit project" };

export default function Page({ params }: PageProps<"/admin/portfolio/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      {params.then(({ id }) => (
        <ProjectEditor key={id} id={id} />
      ))}
    </Suspense>
  );
}
