"use client";

import Link from "next/link";
import { ArrowRight, FileText, Folder, Inbox, Languages, Layers } from "lucide-react";
import { describeError, useResource } from "@/lib/admin/hooks";
import type { AdminStats } from "@/lib/admin/types";
import { Notice, PageTitle, Panel, Spinner, StatusBadge, formatDateTime } from "@/components/admin/ui";
import { useSession } from "@/components/admin/AdminShell";

export function Overview() {
  const { user } = useSession();
  const { data, error, loading } = useResource<AdminStats>("admin/stats/");

  return (
    <>
      <PageTitle title={`Welcome${user.first_name ? `, ${user.first_name}` : ""}`} description="A live summary of inquiries and published content." />
      {error ? <Notice kind="error">{describeError(error)}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <div className="space-y-8">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat href="/admin/inquiries?status=new" icon={Inbox} label="New inquiries" value={data.inquiries.new} detail={`${data.inquiries.last_7_days} in the last 7 days · ${data.inquiries.total} total`} />
            <Stat href="/admin/services" icon={Layers} label="Published services" value={data.services.published} detail={`${data.services.total} total`} />
            <Stat href="/admin/portfolio" icon={Folder} label="Published projects" value={data.portfolio.published} detail={`${data.portfolio.total} total`} />
            <Stat href="/admin/blog" icon={FileText} label="Published articles" value={data.blog.published} detail={`${data.blog.drafts} drafts · ${data.blog.total} total`} />
          </ul>

          {data.translations.missing > 0 ? (
            <Notice kind="info">
              <span className="inline-flex items-center gap-2">
                <Languages className="size-4 text-warning" aria-hidden />
                {data.translations.missing} translation{data.translations.missing === 1 ? " is" : "s are"} missing or incomplete for published items.
                Look for the yellow and red language badges in each list.
              </span>
            </Notice>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
              title="Recent inquiries"
              className="lg:col-span-2"
              actions={
                <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  View all <ArrowRight className="size-3" aria-hidden />
                </Link>
              }
            >
              {data.recent_inquiries.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No inquiries yet. Submissions from the contact form will appear here.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recent_inquiries.map((inquiry) => (
                    <li key={inquiry.id}>
                      <Link href={`/admin/inquiries/${inquiry.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-accent">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{inquiry.name}</span>
                          <span className="block truncate text-xs text-subtle">
                            {inquiry.reference} · {inquiry.service_title || "No service selected"} · {formatDateTime(inquiry.created_at)}
                          </span>
                        </span>
                        <StatusBadge status={inquiry.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title="Inquiry pipeline">
              <dl className="space-y-3 text-sm">
                {(
                  [
                    ["new", data.inquiries.new],
                    ["in_progress", data.inquiries.in_progress],
                    ["completed", data.inquiries.completed],
                    ["archived", data.inquiries.archived],
                  ] as const
                ).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <dt>
                      <Link href={`/admin/inquiries?status=${status}`} className="hover:text-accent">
                        <StatusBadge status={status} />
                      </Link>
                    </dt>
                    <dd className="font-mono text-fg">{count}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Stat({
  href,
  icon: Icon,
  label,
  value,
  detail,
}: {
  href: string;
  icon: typeof Inbox;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <li>
      <Link href={href} className="block rounded-[var(--radius-lg)] border border-line bg-surface p-5 transition-colors hover:border-accent/40">
        <div className="flex items-center justify-between text-sm text-muted">
          {label}
          <Icon className="size-4 text-accent" aria-hidden />
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold text-fg">{value}</p>
        <p className="mt-1 text-xs text-subtle">{detail}</p>
      </Link>
    </li>
  );
}
