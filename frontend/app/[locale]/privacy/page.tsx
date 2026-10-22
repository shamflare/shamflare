import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { privacyPolicy } from "@/content/legal";
import { staticAlternates } from "@/lib/site";
import { LegalPage } from "@/features/legal/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: staticAlternates(locale, "privacy"),
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Legal" });
  return <LegalPage locale={locale} title={t("privacyTitle")} body={privacyPolicy[locale]} />;
}
