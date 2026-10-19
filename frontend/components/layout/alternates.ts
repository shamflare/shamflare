"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/routing";

/**
 * Detail pages (service, project, article) have a different slug in each locale.
 * They register their localized paths here so the language switcher can link to
 * the equivalent page instead of guessing the URL.
 */
export type AlternatePaths = Partial<Record<Locale, string>>;

let current: AlternatePaths | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setAlternates(value: AlternatePaths | null) {
  current = value;
  listeners.forEach((listener) => listener());
}

export function useAlternates(): AlternatePaths | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

/** Renders nothing; registers the page's localized paths while mounted. */
export function LocaleAlternates({ paths }: { paths: AlternatePaths }) {
  const serialized = JSON.stringify(paths);
  useEffect(() => {
    setAlternates(JSON.parse(serialized) as AlternatePaths);
    return () => setAlternates(null);
  }, [serialized]);
  return null;
}
