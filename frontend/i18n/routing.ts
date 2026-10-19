import { defineRouting } from "next-intl/routing";

export const locales = ["en", "tr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const rtlLocales: ReadonlySet<Locale> = new Set(["ar"]);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function directionOf(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

/** Native names, shown in the language switcher regardless of the active locale. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
};
