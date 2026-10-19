"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { locales, type Locale } from "@/i18n/routing";
import type { TranslationMap, TranslationState } from "@/lib/admin/types";
import { describeError } from "@/lib/admin/hooks";
import type { ApiError } from "@/lib/api/client";
import { buttonClasses } from "@/components/ui/Button";
import { Notice, PageTitle, Spinner, StatusBadge, TranslationBadges, formatDateTime } from "@/components/admin/ui";

type Row = {
  id: number;
  status?: string;
  updated_at?: string;
  translations: TranslationMap<Record<string, unknown>>;
  translation_status: Partial<Record<Locale, TranslationState>>;
};

/** Best available title for a multilingual item: English first, then any translation. */
export function displayTitle(translations: TranslationMap<Record<string, unknown>>, field = "title"): string {
  for (const l of locales) {
    const value = translations[l]?.[field];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "Untitled";
}

export function ContentTable<T extends Row>({
  title,
  description,
  newHref,
  newLabel,
  rows,
  loading,
  error,
  editHref,
  titleField = "title",
  extraColumns = [],
  emptyMessage,
  footer,
}: {
  title: string;
  description: string;
  newHref: string;
  newLabel: string;
  rows: T[] | null;
  loading: boolean;
  error: ApiError | null;
  editHref: (row: T) => string;
  titleField?: string;
  extraColumns?: { header: string; cell: (row: T) => ReactNode }[];
  emptyMessage: string;
  footer?: ReactNode;
}) {
  return (
    <>
      <PageTitle
        title={title}
        description={description}
        actions={
          <Link href={newHref} className={buttonClasses({ size: "sm" })}>
            <Plus className="size-4" aria-hidden /> {newLabel}
          </Link>
        }
      />
      {error ? <Notice kind="error">{describeError(error)}</Notice> : null}
      {loading && !rows ? <Spinner /> : null}
      {rows ? (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface text-xs text-subtle uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Translations</th>
                {rows[0]?.status !== undefined || rows.length === 0 ? <th scope="col" className="px-4 py-3 font-medium">Status</th> : null}
                {extraColumns.map((column) => (
                  <th key={column.header} scope="col" className="px-4 py-3 font-medium">
                    {column.header}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4 + extraColumns.length} className="px-4 py-12 text-center text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link href={editHref(row)} className="font-medium hover:text-accent">
                        {displayTitle(row.translations, titleField)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <TranslationBadges status={row.translation_status} />
                    </td>
                    {row.status !== undefined ? (
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    ) : null}
                    {extraColumns.map((column) => (
                      <td key={column.header} className="px-4 py-3 text-muted">
                        {column.cell(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-muted">{row.updated_at ? formatDateTime(row.updated_at) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
      {footer}
    </>
  );
}
