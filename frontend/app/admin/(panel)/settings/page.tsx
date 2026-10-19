import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/admin/ui";
import { SettingsEditor } from "@/features/admin/Settings";

export const metadata: Metadata = { title: "Site settings" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsEditor />
    </Suspense>
  );
}
