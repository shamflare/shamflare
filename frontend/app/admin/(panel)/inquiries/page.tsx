import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { InquiryList } from "@/features/admin/Inquiries";

export const metadata: Metadata = { title: "Inquiries" };

export default function InquiriesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <InquiryList />
    </Suspense>
  );
}
