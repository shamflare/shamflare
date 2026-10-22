import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LEGAL_UPDATED } from "@/content/legal";
import { formatDate } from "@/lib/site";
import { Markdown } from "@/components/content/Markdown";
import { PageHeader, Section } from "@/components/ui/Section";

/** Shared layout for the Privacy Policy and Terms of Use pages. */
export async function LegalPage({ locale, title, body }: { locale: Locale; title: string; body: string }) {
  const t = await getTranslations({ locale, namespace: "Legal" });
  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={title}
        description={t("updated", { date: formatDate(LEGAL_UPDATED, locale) })}
      />
      <Section>
        <Markdown className="max-w-3xl">{body}</Markdown>
      </Section>
    </>
  );
}
