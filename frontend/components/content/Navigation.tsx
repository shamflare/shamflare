import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations("Common");
  return (
    <nav aria-label={t("breadcrumb")} className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-subtle">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-fg">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-muted")}>
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRight className="size-3.5 rtl:-scale-x-100" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Server-rendered pagination using plain links (works without JavaScript). */
export async function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const t = await getTranslations("Common");
  const linkClass =
    "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-md)] border border-line px-4 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg";
  return (
    <nav aria-label={t("pagination")} className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          {t("previous")}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-subtle">{t("pageOf", { page, total: pageCount })}</p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          {t("next")}
          <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
