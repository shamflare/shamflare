import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LEGAL_UPDATED, legalDefaults } from "@/content/legal";
import { getLegalDocument, isUnavailable } from "@/lib/api/server";
import type { LegalKind } from "@/lib/api/types";
import { formatDate } from "@/lib/site";
import { Markdown } from "@/components/content/Markdown";
import { PageHeader, Section } from "@/components/ui/Section";

type Props = { locale: Locale; kind: LegalKind; title: string };

/**
 * Privacy Policy / Terms of Use. The text edited in the dashboard (Legal pages)
 * wins; a language without text there, or an unreachable API, shows the
 * built-in document from content/legal, so the page is never empty.
 */
export function LegalPage(props: Props) {
  return (
    <Suspense fallback={<LegalDocumentView {...props} body={legalDefaults[props.kind][props.locale]} updated={LEGAL_UPDATED} />}>
      <LegalFromCms {...props} />
    </Suspense>
  );
}

async function LegalFromCms(props: Props) {
  const document = await getLegalDocument(props.kind, props.locale);
  const fromCms = document && !isUnavailable(document) && document.body.trim() ? document : null;
  return (
    <LegalDocumentView
      {...props}
      body={fromCms?.body ?? legalDefaults[props.kind][props.locale]}
      updated={fromCms?.updated_at ?? LEGAL_UPDATED}
    />
  );
}

async function LegalDocumentView({ locale, title, body, updated }: Props & { body: string; updated: string }) {
  const t = await getTranslations({ locale, namespace: "Legal" });
  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={title} description={t("updated", { date: formatDate(updated, locale) })} />
      <Section>
        <Markdown className="max-w-3xl">{body}</Markdown>
      </Section>
    </>
  );
}
