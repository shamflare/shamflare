import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/i18n/routing";
import { getPosts, getProjects, getServices, isUnavailable } from "@/lib/api/server";
import type { AvailableLanguage } from "@/lib/api/types";
import { absoluteUrl, localizedPath } from "@/lib/site";

const STATIC_PATHS = ["", "about", "services", "portfolio", "blog", "contact"];
const MAX_PAGES = 20;

type Item = { id: number; available_languages: AvailableLanguage[] };

async function collect(fetchPage: (locale: Locale, page: number) => Promise<unknown>): Promise<Item[]> {
  const byId = new Map<number, Item>();
  for (const locale of locales) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const data = (await fetchPage(locale, page)) as { results: Item[]; next: string | null } | null;
      if (!data || isUnavailable(data)) break;
      for (const item of data.results) byId.set(item.id, item);
      if (!data.next) break;
    }
  }
  return [...byId.values()];
}

function entriesFor(section: string, items: Item[]): MetadataRoute.Sitemap {
  return items.flatMap((item) => {
    const languages = Object.fromEntries(
      item.available_languages.map((a) => [a.language, absoluteUrl(localizedPath(a.language, `${section}/${a.slug}`))]),
    );
    return item.available_languages.map((a) => ({
      url: absoluteUrl(localizedPath(a.language, `${section}/${a.slug}`)),
      alternates: { languages },
    }));
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizedPath(l, path))]));
    return locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      alternates: { languages },
    }));
  });

  const [services, projects, posts] = await Promise.all([
    collect((locale, page) => (page === 1 ? getServices(locale) : Promise.resolve(null))),
    collect((locale, page) => getProjects(locale, { page, pageSize: 50 })),
    collect((locale, page) => getPosts(locale, { page, pageSize: 50 })),
  ]);

  return [
    ...staticEntries,
    ...entriesFor("services", services),
    ...entriesFor("portfolio", projects),
    ...entriesFor("blog", posts),
  ];
}
