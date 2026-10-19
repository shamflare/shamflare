"use client";

import Link from "next/link";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { PublishStatus, TranslationState } from "@/lib/admin/types";
import { locales, type Locale } from "@/i18n/routing";

export const inputClass =
  "block w-full rounded-[var(--radius-md)] border border-line-strong bg-bg px-3 py-2 text-sm text-fg placeholder:text-subtle " +
  "outline-none transition-[border-color,box-shadow] focus:border-accent/70 focus:ring-2 focus:ring-accent/25 " +
  "aria-[invalid=true]:border-danger/70 disabled:opacity-60";

export function PageTitle({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-[var(--radius-lg)] border border-line bg-surface", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Notice({ kind, children }: { kind: "success" | "error" | "info"; children: ReactNode }) {
  const Icon = kind === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm",
        kind === "success" && "border-success/30 bg-success/5",
        kind === "error" && "border-danger/40 bg-danger/5",
        kind === "info" && "border-line bg-surface-2 text-muted",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", kind === "success" ? "text-success" : kind === "error" ? "text-danger" : "text-accent")}
        aria-hidden
      />
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-10 text-sm text-muted">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  published: "border-success/40 text-success",
  draft: "border-line-strong text-muted",
  incomplete: "border-warning/40 text-warning",
  missing: "border-danger/40 text-danger",
  new: "border-accent/50 text-accent",
  in_progress: "border-accent-3/50 text-accent-3",
  completed: "border-success/40 text-success",
  archived: "border-line text-subtle",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize", statusStyles[status] ?? statusStyles.draft)}>
      {label ?? status.replace("_", " ")}
    </span>
  );
}

/** Compact EN / TR / AR indicators showing each translation's state. */
export function TranslationBadges({ status }: { status: Partial<Record<Locale, TranslationState>> }) {
  return (
    <span className="inline-flex gap-1">
      {locales.map((l) => {
        const state = status[l] ?? "missing";
        return (
          <span
            key={l}
            title={`${l.toUpperCase()}: ${state}`}
            className={cn("rounded border px-1.5 py-px font-mono text-[0.65rem] uppercase", statusStyles[state])}
          >
            {l}
            <span className="sr-only"> {state}</span>
          </span>
        );
      })}
    </span>
  );
}

export function PublishSelect({ value, onChange, id }: { value: PublishStatus; onChange: (v: PublishStatus) => void; id?: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as PublishStatus)} className={inputClass}>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
    </select>
  );
}

type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
  className?: string;
};

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
        {required ? <span className="ms-1 text-accent" aria-hidden>*</span> : null}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-accent)]" />
      <span>
        <span className="font-medium text-fg">{label}</span>
        {hint ? <span className="block text-xs text-subtle">{hint}</span> : null}
      </span>
    </label>
  );
}

/** A button that asks for confirmation in a modal dialog before running `onConfirm`. */
export function ConfirmButton({
  children,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  variant = "ghost",
  className,
  disabled,
}: {
  children: ReactNode;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "ghost" | "secondary";
  className?: string;
  disabled?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const titleId = useId();

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      dialogRef.current?.close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={variant} size="sm" className={cn("text-danger hover:text-danger", className)} disabled={disabled} onClick={() => dialogRef.current?.showModal()}>
        {children}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-line bg-surface-2 p-6 text-fg backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => dialogRef.current?.close()} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" onClick={confirm} disabled={busy} className="bg-danger text-on-accent hover:bg-danger/90 hover:shadow-none">
            {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}

export function AdminPagination({ page, count, pageSize, onPage }: { page: number; count: number; pageSize: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm text-muted">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page} of {pages} · {count} total
      </span>
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </nav>
  );
}

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={cn("font-medium text-fg hover:text-accent", className)} />;
}

/** Auto-dismissing success message after saves. */
export function useFlash(timeout = 4000) {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), timeout);
    return () => clearTimeout(timer);
  }, [message, timeout]);
  return [message, setMessage] as const;
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
