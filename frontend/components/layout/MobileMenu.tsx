"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV_ITEMS, isActivePath } from "./nav";

export function MobileMenu() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close after navigating to another page.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const toggle = toggleRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep keyboard focus inside the open menu.
      if (event.key === "Tab" && panelRef.current) {
        const focusable = [
          toggle,
          ...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        ].filter(Boolean) as HTMLElement[];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        onClick={() => setOpen((value) => !value)}
        className="relative z-[60] grid size-10 place-items-center rounded-[var(--radius-md)] text-fg transition-colors hover:bg-surface-2"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-line bg-bg/98 backdrop-blur-xl"
      >
        <nav aria-label={t("primary")} className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8">
          <ul className="grid gap-1">
            {[{ href: "/", key: "home" } as const, ...NAV_ITEMS].map((item) => {
              const active = item.href === "/" ? pathname === "/" : isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-[var(--radius-md)] px-3 py-3.5 text-lg transition-colors",
                      active ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    {t(item.key)}
                    <ArrowRight className="size-4 text-subtle rtl:-scale-x-100" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
          <LanguageSwitcher variant="list" />
          <Link href="/contact" className={buttonClasses({ size: "lg", className: "w-full" })}>
            {t("startProject")}
          </Link>
        </nav>
      </div>
    </div>
  );
}
