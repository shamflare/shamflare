import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBlogCategories, getPosts, isUnavailable } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { pageParam, staticAlternates, stringParam } from "@/lib/site";
import { PostCard } from "@/components/content/Cards";
import { Pagination } from "@/components/content/Navigation";
import { CardGridSkeleton, EmptyState, UnavailableState } from "@/components/content/States";
import { PageHeader, Section } from "@/components/ui/Section";

const PAGE_SIZE = 9;

type Props = PageProps<"/[locale]/blog">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("blogTitle"),
    description: t("blogDescription"),
    alternates: staticAlternates(locale, "blog"),
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "Blog" });
  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
      <Section className="pt-12 sm:pt-16">
        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <PostListing locale={locale} searchParams={searchParams} />
        </Suspense>
      </Section>
    </>
  );
}

async function PostListing({ locale, searchParams }: { locale: Locale; searchParams: Props["searchParams"] }) {
  const query = await searchParams;
  const category = stringParam(query.category);
  const page = pageParam(query.page);

  const [posts, categories, t] = await Promise.all([
    getPosts(locale, { category: category || undefined, page, pageSize: PAGE_SIZE }),
    getBlogCategories(locale),
    getTranslations({ locale, namespace: "Blog" }),
  ]);
  const categoryList = categories && !isUnavailable(categories) ? categories.filter((c) => c.post_count > 0) : [];
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
      active ? "border-accent/60 bg-accent/10 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
    );

  return (
    <>
      {categoryList.length > 0 ? (
        <nav aria-label={t("categoriesLabel")} className="mb-10">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/blog" className={chip(!category)} aria-current={!category ? "page" : undefined}>
                {t("allCategories")}
              </Link>
            </li>
            {categoryList.map((item) => (
              <li key={item.id}>
                <Link
                  href={{ pathname: "/blog", query: { category: item.slug } }}
                  className={chip(category === item.slug)}
                  aria-current={category === item.slug ? "page" : undefined}
                >
                  {item.name}
                  <span className="text-xs text-subtle">{item.post_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {isUnavailable(posts) ? (
        <UnavailableState />
      ) : !posts || posts.results.length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.results.map((post) => (
              <div key={post.id} className="flex [&>article]:flex-1">
                <PostCard post={post} locale={locale} />
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={Math.ceil(posts.count / PAGE_SIZE)}
            hrefFor={(n) => {
              const params = new URLSearchParams();
              if (category) params.set("category", category);
              if (n > 1) params.set("page", String(n));
              const qs = params.toString();
              return qs ? `/blog?${qs}` : "/blog";
            }}
          />
        </>
      )}
    </>
  );
}
