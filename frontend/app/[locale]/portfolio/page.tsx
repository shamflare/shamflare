import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProjects, getServices, isUnavailable } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { pageParam, staticAlternates, stringParam } from "@/lib/site";
import { ProjectCard } from "@/components/content/Cards";
import { Pagination } from "@/components/content/Navigation";
import { CardGridSkeleton, EmptyState, UnavailableState } from "@/components/content/States";
import { PageHeader, Section } from "@/components/ui/Section";

const PAGE_SIZE = 9;

type Props = PageProps<"/[locale]/portfolio">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("portfolioTitle"),
    description: t("portfolioDescription"),
    alternates: staticAlternates(locale, "portfolio"),
  };
}

export default async function PortfolioPage({ params, searchParams }: Props) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Portfolio" });
  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
      <Section className="pt-12 sm:pt-16">
        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <ProjectListing locale={locale} searchParams={searchParams} />
        </Suspense>
      </Section>
    </>
  );
}

async function ProjectListing({ locale, searchParams }: { locale: Locale; searchParams: Props["searchParams"] }) {
  const query = await searchParams;
  const service = stringParam(query.service);
  const page = pageParam(query.page);

  const [projects, services, t] = await Promise.all([
    getProjects(locale, { service: service || undefined, page, pageSize: PAGE_SIZE }),
    getServices(locale),
    getTranslations({ locale, namespace: "Portfolio" }),
  ]);

  const filters = services && !isUnavailable(services) ? services.results : [];
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors",
      active ? "border-accent/60 bg-accent/10 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
    );

  return (
    <>
      {filters.length > 0 ? (
        <nav aria-label={t("filterLabel")} className="mb-10">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/portfolio" className={chip(!service)} aria-current={!service ? "page" : undefined}>
                {t("filterAll")}
              </Link>
            </li>
            {filters.map((item) => (
              <li key={item.key}>
                <Link
                  href={{ pathname: "/portfolio", query: { service: item.key } }}
                  className={chip(service === item.key)}
                  aria-current={service === item.key ? "page" : undefined}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {isUnavailable(projects) ? (
        <UnavailableState />
      ) : !projects || projects.results.length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.results.map((project, index) => (
              <div key={project.id} className="flex [&>article]:flex-1">
                <ProjectCard project={project} priority={index < 3} />
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={Math.ceil(projects.count / PAGE_SIZE)}
            hrefFor={(n) => {
              const params = new URLSearchParams();
              if (service) params.set("service", service);
              if (n > 1) params.set("page", String(n));
              const qs = params.toString();
              return qs ? `/portfolio?${qs}` : "/portfolio";
            }}
          />
        </>
      )}
    </>
  );
}
