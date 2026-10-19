import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { defaultLocale, isLocale } from "./routing";

// The locale comes from the `[locale]` root segment rather than request headers,
// so localized pages stay statically renderable with Cache Components.
export default getRequestConfig(async () => {
  const requested = await rootLocale();
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "UTC",
  };
});
