import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { PostList } from "@/features/admin/Blog";

export const metadata: Metadata = { title: "Blog posts" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <PostList />
    </Suspense>
  );
}
