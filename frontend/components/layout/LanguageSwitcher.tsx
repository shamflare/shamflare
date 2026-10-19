"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { useAlternates } from "./alternates";

const DETAIL_SECTIONS = ["services", "portfolio", "blog"];

/** Path to use for `target` locale given the current (locale-less) pathname. */
function targetPath(pathname: string, target: Locale, alternates: ReturnType<typeof useAlternates>): string {
  const [section, slug] = pathname.split("/").filter(Boolean);
  if (section && slug && DETAIL_SECTIONS.includes(section)) {
    // Not every item exists in every language: fall back to the section index.
    return alternates?.[target] ?? `/${section}`;
  }
  return pathname;
}

export function LanguageSwitcher({ variant = "menu" }: { variant?: "menu" | "list" }) {
  const t = useTranslations("Nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const alternates = useAlternates();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = locales.map((l) => (
    <li key={l}>
      <Link
        href={targetPath(pathname, l, alternates)}
        locale={l}
        hrefLang={l}
        lang={l}
        aria-current={l === locale ? "true" : undefined}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center justify-between gap-6 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors",
          l === locale ? "text-fg" : "text-muted hover:bg-surface-3 hover:text-fg",
        )}
      >
        <span>{localeNames[l]}</span>
        {l === locale ? <Check className="size-4 text-accent" aria-hidden /> : null}
      </Link>
    </li>
  ));

  if (variant === "list") {
    return (
      <div>
        <p className="mb-2 px-3 text-xs font-medium tracking-wide text-subtle uppercase">{t("language")}</p>
        <ul className="grid gap-1">{links}</ul>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t("changeLanguage")}: ${localeNames[locale]}`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Languages className="size-4" aria-hidden />
        <span className="font-medium uppercase" dir="ltr">
          {locale}
        </span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute end-0 top-full z-50 mt-2 min-w-44 rounded-[var(--radius-md)] border border-line bg-surface-2 p-1.5 shadow-[var(--shadow-card)]"
      >
        <ul className="grid gap-0.5">{links}</ul>
      </div>
    </div>
  );
}
