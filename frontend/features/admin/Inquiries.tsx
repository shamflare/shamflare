"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Search } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";
import { describeError, useResource } from "@/lib/admin/hooks";
import { INQUIRY_STATUSES, type AdminInquiry, type InquiryStatus } from "@/lib/admin/types";
import { localeNames, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import {
  AdminPagination,
  ConfirmButton,
  Field,
  Notice,
  PageTitle,
  Panel,
  Spinner,
  StatusBadge,
  formatDateTime,
  inputClass,
  useFlash,
} from "@/components/admin/ui";

const PAGE_SIZE = 20;
const BUDGET_LABELS: Record<string, string> = {
  under_1k: "Under $1,000",
  "1k_5k": "$1,000 – $5,000",
  "5k_15k": "$5,000 – $15,000",
  "15k_plus": "More than $15,000",
  not_sure: "Not sure yet",
};

export function InquiryList() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const search = params.get("search") ?? "";
  const ordering = params.get("ordering") ?? "-created_at";
  const page = Number(params.get("page") ?? "1") || 1;
  const [term, setTerm] = useState(search);

  const { data, error, loading } = useResource<Paginated<AdminInquiry>>("admin/inquiries/", {
    status,
    search,
    ordering,
    page,
    page_size: PAGE_SIZE,
  });

  function navigate(patch: Record<string, string | number>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === 1 || (key === "ordering" && value === "-created_at")) next.delete(key);
      else next.set(key, String(value));
    }
    if (!("page" in patch)) next.delete("page");
    router.replace(`/admin/inquiries${next.size ? `?${next}` : ""}`);
  }

  function onSearch(event: FormEvent) {
    event.preventDefault();
    navigate({ search: term.trim() });
  }

  return (
    <>
      <PageTitle title="Inquiries" description="Project requests submitted through the website. Stored in the database even when email is not configured." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {["", ...INQUIRY_STATUSES].map((value) => (
            <button
              key={value || "all"}
              type="button"
              aria-pressed={status === value}
              onClick={() => navigate({ status: value })}
              className={cn(
                "rounded-full border px-3 py-1 text-sm capitalize transition-colors",
                status === value ? "border-accent/60 bg-accent/10 text-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {value ? value.replace("_", " ") : "All"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <form onSubmit={onSearch} role="search" className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden />
            <input
              type="search"
              aria-label="Search inquiries"
              placeholder="Search name, email, reference…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={cn(inputClass, "w-64 pl-9")}
            />
          </form>
          <select aria-label="Sort" value={ordering} onChange={(e) => navigate({ ordering: e.target.value })} className={cn(inputClass, "w-auto")}>
            <option value="-created_at">Newest first</option>
            <option value="created_at">Oldest first</option>
          </select>
        </div>
      </div>

      {error ? <Notice kind="error">{describeError(error)}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-surface text-xs text-subtle uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Reference</th>
                  <th scope="col" className="px-4 py-3 font-medium">From</th>
                  <th scope="col" className="px-4 py-3 font-medium">Service</th>
                  <th scope="col" className="px-4 py-3 font-medium">Received</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y divide-line", loading && "opacity-60")}>
                {data.results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      {status || search ? "No inquiries match these filters." : "No inquiries yet."}
                    </td>
                  </tr>
                ) : (
                  data.results.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-surface/60">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/admin/inquiries/${inquiry.id}`} className="text-accent hover:underline">
                          {inquiry.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-medium">{inquiry.name}</span>
                        <span className="block text-xs text-subtle">{inquiry.email}</span>
                      </td>
                      <td className="px-4 py-3 text-muted">{inquiry.service_title || "—"}</td>
                      <td className="px-4 py-3 text-muted">{formatDateTime(inquiry.created_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inquiry.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination page={page} count={data.count} pageSize={PAGE_SIZE} onPage={(p) => navigate({ page: p })} />
        </>
      ) : null}
    </>
  );
}

export function InquiryDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, loading, setData } = useResource<AdminInquiry>(`admin/inquiries/${id}/`);
  const [status, setStatus] = useState<InquiryStatus | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [flash, setFlash] = useFlash();

  if (error && !data) {
    return (
      <>
        <BackLink />
        <Notice kind="error">{describeError(error)}</Notice>
      </>
    );
  }
  if (loading || !data) return <Spinner />;

  const currentStatus = status ?? data.status;
  const currentNotes = notes ?? data.internal_notes;
  const dirty = currentStatus !== data.status || currentNotes !== data.internal_notes;

  async function save() {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await apiRequest<AdminInquiry>(`admin/inquiries/${id}/`, {
        method: "PATCH",
        body: { status: currentStatus, internal_notes: currentNotes },
      });
      setData(updated);
      setStatus(null);
      setNotes(null);
      setFlash("Inquiry updated.");
    } catch (err) {
      setSaveError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await apiRequest(`admin/inquiries/${id}/`, { method: "DELETE" });
      router.replace("/admin/inquiries");
    } catch (err) {
      setSaveError(describeError(err));
    }
  }

  return (
    <>
      <BackLink />
      <PageTitle
        title={data.name}
        description={
          <span className="font-mono">
            {data.reference} · received {formatDateTime(data.created_at)}
          </span>
        }
        actions={
          <a href={`mailto:${data.email}?subject=${encodeURIComponent(`Shamflare — ${data.reference}`)}`} className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong px-3.5 text-sm hover:border-accent/50">
            <Mail className="size-4" aria-hidden /> Reply by email
          </a>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Project description">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-fg" dir="auto">
              {data.description}
            </p>
          </Panel>
          <Panel title="Details">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Email" value={<a href={`mailto:${data.email}`} className="text-accent hover:underline">{data.email}</a>} />
              <Detail label="Company" value={data.company || "—"} />
              <Detail label="Service" value={data.service_title || (data.service === "other" ? "Something else" : "—")} />
              <Detail label="Budget" value={BUDGET_LABELS[data.budget] ?? "—"} />
              <Detail label="Preferred language" value={localeNames[data.preferred_language as Locale] ?? data.preferred_language} />
              <Detail label="Consent to store details" value={data.consent ? "Yes" : "No"} />
              <Detail label="Email notification" value={data.notification_sent_at ? `Sent ${formatDateTime(data.notification_sent_at)}` : "Not sent (email not configured or failed)"} />
              <Detail label="Last updated" value={formatDateTime(data.updated_at)} />
            </dl>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Handling">
            <div className="space-y-4">
              {flash ? <Notice kind="success">{flash}</Notice> : null}
              {saveError ? <Notice kind="error">{saveError}</Notice> : null}
              <Field label="Status">
                {(props) => (
                  <select {...props} value={currentStatus} onChange={(e) => setStatus(e.target.value as InquiryStatus)} className={inputClass}>
                    {INQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Internal notes" hint="Visible only in the dashboard.">
                {(props) => <textarea {...props} rows={6} value={currentNotes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />}
              </Field>
              <Button onClick={save} disabled={!dirty || saving} className="w-full">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </Panel>
          <ConfirmButton
            title="Delete this inquiry?"
            message={<>The inquiry <span className="font-mono">{data.reference}</span> from {data.name} will be permanently deleted. Consider archiving it instead.</>}
            onConfirm={remove}
          >
            Delete inquiry
          </ConfirmButton>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="mt-1 text-fg">{value}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/admin/inquiries" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
      <ArrowLeft className="size-4" aria-hidden /> All inquiries
    </Link>
  );
}
