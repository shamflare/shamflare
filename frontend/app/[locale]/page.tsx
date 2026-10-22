import type { Metadata } from "next";
import { Suspense, type CSSProperties } from "react";
import { ArrowRight, Compass, Hammer, LifeBuoy, PenTool } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPosts, getProjects, getServices, getSiteSettings, isUnavailable } from "@/lib/api/server";
import { DEFAULT_WHATSAPP_NUMBER, staticAlternates, whatsappUrl } from "@/lib/site";
import { PostCard, ProjectCard, ServiceCard } from "@/components/content/Cards";
import { CardGridSkeleton, EmptyState, UnavailableState } from "@/components/content/States";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { HeroVisual } from "@/features/home/HeroVisual";
import { CapabilityGrid } from "@/features/home/CapabilityGrid";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: { absolute: t("homeTitle") },
    alternates: staticAlternates(locale),
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <>
      <Hero locale={locale} />

      {/* Introduction */}
      <Section aria-labelledby="intro-title" className="border-b border-line">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-5">
            <p className="eyebrow mb-4">{t("introEyebrow")}</p>
            <h2 id="intro-title" className="text-3xl font-semibold sm:text-4xl">
              {t("introTitle")}
            </h2>
          </div>
          <div className="reveal lg:col-span-7">
            <p className="text-lg leading-relaxed text-muted">{t("introBody")}</p>
            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className="border-s border-accent/40 ps-4">
                  <dt className="font-semibold text-fg">{t(`introPoint${n}Title`)}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{t(`introPoint${n}Body`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section aria-labelledby="services-title">
        <SectionHeader
          id="services-title"
          eyebrow={t("servicesEyebrow")}
          title={t("servicesTitle")}
          description={t("servicesBody")}
        />
        <Suspense fallback={<CardGridSkeleton count={4} className="mt-12 lg:grid-cols-4" />}>
          <HomeServices locale={locale} />
        </Suspense>
      </Section>

      {/* Portfolio */}
      <Section aria-labelledby="portfolio-title" className="border-y border-line bg-bg-deep/60">
        <Suspense fallback={<CardGridSkeleton className="mt-12" />}>
          <HomePortfolio locale={locale} />
        </Suspense>
      </Section>

      {/* Process */}
      <Section aria-labelledby="process-title">
        <SectionHeader id="process-title" eyebrow={t("processEyebrow")} title={t("processTitle")} />
        <ol className="reveal-group mt-14 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              [1, Compass],
              [2, PenTool],
              [3, Hammer],
              [4, LifeBuoy],
            ] as const
          ).map(([n, Icon]) => (
            <li key={n} className="flex flex-col bg-bg p-7">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-accent" strokeWidth={1.6} aria-hidden />
                <span className="font-mono text-xs text-subtle" dir="ltr">
                  0{n}
                </span>
              </div>
              <h3 className="mt-8 text-lg font-semibold">{t(`processStep${n}Title`)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t(`processStep${n}Body`)}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Capabilities */}
      <Section aria-labelledby="capabilities-title" className="border-t border-line">
        <SectionHeader id="capabilities-title" eyebrow={t("capabilitiesEyebrow")} title={t("capabilitiesTitle")} />
        <CapabilityGrid />
      </Section>

      {/* CTA */}
      <section aria-labelledby="cta-title" className="px-5 sm:px-8">
        <div className="reveal bg-grid relative mx-auto max-w-7xl overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-16 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="cta-title" className="text-3xl font-semibold sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{t("ctaBody")}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                {t("ctaPrimary")}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
              </ButtonLink>
              <Suspense fallback={<WhatsAppCta href={whatsappUrl(DEFAULT_WHATSAPP_NUMBER)} label={t("ctaWhatsApp")} />}>
                <HomeWhatsAppCta locale={locale} label={t("ctaWhatsApp")} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Blog */}
      <Section aria-labelledby="blog-title">
        <Suspense fallback={<CardGridSkeleton className="mt-12" />}>
          <HomeBlog locale={locale} />
        </Suspense>
      </Section>
    </>
  );
}

async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Hero" });
  return (
    <section aria-labelledby="hero-title" className="sf-hero relative overflow-hidden border-b border-line">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(80%_70%_at_60%_30%,black,transparent)]" />
      <div aria-hidden className="absolute -top-48 end-[-10%] h-[36rem] w-[36rem] rounded-full bg-accent-3/10 blur-3xl" />
      <Container className="relative grid items-center gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-28">
        <div className="lg:col-span-6">
          <p className="enter eyebrow mb-6 inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {t("eyebrow")}
          </p>
          <Suspense fallback={<HeroCopy title={t("title")} subtitle={t("subtitle")} />}>
            <HeroCopyFromSettings locale={locale} fallbackTitle={t("title")} fallbackSubtitle={t("subtitle")} />
          </Suspense>
          <div className="enter mt-10 flex flex-col gap-3 xs:flex-row" style={{ "--enter-delay": "160ms" } as CSSProperties}>
            <ButtonLink href="/contact" size="lg">
              {t("primaryCta")}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/services" size="lg" variant="secondary">
              {t("secondaryCta")}
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-6">
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}

function HeroCopy({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h1 id="hero-title" className="enter text-[length:calc(2.5rem*var(--fs-heading,1))] leading-[1.08] font-semibold xs:text-5xl lg:text-[length:calc(3.6rem*var(--fs-heading,1))]">
        {title}
      </h1>
      <p className="enter mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl" style={{ "--enter-delay": "80ms" } as CSSProperties}>
        {subtitle}
      </p>
    </>
  );
}

/** Hero copy can be overridden from the dashboard (Site settings); static copy is the default. */
async function HeroCopyFromSettings({
  locale,
  fallbackTitle,
  fallbackSubtitle,
}: {
  locale: Locale;
  fallbackTitle: string;
  fallbackSubtitle: string;
}) {
  const settings = await getSiteSettings(locale);
  const usable = settings && !isUnavailable(settings) ? settings : null;
  return <HeroCopy title={usable?.hero_title || fallbackTitle} subtitle={usable?.hero_subtitle || fallbackSubtitle} />;
}

async function HomeServices({ locale }: { locale: Locale }) {
  const data = await getServices(locale);
  if (isUnavailable(data)) return <UnavailableState className="mt-12" />;
  const t = await getTranslations({ locale, namespace: "Services" });
  const services = data?.results ?? [];
  if (services.length === 0) return <EmptyState message={t("empty")} className="mt-12" />;
  return (
    <div className="reveal-group mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service, index) => (
        <div key={service.id} className="flex">
          <ServiceCard service={service} index={index} />
        </div>
      ))}
    </div>
  );
}

async function HomePortfolio({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const tc = await getTranslations({ locale, namespace: "Common" });
  const data = await getProjects(locale, { featured: true, pageSize: 3 });
  const header = (
    <SectionHeader
      id="portfolio-title"
      eyebrow={t("portfolioEyebrow")}
      title={t("portfolioTitle")}
      description={t("portfolioBody")}
      action={
        <ButtonLink href="/portfolio" variant="secondary">
          {tc("viewAll")}
        </ButtonLink>
      }
    />
  );
  if (isUnavailable(data)) return (<>{header}<UnavailableState className="mt-12" /></>);
  const projects = data?.results ?? [];
  return (
    <>
      {header}
      {projects.length === 0 ? (
        <EmptyState message={t("emptyPortfolio")} className="mt-12" />
      ) : (
        <div className="reveal-group mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="flex [&>article]:flex-1">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

async function HomeBlog({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const tc = await getTranslations({ locale, namespace: "Common" });
  const data = await getPosts(locale, { pageSize: 3 });
  const header = (
    <SectionHeader
      id="blog-title"
      eyebrow={t("blogEyebrow")}
      title={t("blogTitle")}
      action={
        <ButtonLink href="/blog" variant="secondary">
          {tc("viewAll")}
        </ButtonLink>
      }
    />
  );
  if (isUnavailable(data)) return (<>{header}<UnavailableState className="mt-12" /></>);
  const posts = data?.results ?? [];
  return (
    <>
      {header}
      {posts.length === 0 ? (
        <EmptyState message={t("emptyBlog")} className="mt-12" />
      ) : (
        <div className="reveal-group mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="flex [&>article]:flex-1">
              <PostCard post={post} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function WhatsAppCta({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: "lg", variant: "secondary" })}>
      {label}
    </a>
  );
}

async function HomeWhatsAppCta({ locale, label }: { locale: Locale; label: string }) {
  const [settings, tWa] = await Promise.all([getSiteSettings(locale), getTranslations({ locale, namespace: "WhatsApp" })]);
  const usable = settings && !isUnavailable(settings) ? settings : null;
  const href = usable
    ? whatsappUrl(usable.whatsapp_number, usable.whatsapp_message || tWa("defaultMessage"))
    : whatsappUrl(DEFAULT_WHATSAPP_NUMBER, tWa("defaultMessage"));
  if (!href) return null;
  return <WhatsAppCta href={href} label={label} />;
}
