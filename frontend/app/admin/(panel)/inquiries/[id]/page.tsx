import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { InquiryDetail } from "@/features/admin/Inquiries";

export const metadata: Metadata = { title: "Inquiry" };

export default function InquiryPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      {params.then(({ id }) => (
        <InquiryDetail id={id} />
      ))}
    </Suspense>
  );
}
