import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, Eye, Gauge, ShieldCheck, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSiteSettings, isUnavailable } from "@/lib/api/server";
import { staticAlternates } from "@/lib/site";
import { Markdown } from "@/components/content/Markdown";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader, Section } from "@/components/ui/Section";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: staticAlternates(locale, "about"),
  };
}

const PRINCIPLES = [
  [1, Gauge],
  [2, Eye],
  [3, Users],
  [4, ShieldCheck],
] as const;

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={
          <Suspense fallback={t("intro")}>
            <AboutIntro locale={locale} fallback={t("intro")} />
          </Suspense>
        }
      />

      <Section aria-labelledby="principles-title">
        <h2 id="principles-title" className="text-3xl font-semibold sm:text-4xl">
          {t("principlesTitle")}
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {PRINCIPLES.map(([n, Icon]) => (
            <li key={n} className="reveal rounded-[var(--radius-lg)] border border-line bg-surface p-7">
              <Icon className="size-6 text-accent" strokeWidth={1.6} aria-hidden />
              <h3 className="mt-6 text-xl font-semibold">{t(`principle${n}Title`)}</h3>
              <p className="mt-3 leading-relaxed text-muted">{t(`principle${n}Body`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Suspense fallback={null}>
        <AboutBody locale={locale} title={t("approachTitle")} />
      </Suspense>

      <Section className="pt-0">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-xl)] border border-line bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">{t("ctaTitle")}</h2>
            <p className="mt-3 text-muted">{t("ctaBody")}</p>
          </div>
          <ButtonLink href="/contact" size="lg">
            {(await getTranslations({ locale, namespace: "Nav" }))("startProject")}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}

async function AboutIntro({ locale, fallback }: { locale: Locale; fallback: string }) {
  const settings = await getSiteSettings(locale);
  return <>{(settings && !isUnavailable(settings) && settings.about_intro) || fallback}</>;
}

/** Long-form "approach" text, edited in the dashboard (Site settings → About). */
async function AboutBody({ locale, title }: { locale: Locale; title: string }) {
  const settings = await getSiteSettings(locale);
  if (!settings || isUnavailable(settings) || !settings.about_body.trim()) return null;
  return (
    <Section aria-labelledby="approach-title" className="border-t border-line">
      <div className="grid gap-10 lg:grid-cols-12">
        <h2 id="approach-title" className="text-3xl font-semibold sm:text-4xl lg:col-span-4">
          {title}
        </h2>
        <Markdown className="lg:col-span-8">{settings.about_body}</Markdown>
      </div>
    </Section>
  );
}
