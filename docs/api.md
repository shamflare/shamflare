# Shamflare API — v1 contract

Base path: `/api/v1/`. JSON everywhere except upload endpoints (multipart).
The frontend and the API are served from the **same origin** (reverse proxy in
production, Next.js rewrites in development), so the dashboard uses Django
session cookies (HttpOnly) plus CSRF — no tokens in `localStorage`.

## Conventions

- **Locale**: public endpoints take `?lang=en|tr|ar` (default `en`; any other
  value → 400). Responses contain only that locale's translated fields.
- **Pagination** (lists unless noted): `?page=N&page_size=M` (default 12, max 50)
  → `{ "count", "next", "previous", "results": [...] }`.
- **Errors**: every non-2xx response has the shape
  ```json
  { "error": { "code": "validation_error", "message": "Human readable summary", "fields": { "email": ["Enter a valid email address."] } } }
  ```
  `fields` only on validation errors. Codes: `validation_error`, `not_found`,
  `not_authenticated`, `permission_denied`, `throttled`, `method_not_allowed`,
  `server_error`, `bad_request`.
- **Media**: image fields are root-relative URLs (`/media/...`) or `null`.
- **Timestamps**: ISO 8601 UTC.
- **Visibility rule (public)**: an item appears in locale L only when the
  item `status == "published"` AND its translation for L exists with
  `status == "published"` (blog posts additionally need `published_at <= now`).
  Otherwise it is omitted from lists and its detail returns 404 in L.
- `available_languages`: `[{ "language": "tr", "slug": "web-sitesi-gelistirme" }]` —
  the locales in which the item is publicly visible (used for hreflang and the
  language switcher).

## Public endpoints (anonymous, read-only except inquiries)

### `GET /site-settings/?lang=`
```json
{
  "company_name": "Shamflare",
  "tagline": "Turning Ideas Into Digital Products.",
  "hero_title": "...", "hero_subtitle": "...",
  "about_intro": "...", "about_body": "markdown",
  "contact_email": "hello@shamflare.com",   // may be ""
  "whatsapp_number": "905343299918",        // digits only
  "whatsapp_message": "...",
  "whatsapp_url": "https://wa.me/905343299918?text=...",   // "" if no number
  "social_links": [{ "label": "GitHub", "url": "https://..." }]
}
```
Translated fields may be `""` when not filled — the frontend falls back to its
static message defaults.

### `GET /services/?lang=&featured=true`
Item:
```json
{ "id": 1, "key": "website-development", "icon": "globe", "slug": "website-development",
  "title": "...", "summary": "...", "is_featured": true, "sort_order": 1,
  "available_languages": [...] }
```
Ordered by `sort_order, id`.

### `GET /services/{slug}/?lang=`
List fields plus: `description` (markdown), `capabilities: string[]`,
`use_cases: string[]`, `process: [{ "title", "description" }]`,
`seo_title`, `seo_description`, `related_projects: [portfolio list item]`
(published in that locale, max 6).

### `GET /portfolio/?lang=&service=<service key>&featured=true&page=`
Item:
```json
{ "id": 3, "slug": "...", "title": "...", "summary": "...",
  "cover_image": "/media/portfolio/abc.webp", "cover_alt": "...",
  "category": { "key": "website-development", "slug": "...", "title": "..." },   // primary service or null
  "technologies": ["Next.js", "Django"],
  "is_featured": true, "is_demo": true, "external_url": "",
  "available_languages": [...] }
```
`category` is null when the primary service is not visible in that locale.
Ordered by `sort_order, -created_at`.

### `GET /portfolio/{slug}/?lang=`
Plus: `body` (markdown), `images: [{ "id", "url", "alt" }]`, `seo_title`,
`seo_description`, `services: [{ key, slug, title }]` (visible ones only).

### `GET /blog/categories/?lang=` (not paginated)
`[{ "id", "slug", "name", "post_count" }]` — only categories with a
translation in that locale; `post_count` counts publicly visible posts.

### `GET /blog/?lang=&category=<category slug in that locale>&page=`
Item:
```json
{ "id": 7, "slug": "...", "title": "...", "excerpt": "...",
  "cover_image": null, "cover_alt": "",
  "category": { "slug": "...", "name": "..." },   // or null
  "author_name": "Shamflare Team",
  "published_at": "2026-10-01T09:00:00Z",
  "reading_time_minutes": 4,
  "available_languages": [...] }
```
Ordered by `-published_at`.

### `GET /blog/{slug}/?lang=`
Plus: `body` (markdown), `seo_title`, `seo_description`, `updated_at`.

### `POST /inquiries/`
```json
{ "name": "required, ≤120", "email": "required", "company": "optional, ≤160",
  "service": "service key | 'other' | '' (optional)",
  "budget": "'' | under_1k | 1k_5k | 5k_15k | 15k_plus | not_sure",
  "description": "required, 20–5000 chars",
  "preferred_language": "en|tr|ar",
  "consent": true,            // must be true
  "website": "" }             // honeypot, must be empty
```
→ `201 { "status": "received", "reference": "INQ-2026-000123" }` only after the
row is stored. Throttled per client IP (`5/hour` by default, `429` beyond).
Email notification is a separate, optional step; its absence or failure never
turns a stored inquiry into an error.

## Authentication (session + CSRF)

- `GET /auth/csrf/` → sets `csrftoken` cookie, returns `{ "csrfToken": "..." }`.
- `POST /auth/login/` `{ username, password }` → `200 { "user": {...} }`;
  `400` on bad credentials or non-staff user; throttled (`10/hour`).
- `POST /auth/logout/` → `204`.
- `GET /auth/me/` → `200 { "id", "username", "email", "first_name", "last_name", "is_staff" }` or `403/401`.

Unsafe methods must send `X-CSRFToken` header. No public registration.

## Admin endpoints (`/admin/...`, staff only — `IsAdminUser`)

Translations are written and read as an object keyed by language. On write,
each provided language is upserted (one row per item+language, never
duplicated); a language set to `null` deletes that translation; omitted
languages are left untouched. `translation_status` is computed:
`{ "en": "published" | "draft" | "incomplete" | "missing", ... }`
(`incomplete` = exists but a required field is empty).

### `GET /admin/stats/`
```json
{ "inquiries": { "total", "new", "in_progress", "completed", "archived", "last_7_days" },
  "services":  { "total", "published" },
  "portfolio": { "total", "published" },
  "blog":      { "total", "published", "drafts" },
  "translations": { "missing": 4 },   // missing/incomplete translations of published items
  "recent_inquiries": [ /* 5 newest, admin inquiry shape */ ] }
```

### `/admin/services/` — list, create, retrieve, update (PUT/PATCH), delete
```json
{ "id", "key", "icon", "status": "draft|published", "is_featured", "sort_order",
  "created_at", "updated_at",
  "translations": { "en": { "title", "slug", "summary", "description",
     "capabilities": [], "use_cases": [], "process": [{ "title", "description" }],
     "seo_title", "seo_description", "status": "draft|published" }, "tr": {...}, "ar": {...} },
  "translation_status": {...} }
```
`key` unique slug-like. `icon` is a Lucide icon name from an allowed list:
`globe, smartphone, monitor, wrench, server, code, layers, shield`.

### `/admin/portfolio/` — CRUD (JSON)
`id, category (service id | null), services (service ids), technologies (string[]),
external_url, is_featured, is_demo, status, sort_order, cover_image (read-only URL),
images (read-only [{id, url, alt_text, sort_order}]), created_at, updated_at,
translations { lang: { title, slug, summary, body, cover_alt, seo_title, seo_description, status } },
translation_status`.

- `POST /admin/portfolio/{id}/cover/` multipart `file` → returns the item; `DELETE` clears it.
- `POST /admin/portfolio/{id}/images/` multipart `file`, `alt_text` → returns the item.
- `DELETE /admin/portfolio/{id}/images/{image_id}/` → returns the item.

### `/admin/blog/categories/` — CRUD
`id, sort_order, translations { lang: { name, slug } }, translation_status`.

### `/admin/blog/posts/` — CRUD
`id, category (id | null), author_name (read-only), status, published_at
(auto-set on first publish if empty), cover_image (read-only), created_at, updated_at,
translations { lang: { title, slug, excerpt, body, cover_alt, seo_title, seo_description, status } },
translation_status`. Cover: `POST/DELETE /admin/blog/posts/{id}/cover/`.

### `/admin/inquiries/` — list, retrieve, PATCH, delete
Filters: `?status=new|in_progress|completed|archived&search=&ordering=-created_at|created_at&page=`.
```json
{ "id", "reference", "name", "email", "company", "service", "service_title",
  "budget", "description", "preferred_language", "consent", "status",
  "internal_notes", "notification_sent_at", "created_at", "updated_at" }
```
PATCH accepts only `status`, `internal_notes`.

### `/admin/site-settings/` — GET, PUT/PATCH (singleton)
`company_name, contact_email, whatsapp_number (digits, 8–15), social_links [{label, url}],
translations { lang: { tagline, hero_title, hero_subtitle, about_intro, about_body, whatsapp_message } },
updated_at`.

### Uploads
Images only (JPEG, PNG, WebP), verified with Pillow, max 5 MB (configurable),
stored under generated UUID filenames — client filenames are never used as paths.

## Backend implementation notes (binding clarifications)

These refine the contract above; nothing in the shapes above was removed or renamed.

- **Errors.** Nested validation errors are flattened to dotted keys:
  `translations.tr.slug`, `translations.en.process.1.title`, `social_links.0.url`.
  Errors not tied to a field use the key `non_field_errors` (e.g. bad login).
  `?lang=xx` → `400 validation_error` with `fields.lang`; a malformed boolean
  filter (`?featured=maybe`) → `400 validation_error`. Malformed JSON →
  `400 bad_request`; a non-JSON body on a JSON endpoint (or JSON on an upload
  endpoint) → `415` with code `bad_request`. Invalid `?page` → `404 not_found`.
  `429` responses carry a `Retry-After` header.
- **Auth status codes.** Session auth sends no `WWW-Authenticate` challenge, so
  unauthenticated requests to `/auth/me/` and every `/admin/...` endpoint return
  **`403` with code `not_authenticated`**; authenticated non-staff users get
  `403 permission_denied`. CSRF failures are `403 permission_denied`. Failed login
  (wrong password, inactive or non-staff user) → `400 validation_error` with
  `fields.non_field_errors`. Login rotates the CSRF token: read the `csrftoken`
  cookie again (or call `/auth/csrf/`) after logging in.
- **Pagination links.** `next` / `previous` are root-relative
  (`/api/v1/portfolio/?page=2`) or `null`.
- **Slugs.** Unique per (language, entity type). English and Turkish slugs are
  ASCII (`web-sitesi-gelistirme`); **Arabic slugs are Unicode**
  (`تطوير-مواقع-الويب`). Send them in the path percent-encoded as browsers do;
  the API also accepts the raw form. Blank slugs on admin writes are generated
  from the title (category: name) and de-duplicated with `-2`, `-3`, …
- **Public visibility.** No cross-language content fallback (missing → omitted /
  404). `GET /blog/categories/` lists categories whose translation in that locale
  has a non-empty name. `GET /portfolio/?service=<key>` matches the primary
  category **or** any of the project's `services`. An unknown service key or
  category slug yields an empty list (not an error). Blog detail `updated_at` is
  the later of the post's and the translation's `updated_at`. All public list
  endpoints except `/blog/categories/` are paginated (including `/services/`).
- **Inquiries.** `service` must be the key of a **published** service, `other`,
  or `""`. `preferred_language` defaults to `en`, `budget` to `""`, `company` to
  `""`. Honeypot errors are reported on `fields.website`.
- **Admin translations.** Responses always include all three language keys;
  a missing translation is `null`. Inside a provided language, omitted fields are
  left unchanged. A translation cannot be saved with `status: "published"` while a
  required field is empty (`400`, e.g. `translations.en.summary`). Required fields
  (also used for `incomplete`): services `title, slug, summary, description`;
  portfolio `title, slug, summary, body`; posts `title, slug, excerpt, body`;
  categories `name, slug`; site settings `tagline, hero_title, hero_subtitle`.
  Category and site-settings translations have no `status`; their
  `translation_status` is `published` when complete, else `incomplete`/`missing`.
  New translations default to `status: "draft"`.
- **Admin lists** are paginated like public lists and accept:
  services `?status=&is_featured=&search=&ordering=sort_order|created_at|updated_at`;
  portfolio `?status=&is_featured=&is_demo=&category=<service id>&search=&ordering=`;
  blog posts `?status=&category=<id>&search=&ordering=published_at|created_at|updated_at`;
  blog categories `?search=&ordering=`. Prefix `ordering` with `-` for descending.
- **Admin extras.** `/admin/site-settings/` also returns `translation_status`;
  `whatsapp_number` accepts `+90 534 …` input and is stored as digits.
  `/admin/blog/categories/` items also include `created_at`, `updated_at`.
  `/admin/inquiries/` PATCH with any field other than `status` / `internal_notes`
  → `400`; `PUT` and `POST` → `405`. Deleting a gallery image that does not
  belong to the project → `404`. A project can hold at most 30 gallery images.
  Blog posts get `author` = the creating staff user.
- **Health.** `GET /api/health/` (outside `/api/v1/`) → `200 {"status": "ok"}`,
  or `503 {"status": "error", "database": "unavailable"}`.
- **OpenAPI.** `/api/v1/schema/` and `/api/v1/docs/` are public in development
  and staff-only in production (`API_DOCS_PUBLIC=1` to open them).
