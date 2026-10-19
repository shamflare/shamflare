"use client";

import Link from "next/link";
import { ArrowLeft, LoaderCircle, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmButton, Notice, PageTitle, Spinner } from "@/components/admin/ui";

/** Common frame for content editors: back link, title, notices, sticky save bar. */
export function EditorLayout({
  backHref,
  backLabel,
  title,
  description,
  loadError,
  loading,
  formError,
  flash,
  saving,
  onSave,
  onDelete,
  deleteTitle,
  deleteMessage,
  isNew,
  children,
  aside,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description?: ReactNode;
  loadError: string;
  loading: boolean;
  formError: string;
  flash: string | null;
  saving: boolean;
  onSave: () => void;
  onDelete: () => Promise<void>;
  deleteTitle: string;
  deleteMessage: ReactNode;
  isNew: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <>
      <Link href={backHref} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> {backLabel}
      </Link>
      {loadError ? (
        <Notice kind="error">{loadError}</Notice>
      ) : loading ? (
        <Spinner />
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          noValidate
        >
          <PageTitle title={title} description={description} />
          <div className="mb-6 space-y-3" aria-live="polite">
            {formError ? <Notice kind="error">{formError}</Notice> : null}
            {flash ? <Notice kind="success">{flash}</Notice> : null}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
            <div className="min-w-0 space-y-6">{children}</div>
            <div className="space-y-6">{aside}</div>
          </div>
          <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-4 border-t border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            {!isNew ? (
              <ConfirmButton title={deleteTitle} message={deleteMessage} onConfirm={onDelete}>
                <Trash2 className="size-4" aria-hidden /> Delete
              </ConfirmButton>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
              {saving ? "Saving…" : isNew ? "Create" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
