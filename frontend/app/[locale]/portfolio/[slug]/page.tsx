import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProject, isUnavailable } from "@/lib/api/server";
import { contentAlternates, decodeParam } from "@/lib/site";
import { LocaleAlternates } from "@/components/layout/alternates";
import { Markdown } from "@/components/content/Markdown";
import { Breadcrumbs } from "@/components/content/Navigation";
import { ArticleSkeleton, UnavailableState } from "@/components/content/States";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Badge, Container, Section } from "@/components/ui/Section";

type Props = PageProps<"/[locale]/portfolio/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const project = await getProject(locale, decodeParam(slug));
  if (!project || isUnavailable(project)) return {};
  const title = project.seo_title || project.title;
  const description = project.seo_description || project.summary;
  return {
    title,
    description,
    alternates: contentAlternates(locale, "portfolio", project.slug, project.available_languages),
    openGraph: {
      title,
      description,
      ...(project.cover_image ? { images: [{ url: project.cover_image, alt: project.cover_alt }] } : {}),
    },
  };
}

export default function ProjectDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: Pick<Props, "params">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const project = await getProject(locale, decodeParam(slug));
  if (isUnavailable(project)) {
    return (
      <Container className="py-24">
        <UnavailableState />
      </Container>
    );
  }
  if (!project) notFound();

  const [t, tc, tn] = await Promise.all([
    getTranslations({ locale, namespace: "Portfolio" }),
    getTranslations({ locale, namespace: "Common" }),
    getTranslations({ locale, namespace: "Nav" }),
  ]);
  const alternates = Object.fromEntries(project.available_languages.map((a) => [a.language, `/portfolio/${a.slug}`]));

  return (
    <article>
      <LocaleAlternates paths={alternates} />
      <header className="border-b border-line">
        <Container className="pt-12 pb-14 sm:pt-16">
          <Breadcrumbs
            items={[
              { label: tc("home"), href: "/" },
              { label: tn("portfolio"), href: "/portfolio" },
              { label: project.title },
            ]}
          />
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {project.category ? <p className="eyebrow me-2">{project.category.title}</p> : null}
              {project.is_demo ? (
                <Badge className="border-accent-3/40 text-accent-3">{tc("demoBadge")}</Badge>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{project.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{project.summary}</p>
            {project.external_url ? (
              <a
                href={project.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "secondary", className: "mt-8" })}
              >
                {tc("externalLink")}
                <ExternalLink className="size-4" aria-hidden />
                <span className="sr-only">{tc("opensInNewTab")}</span>
              </a>
            ) : null}
          </div>
          {project.is_demo ? (
            <p className="mt-8 flex max-w-3xl gap-3 rounded-[var(--radius-md)] border border-accent-3/30 bg-accent-3/5 px-4 py-3 text-sm leading-relaxed text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-accent-3" aria-hidden />
              {tc("demoNotice")}
            </p>
          ) : null}
        </Container>
      </header>

      {project.cover_image ? (
        <Container className="pt-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] border border-line">
            <Image src={project.cover_image} alt={project.cover_alt} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
          </div>
        </Container>
      ) : null}

      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Markdown>{project.body}</Markdown>
          </div>
          <aside className="space-y-8 lg:col-span-4">
            {project.technologies.length > 0 ? (
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-subtle uppercase">{t("technologies")}</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li key={tech}>
                      <Badge dir="ltr" className="px-3 py-1 text-sm">
                        {tech}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {project.services.length > 0 ? (
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-subtle uppercase">{t("services")}</h2>
                <ul className="mt-4 grid gap-2">
                  {project.services.map((service) => (
                    <li key={service.key}>
                      <Link href={`/services/${service.slug}`} className="text-accent underline-offset-4 hover:underline">
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {project.images.length > 0 ? (
          <section aria-labelledby="gallery-title" className="mt-20">
            <h2 id="gallery-title" className="text-2xl font-semibold">
              {t("gallery")}
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {project.images.map((image) => (
                <li key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-line">
                  <Image src={image.url} alt={image.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
            {t("backToPortfolio")}
          </Link>
          <ButtonLink href="/contact">
            {tn("startProject")}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </ButtonLink>
        </div>
      </Section>
    </article>
  );
}
