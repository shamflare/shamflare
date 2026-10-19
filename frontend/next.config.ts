import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Where the Next.js server reaches Django (container network in production).
const backendUrl = (process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
// Where uploaded media can be read from inside the network (Django serves it only in DEBUG;
// in production the reverse proxy's internal listener does).
const mediaUrl = (process.env.MEDIA_INTERNAL_URL || backendUrl).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Django's URLs end with a slash; keep them intact when proxied.
  skipTrailingSlashRedirect: true,
  cacheLife: {
    // Public CMS content: served from cache, refreshed in the background at most once a minute.
    content: { stale: 60, revalidate: 60, expire: 60 * 60 * 24 },
  },
  images: {
    // Uploaded media is served by Django (or the reverse proxy) under /media/.
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/**", search: "" }],
    formats: ["image/avif", "image/webp"],
  },
  // In production the reverse proxy routes these paths straight to Django;
  // the rewrites make local development (and a proxy-less setup) behave the same.
  async rewrites() {
    return {
      beforeFiles: [
        // Explicit trailing-slash variants first: `:path*` alone drops the slash and
        // Django's APPEND_SLASH would answer with a redirect loop.
        { source: "/api/:path*/", destination: `${backendUrl}/api/:path*/` },
        { source: "/django-admin/:path*/", destination: `${backendUrl}/django-admin/:path*/` },
        { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
        { source: "/media/:path*", destination: `${mediaUrl}/media/:path*` },
        { source: "/static/:path*", destination: `${backendUrl}/static/:path*` },
        { source: "/django-admin/:path*", destination: `${backendUrl}/django-admin/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
