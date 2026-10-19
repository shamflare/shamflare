"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActivePath } from "./nav";

export function DesktopNavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t(item.key)}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 -bottom-px h-px bg-accent transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
