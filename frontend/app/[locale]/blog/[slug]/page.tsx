import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPost, isUnavailable } from "@/lib/api/server";
import { absoluteUrl, contentAlternates, decodeParam, formatDate, localizedPath } from "@/lib/site";
import { LocaleAlternates } from "@/components/layout/alternates";
import { Markdown } from "@/components/content/Markdown";
import { Breadcrumbs } from "@/components/content/Navigation";
import { ArticleSkeleton, UnavailableState } from "@/components/content/States";
import { Container } from "@/components/ui/Section";

type Props = PageProps<"/[locale]/blog/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const post = await getPost(locale, decodeParam(slug));
  if (!post || isUnavailable(post)) return {};
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  return {
    title,
    description,
    alternates: contentAlternates(locale, "blog", post.slug, post.available_languages),
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      ...(post.cover_image ? { images: [{ url: post.cover_image, alt: post.cover_alt }] } : {}),
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <BlogPost params={params} />
    </Suspense>
  );
}

async function BlogPost({ params }: Pick<Props, "params">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const post = await getPost(locale, decodeParam(slug));
  if (isUnavailable(post)) {
    return (
      <Container className="py-24">
        <UnavailableState />
      </Container>
    );
  }
  if (!post) notFound();

  const [t, tc, tn] = await Promise.all([
    getTranslations({ locale, namespace: "Blog" }),
    getTranslations({ locale, namespace: "Common" }),
    getTranslations({ locale, namespace: "Nav" }),
  ]);
  const alternates = Object.fromEntries(post.available_languages.map((a) => [a.language, `/blog/${a.slug}`]));
  const url = absoluteUrl(localizedPath(locale, `blog/${post.slug}`));

  // Accurate, minimal structured data: only facts the CMS actually stores.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    inLanguage: locale,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: post.author_name },
    publisher: { "@type": "Organization", name: "Shamflare" },
    ...(post.cover_image ? { image: absoluteUrl(post.cover_image) } : {}),
  };

  return (
    <article>
      <LocaleAlternates paths={alternates} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Container className="max-w-3xl pt-12 pb-20 sm:pt-16">
        <Breadcrumbs
          items={[
            { label: tc("home"), href: "/" },
            { label: tn("blog"), href: "/blog" },
            { label: post.title },
          ]}
        />
        <header>
          {post.category ? (
            <Link href={{ pathname: "/blog", query: { category: post.category.slug } }} className="eyebrow hover:underline">
              {post.category.name}
            </Link>
          ) : null}
          <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-4 text-sm text-subtle">
            <span>{tc("by", { name: post.author_name })}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.published_at}>{tc("publishedOn", { date: formatDate(post.published_at, locale) })}</time>
            <span aria-hidden>·</span>
            <span>{tc("minutesRead", { minutes: post.reading_time_minutes })}</span>
          </div>
        </header>

        {post.cover_image ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] border border-line">
            <Image src={post.cover_image} alt={post.cover_alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        ) : null}

        <Markdown className="mt-12">{post.body}</Markdown>

        <footer className="mt-16 border-t border-line pt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
            {t("backToBlog")}
          </Link>
        </footer>
      </Container>
    </article>
  );
}
