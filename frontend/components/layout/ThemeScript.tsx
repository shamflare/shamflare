"use client";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

/**
 * Inline <head> script that applies the theme before first paint.
 *
 * It must arrive as a plain executable <script> in the server HTML (next/script
 * `beforeInteractive` only queues it for later, causing a dark flash). When React
 * creates the element on the client instead it would warn that client-rendered
 * scripts never run, so there it is rendered as an inert data block — the theme
 * is already applied by then.
 */
export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
