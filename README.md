# Shamflare

Website and content management platform for **Shamflare** — software development and digital solutions
(websites, mobile apps, desktop applications, technical support). Public site in English, Turkish and
Arabic (RTL), a private dashboard for managing content, translations, inquiries and site settings, and a
Django REST API backed by PostgreSQL.

```
Browser ──HTTPS──▶ Caddy ──▶ /api, /django-admin, /static ──▶ Django + DRF (gunicorn) ──▶ PostgreSQL
                     │                                              ▲            (private network)
                     ├──▶ /media ──▶ uploads volume                  │ SSR fetches (internal)
                     └──▶ everything else ──▶ Next.js (site + /admin dashboard)
```

| Path | What |
| --- | --- |
| [frontend/](frontend/) | Next.js 16 (App Router, TypeScript strict, Tailwind CSS 4, next-intl, Motion, Lucide) |
| [backend/](backend/) | Django 5.2 LTS, Django REST Framework, PostgreSQL — see [backend/README.md](backend/README.md) |
| [docs/api.md](docs/api.md) | API contract (`/api/v1/`) shared by both sides |
| [docs/deployment.md](docs/deployment.md) | VPS deployment, DNS, HTTPS, backups, rollback |
| [infrastructure/caddy/Caddyfile](infrastructure/caddy/Caddyfile) | Reverse proxy, HTTPS and security headers |
| [docker-compose.yml](docker-compose.yml) | Production stack |

## Key decisions

- **One origin.** The site, dashboard and API share the domain (Caddy routes by path; in development
  Next.js rewrites `/api` and `/media` to Django). The dashboard therefore uses Django's **HttpOnly
  session cookie + CSRF** — no tokens in `localStorage`, no permissive CORS.
- **Static UI text vs. CMS content.** Interface strings live in `frontend/messages/{en,tr,ar}.json`.
  Services, projects, articles, categories and editable site copy live in PostgreSQL as one canonical
  record plus one translation row per language, each with its own draft/published status.
- **Missing translations are never invented.** An item appears in a language only when the item *and*
  that translation are published; otherwise it is omitted from listings and its URL returns 404 in that
  language. hreflang and the language switcher only point to languages that exist; on a detail page
  without an equivalent, the switcher leads to that section's index.
- **Rendering.** Pages are partially prerendered (Next.js Cache Components): static shell plus CMS data
  cached for one minute (`cacheLife("content")`). Edits made in the dashboard reach the public site
  within about a minute. If the API is unreachable during `next build` (e.g. inside `docker build`), CMS
  sections are rendered at request time instead of failing the build or baking in an error.
- **Dashboard.** A custom client-side dashboard at `/admin` (English, single administrator to start)
  over the protected `/api/v1/admin/` endpoints; Django Admin stays available at `/django-admin/` as an
  operational fallback. Both use the same data and permissions; the backend enforces authorization.
- **Email is prepared, not active.** Inquiries are always stored first; notification email is a
  separate step that is skipped until SMTP settings are provided (see backend README).
- **Hosting** exists only as a draft service in the CMS — not shown publicly until published.
- **Appearance.** Colors (per part, for dark and light mode), fonts, text size, button and card
  shapes and the scroll-reveal motion are edited at `/admin/appearance` beside a live preview of the
  real site. They are stored as validated design-token overrides (`/api/v1/appearance/`) and turned
  into CSS by `frontend/lib/appearance.ts`; with no overrides the site keeps its built-in design.
- **Brand.** The wordmark is typographic (`components/brand/Wordmark.tsx`, favicon `app/icon.svg`).
  Replace those two files when a final SVG logo exists.

## Local development

Requirements: Python 3.13+, Node.js 22+ (24 used here). PostgreSQL optional locally (SQLite fallback).

```bash
# Backend — http://127.0.0.1:8000
cd backend
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt   # (bin/ on macOS/Linux)
cp .env.example .env            # then set DJANGO_DEBUG=1 and DATABASE_URL=sqlite:///db.sqlite3
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py seed_content        # honest initial content in en/tr/ar
.venv/Scripts/python manage.py createsuperuser     # your dashboard account
.venv/Scripts/python manage.py runserver 8000

# Frontend — http://localhost:3000 (dashboard at /admin)
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

The dev backend `.env` must list the frontend origin in `CSRF_TRUSTED_ORIGINS`
(`http://localhost:3000,http://127.0.0.1:3000`), because proxied requests carry that `Origin`.

## Checks and tests

| Command | Where | What |
| --- | --- | --- |
| `.venv/Scripts/python manage.py test` | backend | 87 API, model, permission, translation, upload and inquiry tests |
| `.venv/Scripts/python manage.py check --deploy` | backend (prod settings) | Django deployment checklist |
| `npm run lint` / `npm run typecheck` | frontend | ESLint, TypeScript strict |
| `npm test` | frontend | Vitest: translation catalogue parity, helpers, admin form logic |
| `npm run build` | frontend | Production build |
| `npm run test:e2e` | frontend | Playwright against `next start` + a running, seeded API. Set `E2E_ADMIN_USERNAME` / `E2E_ADMIN_PASSWORD` for dashboard tests. |

## Deployment

See **[docs/deployment.md](docs/deployment.md)** — VPS preparation, DNS for `shamflare.com`, firewall,
environment, first start, creating the administrator, backups/restore, health checks, logs and rollback.

## Known limitations

- The Docker images and Compose stack have not been built or run in the development environment used so
  far (no Docker available there); the backend test suite has run on SQLite, not PostgreSQL. Run both
  on the server or a machine with Docker before going live (see deployment checklist).
- Lighthouse/performance budgets have not been measured yet.
- The dashboard UI is English-only; content itself is edited in all three languages.
- Content-Security-Policy allows inline scripts (required by Next.js without per-request nonces).
- Notification email is sent synchronously within the request (bounded by `EMAIL_TIMEOUT`).
