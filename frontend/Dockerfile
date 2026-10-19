# syntax=docker/dockerfile:1

# ---- dependencies ----------------------------------------------------------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- build -----------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Public origin baked into canonical URLs, hreflang and the sitemap.
ARG NEXT_PUBLIC_SITE_URL=https://shamflare.com
# Internal service URLs on the Compose network; rewrites are compiled at build time.
ARG BACKEND_INTERNAL_URL=http://backend:8000
ARG MEDIA_INTERNAL_URL=http://caddy:8080
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL     BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL     MEDIA_INTERNAL_URL=$MEDIA_INTERNAL_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The API is usually not reachable during `docker build`; CMS sections are then
# rendered at request time (see lib/api/server.ts) instead of failing the build.
RUN npm run build

# ---- runtime ---------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nextjs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/robots.txt || exit 1
CMD ["node", "server.js"]
