import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getService, getServices, isUnavailable } from "@/lib/api/server";
import { contentAlternates, decodeParam } from "@/lib/site";
import { LocaleAlternates } from "@/components/layout/alternates";
import { ProjectCard } from "@/components/content/Cards";
import { Markdown } from "@/components/content/Markdown";
import { Breadcrumbs } from "@/components/content/Navigation";
import { ArticleSkeleton, UnavailableState } from "@/components/content/States";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

type Props = PageProps<"/[locale]/services/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const service = await getService(locale, decodeParam(slug));
  if (!service || isUnavailable(service)) return {};
  return {
    title: service.seo_title || service.title,
    description: service.seo_description || service.summary,
    alternates: contentAlternates(locale, "services", service.slug, service.available_languages),
    openGraph: { title: service.seo_title || service.title, description: service.seo_description || service.summary },
  };
}

export default function ServiceDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

async function ServiceDetail({ params }: Pick<Props, "params">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const service = await getService(locale, decodeParam(slug));
  if (isUnavailable(service)) {
    return (
      <Container className="py-24">
        <UnavailableState />
      </Container>
    );
  }
  if (!service) notFound();

  const [t, tc, tn] = await Promise.all([
    getTranslations({ locale, namespace: "Services" }),
    getTranslations({ locale, namespace: "Common" }),
    getTranslations({ locale, namespace: "Nav" }),
  ]);

  const alternates = Object.fromEntries(service.available_languages.map((a) => [a.language, `/services/${a.slug}`]));

  return (
    <>
      <LocaleAlternates paths={alternates} />
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(70%_80%_at_50%_0%,black,transparent)]" />
        <Container className="relative pt-12 pb-16 sm:pt-16 sm:pb-20">
          <Breadcrumbs
            items={[
              { label: tc("home"), href: "/" },
              { label: tn("services"), href: "/services" },
              { label: service.title },
            ]}
          />
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <span className="grid size-16 shrink-0 place-items-center rounded-[var(--radius-lg)] border border-line bg-surface text-accent">
              <ServiceIcon name={service.icon} className="size-8" />
            </span>
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold sm:text-5xl">{service.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{service.summary}</p>
              <ButtonLink href="/contact" size="lg" className="mt-8">
                {tn("startProject")}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </header>

      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Markdown>{service.description}</Markdown>
          </div>
          {service.capabilities.length > 0 ? (
            <aside aria-labelledby="capabilities-title" className="lg:col-span-5">
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-7">
                <h2 id="capabilities-title" className="text-lg font-semibold">
                  {t("capabilities")}
                </h2>
                <ul className="mt-5 grid gap-3.5">
                  {service.capabilities.map((item) => (
                    <li key={item} className="flex gap-3 text-muted">
                      <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </Section>

      {service.use_cases.length > 0 ? (
        <Section aria-labelledby="use-cases-title" className="border-t border-line bg-bg-deep/60">
          <h2 id="use-cases-title" className="text-3xl font-semibold">
            {t("useCases")}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.use_cases.map((item) => (
              <li key={item} className="reveal rounded-[var(--radius-md)] border border-line bg-surface px-5 py-4 leading-relaxed text-muted">
                {item}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {service.process.length > 0 ? (
        <Section aria-labelledby="process-title" className="border-t border-line">
          <h2 id="process-title" className="text-3xl font-semibold">
            {t("process")}
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <li key={`${step.title}-${index}`} className="reveal border-t border-accent/40 pt-6">
                <span className="font-mono text-xs text-subtle" dir="ltr">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {service.related_projects.length > 0 ? (
        <Section aria-labelledby="related-title" className="border-t border-line">
          <h2 id="related-title" className="text-3xl font-semibold">
            {t("relatedProjects")}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.related_projects.map((project) => (
              <div key={project.id} className="flex [&>article]:flex-1">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="pt-0">
        <div className="bg-grid rounded-[var(--radius-xl)] border border-line bg-surface p-8 sm:p-12">
          <h2 className="max-w-2xl text-2xl font-semibold sm:text-3xl">{t("ctaTitle", { service: service.title })}</h2>
          <p className="mt-4 max-w-2xl text-muted">{t("ctaBody")}</p>
          <ButtonLink href="/contact" size="lg" className="mt-8">
            {tn("startProject")}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </ButtonLink>
        </div>
        <Suspense fallback={null}>
          <OtherServices locale={locale} currentId={service.id} title={t("otherServices")} />
        </Suspense>
      </Section>
    </>
  );
}

async function OtherServices({ locale, currentId, title }: { locale: Locale; currentId: number; title: string }) {
  const data = await getServices(locale);
  if (!data || isUnavailable(data)) return null;
  const others = data.results.filter((service) => service.id !== currentId);
  if (others.length === 0) return null;
  return (
    <nav aria-label={title} className="mt-14">
      <h2 className="text-sm font-semibold tracking-wide text-subtle uppercase">{title}</h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {others.map((service) => (
          <li key={service.id}>
            <Link
              href={`/services/${service.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg"
            >
              <ServiceIcon name={service.icon} className="size-4 text-accent" />
              {service.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
