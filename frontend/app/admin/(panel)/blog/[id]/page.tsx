import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { PostEditor } from "@/features/admin/Blog";

export const metadata: Metadata = { title: "Edit post" };

export default function Page({ params }: PageProps<"/admin/blog/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      {params.then(({ id }) => (
        <PostEditor key={id} id={id} />
      ))}
    </Suspense>
  );
}
