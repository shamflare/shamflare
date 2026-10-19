// Types mirroring docs/api.md (the backend contract). Keep the two in sync.
import type { Locale } from "@/i18n/routing";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export type AvailableLanguage = { language: Locale; slug: string };

export type SiteSettings = {
  company_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_intro: string;
  about_body: string;
  contact_email: string;
  whatsapp_number: string;
  whatsapp_message: string;
  whatsapp_url: string;
  social_links: { label: string; url: string }[];
};

export type ServiceSummary = {
  id: number;
  key: string;
  icon: string;
  slug: string;
  title: string;
  summary: string;
  is_featured: boolean;
  sort_order: number;
  available_languages: AvailableLanguage[];
};

export type ProcessStep = { title: string; description: string };

export type ServiceDetail = ServiceSummary & {
  description: string;
  capabilities: string[];
  use_cases: string[];
  process: ProcessStep[];
  seo_title: string;
  seo_description: string;
  related_projects: ProjectSummary[];
};

export type ServiceRef = { key: string; slug: string; title: string };

export type ProjectSummary = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  cover_image: string | null;
  cover_alt: string;
  category: ServiceRef | null;
  technologies: string[];
  is_featured: boolean;
  is_demo: boolean;
  external_url: string;
  available_languages: AvailableLanguage[];
};

export type ProjectDetail = ProjectSummary & {
  body: string;
  images: { id: number; url: string; alt: string }[];
  seo_title: string;
  seo_description: string;
  services: ServiceRef[];
};

export type BlogCategory = { id: number; slug: string; name: string; post_count: number };

export type PostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  cover_alt: string;
  category: { slug: string; name: string } | null;
  author_name: string;
  published_at: string;
  reading_time_minutes: number;
  available_languages: AvailableLanguage[];
};

export type PostDetail = PostSummary & {
  body: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export const BUDGET_OPTIONS = ["under_1k", "1k_5k", "5k_15k", "15k_plus", "not_sure"] as const;
export type Budget = (typeof BUDGET_OPTIONS)[number];

export type InquiryPayload = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: Budget | "";
  description: string;
  preferred_language: Locale;
  consent: boolean;
  website: string;
};

export type InquiryReceipt = { status: "received"; reference: string };
