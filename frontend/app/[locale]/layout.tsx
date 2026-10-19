import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { directionOf, locales, routing, type Locale } from "@/i18n/routing";
import { getServices, getSiteSettings, isUnavailable } from "@/lib/api/server";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_WHATSAPP_NUMBER, SITE_URL, ogLocales, staticAlternates, whatsappUrl } from "@/lib/site";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

// Namespaces needed by Client Components; everything else stays on the server.
const CLIENT_NAMESPACES = ["Nav", "Common", "Form", "Error", "WhatsApp"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0b1220",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("defaultTitle"), template: `%s | ${t("siteName")}` },
    description: t("defaultDescription"),
    applicationName: "Shamflare",
    alternates: staticAlternates(locale),
    openGraph: {
      type: "website",
      siteName: "Shamflare",
      locale: ogLocales[locale],
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
    twitter: { card: "summary_large_image" },
  };
}

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}

/** Footer + floating WhatsApp link, fed by CMS settings when available. */
async function SiteChrome({ locale }: { locale: Locale }) {
  const [settingsResult, servicesResult, year, tWa] = await Promise.all([
    getSiteSettings(locale),
    getServices(locale),
    currentYear(),
    getTranslations({ locale, namespace: "WhatsApp" }),
  ]);
  const settings = settingsResult && !isUnavailable(settingsResult) ? settingsResult : null;
  const services = servicesResult && !isUnavailable(servicesResult) ? servicesResult.results : [];
  const href = settings
    ? whatsappUrl(settings.whatsapp_number, settings.whatsapp_message || tWa("defaultMessage"))
    : whatsappUrl(DEFAULT_WHATSAPP_NUMBER, tWa("defaultMessage"));

  return (
    <>
      <SiteFooter settings={settings} services={services} whatsappHref={href} year={year} />
      <WhatsAppButton href={href} label={tWa("label")} short={tWa("short")} />
    </>
  );
}

async function SiteChromeFallback({ locale }: { locale: Locale }) {
  const [year, tWa] = await Promise.all([currentYear(), getTranslations({ locale, namespace: "WhatsApp" })]);
  const href = whatsappUrl(DEFAULT_WHATSAPP_NUMBER, tWa("defaultMessage"));
  return (
    <>
      <SiteFooter settings={null} services={[]} whatsappHref={href} year={year} />
      <WhatsAppButton href={href} label={tWa("label")} short={tWa("short")} />
    </>
  );
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [messages, t] = await Promise.all([getMessages(), getTranslations({ locale, namespace: "Common" })]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={fontVariables}
    >
      <body id="top">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <a
            href="#main"
            className="fixed start-4 top-3 z-[100] -translate-y-20 rounded-[var(--radius-md)] bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-transform focus:translate-y-0"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Suspense fallback={<SiteChromeFallback locale={locale} />}>
            <SiteChrome locale={locale} />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
