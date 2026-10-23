import type { Locale } from "@/i18n/routing";
import type { LegalKind } from "@/lib/api/types";
import { privacyPolicy } from "./privacy";
import { termsOfUse } from "./terms";

export { privacyPolicy, termsOfUse };

/**
 * Built-in documents: shown for any language that has no text in the dashboard
 * (Legal pages), and offered there as the starting text.
 */
export const legalDefaults: Record<LegalKind, Record<Locale, string>> = {
  privacy: privacyPolicy,
  terms: termsOfUse,
};

/** "Last updated" for the built-in documents. Change it whenever either default changes. */
export const LEGAL_UPDATED = "2026-10-23";
