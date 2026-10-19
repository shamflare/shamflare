import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getServices, getSiteSettings, isUnavailable } from "@/lib/api/server";
import { DEFAULT_WHATSAPP_NUMBER, staticAlternates, whatsappUrl } from "@/lib/site";
import { PageHeader, Section } from "@/components/ui/Section";
import { InquiryForm } from "@/features/contact/InquiryForm";

type Props = PageProps<"/[locale]/contact">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
    alternates: staticAlternates(locale, "contact"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
      <Section className="pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 sm:p-10">
              <Suspense fallback={<InquiryForm services={[]} />}>
                <FormWithServices locale={locale} />
              </Suspense>
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-5 xl:col-span-4">
            <Suspense fallback={<DirectContact locale={locale} whatsapp={whatsappUrl(DEFAULT_WHATSAPP_NUMBER)} email="" />}>
              <DirectContactFromSettings locale={locale} />
            </Suspense>
            <div className="flex gap-3 rounded-[var(--radius-lg)] border border-line p-6 text-sm leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <p>{t("responseNote")}</p>
                <p className="mt-2">{t("privacyNote")}</p>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

async function FormWithServices({ locale }: { locale: Locale }) {
  const data = await getServices(locale);
  const services = data && !isUnavailable(data) ? data.results.map(({ key, title }) => ({ key, title })) : [];
  return <InquiryForm services={services} />;
}

async function DirectContactFromSettings({ locale }: { locale: Locale }) {
  const [settings, tWa] = await Promise.all([getSiteSettings(locale), getTranslations({ locale, namespace: "WhatsApp" })]);
  const usable = settings && !isUnavailable(settings) ? settings : null;
  const whatsapp = usable
    ? whatsappUrl(usable.whatsapp_number, usable.whatsapp_message || tWa("defaultMessage"))
    : whatsappUrl(DEFAULT_WHATSAPP_NUMBER, tWa("defaultMessage"));
  return <DirectContact locale={locale} whatsapp={whatsapp} email={usable?.contact_email ?? ""} />;
}

async function DirectContact({ locale, whatsapp, email }: { locale: Locale; whatsapp: string; email: string }) {
  const t = await getTranslations({ locale, namespace: "Contact" });
  const tc = await getTranslations({ locale, namespace: "Common" });
  const row =
    "flex items-center gap-4 rounded-[var(--radius-md)] border border-line bg-bg px-4 py-3.5 transition-colors hover:border-accent/40";
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6">
      <h2 className="text-lg font-semibold">{t("directTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("directBody")}</p>
      <ul className="mt-6 grid gap-3">
        {whatsapp ? (
          <li>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={row}>
              <MessageCircle className="size-5 text-[#25D366]" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-fg">{t("whatsapp")}</span>
                <span className="block text-sm text-muted" dir="ltr">
                  +{whatsapp.replace("https://wa.me/", "").split("?")[0]}
                </span>
              </span>
              <span className="sr-only">{tc("opensInNewTab")}</span>
            </a>
          </li>
        ) : null}
        {email ? (
          <li>
            <a href={`mailto:${email}`} className={row}>
              <Mail className="size-5 text-accent" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-fg">{t("email")}</span>
                <span className="block text-sm break-all text-muted" dir="ltr">
                  {email}
                </span>
              </span>
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
