"use client";

import { ImageIcon, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { describeError } from "@/lib/admin/hooks";
import { errorsFrom } from "@/lib/admin/forms";
import { Button } from "@/components/ui/Button";
import { ConfirmButton, Notice, inputClass } from "./ui";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_MB = 5;

/** Validates a chosen file in the browser; the server validates again and is authoritative. */
function checkFile(file: File): string | null {
  if (!ACCEPT.split(",").includes(file.type)) return "Choose a JPEG, PNG or WebP image.";
  if (file.size > MAX_MB * 1024 * 1024) return `The image is larger than ${MAX_MB} MB.`;
  return null;
}

function uploadErrorMessage(error: unknown): string {
  const fields = errorsFrom(error);
  return fields.file ?? Object.values(fields)[0] ?? describeError(error);
}

/** Single cover image: upload, replace or remove. */
export function CoverUpload<T>({
  endpoint,
  current,
  disabledReason,
  onUpdated,
}: {
  endpoint: string;
  current: string | null;
  disabledReason?: string;
  onUpdated: (item: T) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    const problem = checkFile(file);
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      onUpdated(await apiRequest<T>(endpoint, { method: "POST", body: form }));
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function clear() {
    try {
      onUpdated(await apiRequest<T>(endpoint, { method: "DELETE" }));
    } catch (err) {
      setError(describeError(err));
    }
  }

  if (disabledReason) return <p className="text-sm text-muted">{disabledReason}</p>;

  return (
    <div className="space-y-3">
      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- dashboard preview of an uploaded file
          <img src={current} alt="Current cover" className="size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-xs text-subtle">
            <ImageIcon className="size-6" aria-hidden /> No cover image
          </span>
        )}
      </div>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" aria-label="Choose cover image" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          {current ? "Replace" : "Upload"}
        </Button>
        {current ? (
          <ConfirmButton title="Remove the cover image?" message="The file will be deleted from the server." confirmLabel="Remove" onConfirm={clear}>
            Remove
          </ConfirmButton>
        ) : null}
      </div>
      <p className="text-xs text-subtle">JPEG, PNG or WebP, up to {MAX_MB} MB. Describe the image in each translation’s “Cover alt text”.</p>
    </div>
  );
}

type GalleryImage = { id: number; url: string; alt_text: string };

/** Gallery images with alt text: add and delete. */
export function GalleryUpload<T>({
  endpoint,
  images,
  onUpdated,
}: {
  endpoint: string;
  images: GalleryImage[];
  onUpdated: (item: T) => void;
}) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function add() {
    if (!file) return setError("Choose an image first.");
    const problem = checkFile(file);
    if (problem) return setError(problem);
    if (!alt.trim()) return setError("Describe the image for people using screen readers.");
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("alt_text", alt.trim());
    try {
      onUpdated(await apiRequest<T>(endpoint, { method: "POST", body: form }));
      setFile(null);
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(imageId: number) {
    try {
      onUpdated(await apiRequest<T>(`${endpoint}${imageId}/`, { method: "DELETE" }));
    } catch (err) {
      setError(describeError(err));
    }
  }

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element -- dashboard preview */}
              <img src={image.url} alt={image.alt_text} className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <span className="truncate text-xs text-muted" title={image.alt_text}>
                  {image.alt_text}
                </span>
                <ConfirmButton title="Delete this image?" message="The file will be deleted from the server." onConfirm={() => remove(image.id)}>
                  <Trash2 className="size-4" aria-hidden />
                  <span className="sr-only">Delete image</span>
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No gallery images yet.</p>
      )}
      {error ? <Notice kind="error">{error}</Notice> : null}
      <div className="grid gap-3 rounded-[var(--radius-md)] border border-dashed border-line-strong p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
            Image
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:me-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-fg"
          />
        </div>
        <div>
          <label htmlFor={`${inputId}-alt`} className="mb-1.5 block text-sm font-medium">
            Alt text
          </label>
          <input id={`${inputId}-alt`} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} className={inputClass} />
        </div>
        <Button size="sm" onClick={add} disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          Add image
        </Button>
      </div>
    </div>
  );
}
