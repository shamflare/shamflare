import { ApiError } from "@/lib/api/client";
import type { TranslationMap, TranslationState } from "./types";

/**
 * Flattens DRF-style field errors into `path → message`. Accepts both the
 * dotted keys documented in docs/api.md (`translations.tr.slug`) and nested
 * objects (`{ translations: { tr: { slug: [...] } } }`).
 */
export function flattenFieldErrors(fields: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string");
      if (first) result[path] = first;
      else value.forEach((item, i) => item && typeof item === "object" && Object.assign(result, flattenFieldErrors(item as Record<string, unknown>, `${path}.${i}`)));
    } else if (typeof value === "string") {
      result[path] = value;
    } else if (value && typeof value === "object") {
      Object.assign(result, flattenFieldErrors(value as Record<string, unknown>, path));
    }
  }
  return result;
}

export function errorsFrom(error: unknown): Record<string, string> {
  return error instanceof ApiError ? flattenFieldErrors(error.fields) : {};
}

/** Removes blank lines from list fields and empty process steps before saving. */
export function cleanTranslations<T extends Record<string, unknown>>(map: TranslationMap<T>): TranslationMap<T> {
  const result: TranslationMap<T> = {};
  for (const [locale, translation] of Object.entries(map) as [keyof TranslationMap<T>, T | null | undefined][]) {
    if (translation === undefined) continue;
    if (translation === null) {
      result[locale] = null;
      continue;
    }
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(translation)) {
      if (Array.isArray(value)) {
        cleaned[key] = value
          .map((item) => (typeof item === "string" ? item.trim() : item))
          .filter((item) =>
            typeof item === "string"
              ? item.length > 0
              : item && typeof item === "object"
                ? Object.values(item).some((v) => typeof v === "string" && v.trim())
                : true,
          );
      } else {
        cleaned[key] = typeof value === "string" ? value.trim() : value;
      }
    }
    result[locale] = cleaned as T;
  }
  return result;
}

export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "slug" | "textarea" | "markdown" | "list" | "process";
  required?: boolean;
  hint?: string;
  maxLength?: number;
};

export type Translation = Record<string, unknown> & { status?: "draft" | "published" };

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function localState<T extends Translation>(translation: T | null | undefined, fields: FieldDef[]): TranslationState {
  if (!translation) return "missing";
  if (fields.some((f) => f.required && !isFilled(translation[f.name]))) return "incomplete";
  if (translation.status === undefined) return "published";
  return translation.status;
}
