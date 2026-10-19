"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";
import { describeError } from "@/lib/admin/hooks";
import { errorsFrom } from "@/lib/admin/forms";
import { useFlash } from "@/components/admin/ui";

type Options<T> = {
  /** Collection endpoint, e.g. `admin/services/`. */
  endpoint: string;
  /** Dashboard path of the list page, e.g. `/admin/services`. */
  listPath: string;
  /** `"new"` creates a record. */
  id: string;
  createEmpty: () => T;
  /** Shapes the request body from the editor state. */
  toPayload: (item: T) => unknown;
};

export function useEditor<T extends { id?: number }>({ endpoint, listPath, id, createEmpty, toPayload }: Options<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = id === "new";
  const [item, setItem] = useState<T | null>(isNew ? createEmpty() : null);
  const [loadError, setLoadError] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useFlash();
  const [justCreated] = useState(() => searchParams.get("created") === "1");

  useEffect(() => {
    if (isNew) return;
    const controller = new AbortController();
    apiRequest<T>(`${endpoint}${id}/`, { signal: controller.signal })
      .then(setItem)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(describeError(err));
      });
    return () => controller.abort();
  }, [endpoint, id, isNew]);

  async function save() {
    if (!item || saving) return;
    setSaving(true);
    setErrors({});
    setFormError("");
    try {
      const saved = await apiRequest<T>(isNew ? endpoint : `${endpoint}${id}/`, {
        method: isNew ? "POST" : "PUT",
        body: toPayload(item),
      });
      setItem(saved);
      if (isNew && saved.id) {
        // The editor remounts on the new URL; the flag carries the confirmation across.
        router.replace(`${listPath}/${saved.id}?created=1`);
      } else {
        setFlash("Saved. Published changes appear on the website within about a minute.");
      }
    } catch (err) {
      const fieldErrors = errorsFrom(err);
      setErrors(fieldErrors);
      setFormError(
        err instanceof ApiError && err.status === 400
          ? Object.keys(fieldErrors).length > 0
            ? "Some fields need attention — check the highlighted fields and every language tab marked with a red dot."
            : err.message
          : describeError(err),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await apiRequest(`${endpoint}${id}/`, { method: "DELETE" });
      router.replace(listPath);
    } catch (err) {
      setFormError(describeError(err));
    }
  }

  /** Applies a response from a side endpoint (e.g. image upload) that returns the item. */
  function replace(next: T) {
    setItem(next);
  }

  const message = flash ?? (justCreated ? "Created. Published items appear on the website within about a minute." : null);
  return { item, setItem, isNew, loadError, errors, formError, setFormError, saving, flash: message, setFlash, save, remove, replace };
}
