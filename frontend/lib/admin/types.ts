// Admin API shapes (docs/api.md → "Admin endpoints").
import type { Locale } from "@/i18n/routing";
import type { Budget, LegalKind, ProcessStep } from "@/lib/api/types";

export type PublishStatus = "draft" | "published";
export type TranslationState = "published" | "draft" | "incomplete" | "missing";
export type TranslationMap<T> = Partial<Record<Locale, T | null>>;

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
};

export type ServiceTranslation = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  capabilities: string[];
  use_cases: string[];
  process: ProcessStep[];
  seo_title: string;
  seo_description: string;
  status: PublishStatus;
};

export type AdminService = {
  id: number;
  key: string;
  icon: string;
  status: PublishStatus;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  translations: TranslationMap<ServiceTranslation>;
  translation_status: Partial<Record<Locale, TranslationState>>;
};

export type ProjectTranslation = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  cover_alt: string;
  seo_title: string;
  seo_description: string;
  status: PublishStatus;
};

export type AdminProject = {
  id: number;
  category: number | null;
  services: number[];
  technologies: string[];
  external_url: string;
  is_featured: boolean;
  is_demo: boolean;
  status: PublishStatus;
  sort_order: number;
  cover_image: string | null;
  images: { id: number; url: string; alt_text: string; sort_order: number }[];
  created_at: string;
  updated_at: string;
  translations: TranslationMap<ProjectTranslation>;
  translation_status: Partial<Record<Locale, TranslationState>>;
};

export type CategoryTranslation = { name: string; slug: string };

export type AdminCategory = {
  id: number;
  sort_order: number;
  translations: TranslationMap<CategoryTranslation>;
  translation_status: Partial<Record<Locale, TranslationState>>;
};

export type PostTranslation = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_alt: string;
  seo_title: string;
  seo_description: string;
  status: PublishStatus;
};

export type AdminPost = {
  id: number;
  category: number | null;
  author_name: string;
  status: PublishStatus;
  published_at: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  translations: TranslationMap<PostTranslation>;
  translation_status: Partial<Record<Locale, TranslationState>>;
};

export const INQUIRY_STATUSES = ["new", "in_progress", "completed", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type AdminInquiry = {
  id: number;
  reference: string;
  name: string;
  email: string;
  company: string;
  service: string;
  service_title: string;
  budget: Budget | "";
  description: string;
  preferred_language: Locale;
  consent: boolean;
  status: InquiryStatus;
  internal_notes: string;
  notification_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SettingsTranslation = {
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_intro: string;
  about_body: string;
  whatsapp_message: string;
};

export type AdminSettings = {
  company_name: string;
  contact_email: string;
  whatsapp_number: string;
  social_links: { label: string; url: string }[];
  translations: TranslationMap<SettingsTranslation>;
  updated_at: string;
};

export type LegalTranslation = { body: string };

export type AdminLegalDocument = {
  kind: LegalKind;
  translations: TranslationMap<LegalTranslation>;
  translation_status: Partial<Record<Locale, TranslationState>>;
  content_updated_at: string | null;
  updated_at: string;
};

export type AdminStats = {
  inquiries: { total: number; new: number; in_progress: number; completed: number; archived: number; last_7_days: number };
  services: { total: number; published: number };
  portfolio: { total: number; published: number };
  blog: { total: number; published: number; drafts: number };
  translations: { missing: number };
  recent_inquiries: AdminInquiry[];
};
