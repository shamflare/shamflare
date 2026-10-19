import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import type { Locale } from "@/i18n/routing";
import type {
  BlogCategory,
  Paginated,
  PostDetail,
  PostSummary,
  ProjectDetail,
  ProjectSummary,
  ServiceDetail,
  ServiceSummary,
  SiteSettings,
} from "./types";

/**
 * Server-side access to the public Django API.
 *
 * Each public getter resolves to:
 *   - the data, when the API answered successfully (cached with the `content`
 *     profile: served from cache and refreshed in the background at most once a minute);
 *   - `null`, when the API answered 404 (unknown slug / not published in this locale);
 *   - an `ApiUnavailable` marker when the API could not be reached or failed.
 *
 * Failures are never cached. The cached loaders throw, and the wrapper defers
 * to request time with `connection()` before reporting the outage. During
 * `next build` without a backend this turns the affected section into a
 * request-time hole (its <Suspense> fallback ships in the static shell) instead
 * of baking an error message into a static page.
 */

const BACKEND_URL = (process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const TIMEOUT_MS = 8000;

export type ApiUnavailable = { unavailable: true };
export type Fetched<T> = T | null | ApiUnavailable;

export function isUnavailable(value: unknown): value is ApiUnavailable {
  return typeof value === "object" && value !== null && "unavailable" in value;
}

type Query = Record<string, string | number | undefined>;

function buildUrl(path: string, query: Query): string {
  const url = new URL(`${BACKEND_URL}/api/v1/${path.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** Returns parsed JSON, `null` for 404, and throws for anything else. */
async function fetchJson<T>(path: string, query: Query): Promise<T | null> {
  const response = await fetch(buildUrl(path, query), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API responded ${response.status} for ${path}`);
  return (await response.json()) as T;
}

/**
 * Errors thrown inside a cache scope abort `next build`, so the build first
 * checks (once per worker) whether the API is reachable. Without a backend
 * — e.g. inside `docker build` — content sections are deferred to request time.
 */
async function reachableDuringBuild(): Promise<boolean> {
  "use cache";
  cacheLife("max");
  try {
    const response = await fetch(`${BACKEND_URL}/api/health/`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function resilient<T>(label: string, load: () => Promise<T | null>): Promise<Fetched<T>> {
  if (process.env.NEXT_PHASE === "phase-production-build" && !(await reachableDuringBuild())) {
    await connection();
  }
  try {
    return await load();
  } catch (error) {
    unstable_rethrow(error);
    // Defer to request time: during prerendering this postpones the section.
    await connection();
    console.error(`[api] ${label} failed:`, error instanceof Error ? error.message : error);
    return { unavailable: true };
  }
}

// ---- cached loaders -------------------------------------------------------

async function loadSiteSettings(locale: Locale) {
  "use cache";
  cacheLife("content");
  cacheTag("site-settings");
  return fetchJson<SiteSettings>("site-settings/", { lang: locale });
}

async function loadServices(locale: Locale) {
  "use cache";
  cacheLife("content");
  cacheTag("services");
  return fetchJson<Paginated<ServiceSummary>>("services/", { lang: locale, page_size: 50 });
}

async function loadService(locale: Locale, slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("services");
  return fetchJson<ServiceDetail>(`services/${encodeURIComponent(slug)}/`, { lang: locale });
}

async function loadProjects(locale: Locale, service: string, featured: boolean, page: number, pageSize: number) {
  "use cache";
  cacheLife("content");
  cacheTag("portfolio");
  return fetchJson<Paginated<ProjectSummary>>("portfolio/", {
    lang: locale,
    service: service || undefined,
    featured: featured ? "true" : undefined,
    page: page > 1 ? page : undefined,
    page_size: pageSize,
  });
}

async function loadProject(locale: Locale, slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("portfolio");
  return fetchJson<ProjectDetail>(`portfolio/${encodeURIComponent(slug)}/`, { lang: locale });
}

async function loadBlogCategories(locale: Locale) {
  "use cache";
  cacheLife("content");
  cacheTag("blog");
  return fetchJson<BlogCategory[]>("blog/categories/", { lang: locale });
}

async function loadPosts(locale: Locale, category: string, page: number, pageSize: number) {
  "use cache";
  cacheLife("content");
  cacheTag("blog");
  return fetchJson<Paginated<PostSummary>>("blog/", {
    lang: locale,
    category: category || undefined,
    page: page > 1 ? page : undefined,
    page_size: pageSize,
  });
}

async function loadPost(locale: Locale, slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("blog");
  return fetchJson<PostDetail>(`blog/${encodeURIComponent(slug)}/`, { lang: locale });
}

// ---- public getters --------------------------------------------------------

export function getSiteSettings(locale: Locale): Promise<Fetched<SiteSettings>> {
  return resilient("site settings", () => loadSiteSettings(locale));
}

export function getServices(locale: Locale): Promise<Fetched<Paginated<ServiceSummary>>> {
  return resilient("services", () => loadServices(locale));
}

export function getService(locale: Locale, slug: string): Promise<Fetched<ServiceDetail>> {
  return resilient(`service ${slug}`, () => loadService(locale, slug));
}

export function getProjects(
  locale: Locale,
  options: { service?: string; featured?: boolean; page?: number; pageSize?: number } = {},
): Promise<Fetched<Paginated<ProjectSummary>>> {
  // Primitive, normalized arguments keep cache keys deterministic.
  return resilient("portfolio", () =>
    loadProjects(locale, options.service ?? "", options.featured ?? false, options.page ?? 1, options.pageSize ?? 12),
  );
}

export function getProject(locale: Locale, slug: string): Promise<Fetched<ProjectDetail>> {
  return resilient(`project ${slug}`, () => loadProject(locale, slug));
}

export function getBlogCategories(locale: Locale): Promise<Fetched<BlogCategory[]>> {
  return resilient("blog categories", () => loadBlogCategories(locale));
}

export function getPosts(
  locale: Locale,
  options: { category?: string; page?: number; pageSize?: number } = {},
): Promise<Fetched<Paginated<PostSummary>>> {
  return resilient("blog posts", () => loadPosts(locale, options.category ?? "", options.page ?? 1, options.pageSize ?? 12));
}

export function getPost(locale: Locale, slug: string): Promise<Fetched<PostDetail>> {
  return resilient(`post ${slug}`, () => loadPost(locale, slug));
}
