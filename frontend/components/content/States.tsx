import { CircleAlert, Inbox } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

export function EmptyState({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-line-strong px-6 py-14 text-center text-muted",
        className,
      )}
    >
      <Inbox className="size-6 text-subtle" aria-hidden />
      <p>{message}</p>
    </div>
  );
}

/** Shown when the API could not be reached; never presented as empty content. */
export async function UnavailableState({ className }: { className?: string }) {
  const t = await getTranslations("Common");
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-lg)] border border-warning/30 bg-warning/5 px-5 py-4 text-sm text-muted",
        className,
      )}
    >
      <CircleAlert className="size-5 shrink-0 text-warning" aria-hidden />
      <p>{t("contentUnavailable")}</p>
    </div>
  );
}

export function CardGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-[var(--radius-lg)] border border-line bg-surface/60" />
      ))}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-20" aria-hidden>
      <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="h-12 w-4/5 animate-pulse rounded bg-surface-2" />
      <div className="h-5 w-3/5 animate-pulse rounded bg-surface-2" />
      <div className="mt-10 h-64 animate-pulse rounded-[var(--radius-lg)] bg-surface" />
    </div>
  );
}
