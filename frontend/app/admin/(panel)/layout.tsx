import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Spinner } from "@/components/admin/ui";

// The dashboard is client-rendered behind a session check; nothing private is prerendered.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Spinner />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
