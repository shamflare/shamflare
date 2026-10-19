# Shamflare frontend

Next.js 16 (App Router, Cache Components), TypeScript strict, Tailwind CSS 4, next-intl, Motion, Lucide.
See the [root README](../README.md) for the architecture and how to run the whole stack.

## Structure

| Path | Purpose |
| --- | --- |
| `app/[locale]/` | Public site (root layout per locale: `lang`, `dir`, fonts, header/footer) |
| `app/admin/` | Dashboard — its own root layout; `(panel)` routes sit behind the session check |
| `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` | SEO metadata routes and favicon |
| `i18n/` | Locales (`en`, `tr`, `ar`), routing, request config (locale from `next/root-params`) |
| `proxy.ts` | Redirects locale-less URLs to a locale |
| `messages/*.json` | Static UI text. Keys are type-checked against `en.json`; `npm test` checks parity |
| `lib/api/server.ts` | Cached server-side access to the public API (resilient to outages) |
| `lib/api/client.ts` | Browser access (same origin, session cookie, CSRF header) |
| `lib/admin/` | Dashboard types, data hook, form helpers |
| `components/` | Brand, layout, content and UI components; `components/admin/` for the dashboard |
| `features/` | Page-level feature modules (home, contact form, dashboard screens) |
| `tests/unit`, `tests/e2e` | Vitest and Playwright tests |

## Environment

| Variable | Used | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build | `https://shamflare.com` — canonical URLs, hreflang, sitemap |
| `BACKEND_INTERNAL_URL` | build + runtime | `http://127.0.0.1:8000` — SSR fetches and `/api` rewrites |
| `MEDIA_INTERNAL_URL` | build | falls back to `BACKEND_INTERNAL_URL`; `http://caddy:8080` in Compose |

Rewrites are compiled at build time, so the internal URLs must be set when running `next build`
(the Dockerfile passes them as build args).

## Notes

- Design tokens (colors, radii, shadows, fonts) are defined once in `app/globals.css` (`@theme`).
- Entrance and scroll reveals are pure CSS and respect `prefers-reduced-motion`; content is never hidden
  until JavaScript runs. Motion is used for interactive state changes only (e.g. the inquiry form).
- To translate the interface, edit `messages/tr.json` / `messages/ar.json`; run `npm test` to catch
  missing keys or placeholder mismatches.
