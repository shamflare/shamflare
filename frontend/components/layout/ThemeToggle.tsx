"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_PREFERENCES, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const LIGHT_QUERY = "(prefers-color-scheme: light)";
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
const LABEL_KEYS = { system: "themeSystem", light: "themeLight", dark: "themeDark" } as const;

// A tiny external store so every toggle instance (header, mobile menu) agrees.
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function applyTheme(preference: ThemePreference) {
  const resolved = preference === "system" ? (matchMedia(LIGHT_QUERY).matches ? "light" : "dark") : preference;
  document.documentElement.dataset.theme = resolved;
}

function setPreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  applyTheme(preference);
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/** Cycles system → light → dark. The icon shows the current preference. */
export function ThemeToggle() {
  const t = useTranslations("Nav");
  // `null` on the server and during hydration: the preference is only known in the browser.
  const preference = useSyncExternalStore<ThemePreference | null>(subscribe, readPreference, () => null);

  // Re-apply on mount: switching locale re-renders <html> on the client, which
  // drops the data-theme set by the head script. Layout effect = before paint.
  useLayoutEffect(() => applyTheme(readPreference()), []);

  // While following the system, track OS changes live.
  useEffect(() => {
    if (preference !== "system") return;
    const query = matchMedia(LIGHT_QUERY);
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  const current = preference ?? "system";
  const next = THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(current) + 1) % THEME_PREFERENCES.length];
  const Icon = ICONS[current];

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={`${t("theme")}: ${t(LABEL_KEYS[current])}`}
      title={`${t("theme")}: ${t(LABEL_KEYS[current])}`}
      className="grid size-9 place-items-center rounded-[var(--radius-md)] text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Icon className={preference ? "size-4" : "size-4 opacity-0"} aria-hidden />
    </button>
  );
}
