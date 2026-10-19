import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import type { AvailableLanguage } from "@/lib/api/types";

/** Public origin used for canonical URLs, hreflang, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shamflare.com").replace(/\/$/, "");

/** Fallback contact number if the CMS settings cannot be loaded. Digits only. */
export const DEFAULT_WHATSAPP_NUMBER = "905343299918";

export const ogLocales: Record<Locale, string> = { en: "en_US", tr: "tr_TR", ar: "ar_AR" };

/** wa.me expects the international number without "+" and a URL-encoded text. */
export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function localizedPath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Canonical + hreflang for pages that exist in every locale under the same path
 * (home, about, services index …).
 */
export function staticAlternates(locale: Locale, path = ""): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absoluteUrl(localizedPath(l, path));
  languages["x-default"] = absoluteUrl(localizedPath(defaultLocale, path));
  return { canonical: absoluteUrl(localizedPath(locale, path)), languages };
}

/**
 * Canonical + hreflang for CMS items whose slug differs per locale. Only locales
 * in which the item is actually published are announced.
 */
export function contentAlternates(
  locale: Locale,
  section: string,
  slug: string,
  available: AvailableLanguage[],
): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const entry of available) {
    languages[entry.language] = absoluteUrl(localizedPath(entry.language, `${section}/${entry.slug}`));
  }
  const fallback = available.find((entry) => entry.language === defaultLocale);
  if (fallback) languages["x-default"] = languages[defaultLocale];
  return { canonical: absoluteUrl(localizedPath(locale, `${section}/${slug}`)), languages };
}

export function formatDate(value: string, locale: Locale): string {
  const intlLocale = locale === "ar" ? "ar-u-nu-latn" : locale;
  return new Intl.DateTimeFormat(intlLocale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(value),
  );
}

/** Route params may arrive percent-encoded (e.g. Arabic slugs); decode defensively. */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Reads a positive integer from a search param (used for ?page=). */
export function pageParam(value: string | string[] | undefined): number {
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : (value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function stringParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}
