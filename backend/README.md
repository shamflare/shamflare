# Shamflare backend (Django API + CMS)

Django 5.2 LTS + Django REST Framework. Serves the public content API, the
staff-only administration API used by the Next.js dashboard (`/admin` on the
frontend), and Django admin as an internal fallback at `/django-admin/`.

The API contract is [`../docs/api.md`](../docs/api.md). The OpenAPI schema is at
`/api/v1/schema/` and interactive docs at `/api/v1/docs/` (public in dev, staff-only in prod).

## Quick start (local)

Requires Python 3.13+ (verified on 3.14). PostgreSQL is the real target; local
development may use SQLite.

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt      # Linux/macOS: .venv/bin/pip
cp .env.example .env                               # then edit: DJANGO_DEBUG=1, DATABASE_URL=sqlite:///db.sqlite3
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py seed_content        # idempotent, never creates users
.venv/Scripts/python manage.py createsuperuser     # first administrator (see below)
.venv/Scripts/python manage.py runserver 8000
```

`manage.py` defaults to `config.settings.dev`, which loads `backend/.env` if
present (real environment variables win). In development, Next.js rewrites
`/api/*` and `/media/*` to `http://localhost:8000`, keeping a single origin.
Dev defaults `CSRF_TRUSTED_ORIGINS` to `http://localhost:3000,http://127.0.0.1:3000`
because the proxied request's `Origin` header is the Next.js origin.

### Commands

| Purpose | Command |
| --- | --- |
| Run dev server | `.venv/Scripts/python manage.py runserver 8000` |
| System checks | `.venv/Scripts/python manage.py check` |
| Deployment checks | `DJANGO_SETTINGS_MODULE=config.settings.prod ... manage.py check --deploy` |
| Migrations up to date? | `.venv/Scripts/python manage.py makemigrations --check --dry-run` |
| Apply migrations | `.venv/Scripts/python manage.py migrate` |
| Seed content | `.venv/Scripts/python manage.py seed_content` |
| Tests | `.venv/Scripts/python manage.py test` (uses `config.settings.test`) |
| OpenAPI file | `.venv/Scripts/python manage.py spectacular --validate --file schema.yml` |

## Settings & environment

| Module | Used by | Notes |
| --- | --- | --- |
| `config/settings/base.py` | all | Everything read from env. |
| `config/settings/dev.py` | `manage.py` (default) | Loads `.env`, DEBUG on, console email, no WhiteNoise. |
| `config/settings/test.py` | `manage.py test` (default) | In-memory SQLite unless `DATABASE_URL` is set, temp media dir, locmem email. |
| `config/settings/prod.py` | WSGI/ASGI (default), Docker | Refuses weak/missing `DJANGO_SECRET_KEY` and empty `DJANGO_ALLOWED_HOSTS`; HSTS, secure cookies, `SECURE_PROXY_SSL_HEADER`, DB cache for throttling, staff-only API docs. |

All variables (with placeholders) are listed in [`.env.example`](.env.example). Key ones:

- `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL`
- `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS` (normally empty), `NUM_PROXIES`
  (0 = ignore `X-Forwarded-For`; set **1** behind Caddy so throttling and the
  inquiry IP hash use the real client IP and cannot be spoofed)
- `MEDIA_ROOT`, `STATIC_ROOT`, `MAX_UPLOAD_MB` (default 5)
- `INQUIRY_THROTTLE_RATE` (default `5/hour`), `LOGIN_THROTTLE_RATE` (default `10/hour`)
- `EMAIL_*`, `DEFAULT_FROM_EMAIL`, `INQUIRY_NOTIFICATION_EMAIL`, `DASHBOARD_BASE_URL`

`manage.py check --deploy` with production settings reports two intentional warnings:

- **W008 `SECURE_SSL_REDIRECT`** — off by default because Caddy terminates TLS
  and redirects HTTP→HTTPS; a Django redirect would break internal
  container-to-container HTTP calls (e.g. Next.js SSR → `http://backend:8000`).
  Set `DJANGO_SECURE_SSL_REDIRECT=1` if Django is ever exposed without Caddy.
- **W021 `SECURE_HSTS_PRELOAD`** — opt in with `DJANGO_SECURE_HSTS_PRELOAD=1`
  only once you intend to submit the domain to the preload list.

## URL layout

| Path | Purpose |
| --- | --- |
| `/api/v1/…` | Public + auth + admin API (see `docs/api.md`) |
| `/api/health/` | `{"status":"ok"}` (200) after a `SELECT 1`; 503 if the DB is unreachable |
| `/django-admin/` | Django admin fallback (`/admin` belongs to the Next.js dashboard) |
| `/static/` | Static files (WhiteNoise in production) |
| `/media/` | Uploads — served by Django only when `DEBUG`; Caddy serves the media volume in production |

## Apps

```
backend/
  config/            settings/, urls.py, api_urls.py, wsgi.py, asgi.py
  apps/core/         shared base models, languages, slugs, translation machinery,
                     upload validation, error envelope, auth + stats + health views,
                     seed data and the seed_content command
  apps/services/     Service + ServiceTranslation
  apps/portfolio/    PortfolioProject + PortfolioProjectTranslation + PortfolioImage
  apps/blog/         BlogCategory(+Translation), BlogPost(+Translation)
  apps/inquiries/    ProjectInquiry, notifications.py (email boundary)
  apps/site_settings/ SiteSettings singleton + SiteSettingsTranslation
  tests/             API test suite (Django test runner)
```

## Data model

Every translatable entity is one canonical row plus one row per locale in an
`<Entity>Translation` table (`language` ∈ `en|tr|ar`).

```
Service 1──* ServiceTranslation            (unique service+language, unique language+slug)
   │  ▲
   │  └── category (FK, SET_NULL) ─────┐
   └──── services (M2M) ───────────────┤
                                PortfolioProject 1──* PortfolioProjectTranslation
                                       └──* PortfolioImage (gallery)
BlogCategory 1──* BlogCategoryTranslation  (name, slug — no own status)
     ▲
     └── category (FK, SET_NULL) ── BlogPost 1──* BlogPostTranslation
                                     └── author (FK auth.User, SET_NULL)
ProjectInquiry                              (service stored as key string)
SiteSettings (singleton pk=1) 1──* SiteSettingsTranslation
```

- All tables have `created_at` / `updated_at`.
- Indexes: `status`, `is_featured`, `sort_order`, `published_at`, `language`,
  `(language, status)` on translation tables, `(status, -created_at)` on inquiries.
- `Service.key` is the stable, language-independent identifier (used by
  inquiries and the `?service=` filter). `icon` is limited to the Lucide names
  in the contract.
- Deleting a service sets portfolio `category` to NULL and removes it from
  `services`; inquiries keep the key they were submitted with.
- `BlogPost.author_name` = author's full name, else "Shamflare Team".
  `reading_time_minutes` = ceil(words / 200), min 1. `published_at` is set on
  first publish if empty; a future `published_at` schedules the post.
- `ProjectInquiry.reference` = `INQ-<year>-<id:06d>`. Privacy: the client IP is
  stored only as a keyed HMAC-SHA256 (`ip_hash`) and the user agent is truncated
  to 255 chars; neither is exposed by the API.

## Translation strategy

**Status.** Parents (`Service`, `PortfolioProject`, `BlogPost`) and their
translations each have `draft|published`. Blog categories and site settings
translations have no status.

**Public visibility rule.** An item is visible in locale L only if the parent
is published **and** its L translation exists and is published (blog posts also
need `published_at <= now`). Otherwise it is **omitted** from L lists and its
L detail returns 404. There is **no cross-language fallback** for content: we
never show English text on a Turkish page. `available_languages` lists the
locales where the item is visible so the frontend can offer a language switch
or hreflang links. Site-settings fields may be `""` — the frontend then uses
its static message defaults. A portfolio item's `category` is `null` when the
service is not visible in that locale; categories without a translation in L
are hidden from L.

**Completeness.** `translation_status` per locale is computed:
`missing` (no row) · `incomplete` (row exists but a required field is empty) ·
otherwise the row's own `draft`/`published` (status-less tables: `published`).
Required fields:

| Entity | Required |
| --- | --- |
| Service | title, slug, summary, description |
| Portfolio project | title, slug, summary, body |
| Blog post | title, slug, excerpt, body |
| Blog category | name, slug |
| Site settings | tagline, hero_title, hero_subtitle |

A translation cannot be saved as `published` while a required field is empty
(→ `translations.<lang>.<field>` error); drafts can be saved incrementally.

**Admin writes.** `translations` is an object keyed by language with upsert
semantics, applied in one transaction with the parent: provided languages are
updated in place or created (never duplicated — DB constraint on
parent+language), `null` deletes, omitted languages are untouched; omitted
*fields* inside a provided language are untouched too.

**Slugs.** Unique per (language, slug) within each translation table, enforced
by a DB constraint and pre-validated with a field error at
`translations.<lang>.slug`. Blank slugs are generated from the title (name for
categories) and made unique with `-2`, `-3`… Latin-script text produces ASCII
slugs (`Web Sitesi Geliştirme` → `web-sitesi-gelistirme`, `ı`→`i`); Arabic keeps
Unicode slugs (`الدعم الفني` → `الدعم-الفني`). The seed data follows the same
policy. Detail lookups also accept percent-encoded slugs.

## Authentication & authorization

- Django session auth + CSRF, same origin. `GET /api/v1/auth/csrf/` sets the
  `csrftoken` cookie (readable by JS, `CSRF_COOKIE_HTTPONLY=False`); unsafe
  requests send it back as `X-CSRFToken`. CSRF is enforced on login/logout even
  for anonymous requests. Session cookie: HttpOnly, SameSite=Lax, Secure in prod,
  12-hour lifetime by default. Login rotates the session and CSRF token.
- Only **active staff** users can log in (`400` with a generic message
  otherwise — no user enumeration). Login is throttled (`10/hour` per IP).
- **No registration endpoint and no default credentials.** Create the first
  administrator on the server:
  ```bash
  python manage.py createsuperuser            # local
  docker compose exec backend python manage.py createsuperuser   # production
  ```
  Use a unique, strong password (validators require ≥ 12 characters).
- Global DRF default permission is `IsAdminUser` (deny by default). Public
  endpoints opt in with `AllowAny`, are read-only, and use no authentication
  classes (no CSRF coupling). Admin endpoints require `is_staff`.
  Anonymous → `403 not_authenticated`; authenticated non-staff → `403 permission_denied`.
- Django admin at `/django-admin/` uses the same users, permissions and data.

## Errors

Every non-2xx API response uses the envelope from the contract. Nested
validation errors are flattened to dotted keys (`translations.tr.slug`,
`translations.en.process.1.title`); errors not tied to a field use
`non_field_errors`. Unhandled exceptions are logged and returned as
`500 server_error` without internals. Django-level 400/403/404/500 and CSRF
failures under `/api/` are JSON too (also with `DEBUG=1`, except 500 pages).

## Uploads

`POST /api/v1/admin/portfolio/{id}/cover/`, `.../images/`, `/admin/blog/posts/{id}/cover/`
(multipart `file`). Files are verified with Pillow (real content), limited to
JPEG/PNG/WebP and `MAX_UPLOAD_MB`, guarded against decompression bombs, and
stored as `<prefix>/<uuid>.<detected-ext>` — the client filename is never used.
Replaced, cleared and deleted files are removed from storage after the
transaction commits.

## Inquiries & email notifications

`POST /api/v1/inquiries/` validates (consent must be true, honeypot `website`
must be empty, description 20–5000 chars, `service` = published service key,
`other` or empty), stores the inquiry, **then** calls
`apps.inquiries.notifications.notify_new_inquiry(inquiry)`. Throttled per client
IP (`INQUIRY_THROTTLE_RATE`, default `5/hour`).

Email is **prepared but not active**. With `INQUIRY_NOTIFICATION_EMAIL` empty
(default) the notifier is a no-op and `notification_sent_at` stays `null`.
Failures are logged and never affect the `201` response. To activate:

1. Pick a provider and create SMTP credentials (or an API key — then replace
   `_send()` in `notifications.py` with the provider SDK call).
2. Set `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`,
   `EMAIL_USE_TLS`/`EMAIL_USE_SSL`, `DEFAULT_FROM_EMAIL` (a verified sender) and
   optionally `DASHBOARD_BASE_URL`.
3. Set `INQUIRY_NOTIFICATION_EMAIL` (comma-separated recipients) and restart.
4. Submit a test inquiry; check that `notification_sent_at` is set in the dashboard.
   Sending is synchronous (≤ `EMAIL_TIMEOUT` seconds); move it to a task queue
   if volume grows.

## Seed content

`python manage.py seed_content` is idempotent and never creates users or
overwrites edits (items are matched by service key or by any seeded slug and
skipped if present). It creates:

- Site settings: company name, WhatsApp number `905343299918`, empty contact
  email, tagline/hero/about copy in en/tr/ar (no invented facts).
- The four core services, fully written and published in en/tr/ar.
- **Hosting** as a *draft* service (never public until an admin publishes it).
- Three clearly labeled demonstration portfolio projects (`is_demo=true`).
- Two blog categories and two practical articles, in all three locales.

## Docker

`backend/Dockerfile` builds a `python:3.13-slim` image running as a non-root
user (uid 10001) with gunicorn (`gunicorn.conf.py`, env-tunable). Static files
are collected at build time (WhiteNoise serves them); media lives in the
`/app/media` volume. The entrypoint runs `migrate` and `createcachetable`
(disable with `DJANGO_RUN_MIGRATIONS=0`). `HEALTHCHECK` calls `/api/health/`
with a `Host` from `DJANGO_ALLOWED_HOSTS`. Container networking, PostgreSQL,
Caddy and compose are configured outside this directory.

Backups: back up the PostgreSQL database (`pg_dump -Fc`) **and** the media
volume together; restore with `pg_restore` into an empty database followed by
restoring the media files, then run `migrate`.

## Tests

```bash
.venv/Scripts/python manage.py test            # SQLite in memory
DATABASE_URL=postgres://user:pass@localhost:5432/shamflare .venv/Scripts/python manage.py test   # PostgreSQL
```

Coverage: public visibility rules (draft parent / draft translation / missing
translation / future `published_at`), `?lang` validation, `available_languages`,
filters, inquiry validation, persistence, reference format, throttling,
notification success/failure isolation, auth flow with CSRF enforced,
anonymous/non-staff denial on every admin endpoint, translation upsert / delete /
slug uniqueness error shape, upload validation and file cleanup, stats, error
envelope, health check, Django admin mount point, and seed idempotency.
