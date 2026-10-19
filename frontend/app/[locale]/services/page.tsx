import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getServices, isUnavailable } from "@/lib/api/server";
import { staticAlternates } from "@/lib/site";
import { CardGridSkeleton, EmptyState, UnavailableState } from "@/components/content/States";
import { PageHeader, Section } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("servicesTitle"),
    description: t("servicesDescription"),
    alternates: staticAlternates(locale, "services"),
  };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Services" });
  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
      <Section>
        <Suspense fallback={<CardGridSkeleton count={4} className="lg:grid-cols-2" />}>
          <ServiceList locale={locale} />
        </Suspense>
      </Section>
    </>
  );
}

async function ServiceList({ locale }: { locale: Locale }) {
  const [data, t, tc] = await Promise.all([
    getServices(locale),
    getTranslations({ locale, namespace: "Services" }),
    getTranslations({ locale, namespace: "Common" }),
  ]);
  if (isUnavailable(data)) return <UnavailableState />;
  const services = data?.results ?? [];
  if (services.length === 0) return <EmptyState message={t("empty")} />;

  return (
    <ol className="grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line">
      {services.map((service, index) => (
        <li key={service.id} className="group reveal relative bg-bg transition-colors hover:bg-surface">
          <div className="grid gap-6 p-7 sm:p-10 md:grid-cols-12 md:items-center">
            <div className="flex items-center gap-5 md:col-span-5">
              <span className="font-mono text-sm text-subtle" dir="ltr">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="grid size-14 shrink-0 place-items-center rounded-[var(--radius-md)] border border-line bg-surface text-accent transition-colors group-hover:border-accent/40">
                <ServiceIcon name={service.icon} className="size-7" />
              </span>
              <h2 className="text-2xl font-semibold">
                <Link
                  href={`/services/${service.slug}`}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                >
                  {service.title}
                </Link>
              </h2>
            </div>
            <p className="leading-relaxed text-muted md:col-span-6">{service.summary}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent md:col-span-1 md:justify-end">
              <span className="md:sr-only">{tc("viewService")}</span>
              <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
