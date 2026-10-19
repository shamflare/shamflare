import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Redirects locale-less URLs (e.g. "/services") to a locale prefix, using the
// visitor's cookie or Accept-Language header to pick it.
export default createMiddleware(routing);

export const config = {
  // Skip the dashboard, Django-served paths, Next internals and files with an extension.
  matcher: ["/((?!(?:api|admin|django-admin|media|static)(?:/|$)|_next|_vercel|.*\\..*).*)"],
};
