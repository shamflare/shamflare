import { Suspense } from "react";
import { ChevronDown, Languages, Menu } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS } from "./nav";
import { DesktopNavLinks } from "./NavLinks";

/*
 * The interactive header parts read the current pathname, which is only known
 * at request time on dynamic routes. Each sits in a Suspense boundary whose
 * fallback looks identical (the navigation fallback is fully working links).
 */

async function StaticNavLinks() {
  const t = await getTranslations("Nav");
  return (
    <ul className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="relative rounded-[var(--radius-sm)] px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
            {t(item.key)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function LanguageButtonPlaceholder() {
  const locale = await getLocale();
  return (
    <span aria-hidden className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 text-sm text-muted">
      <Languages className="size-4" />
      <span className="font-medium uppercase" dir="ltr">
        {locale}
      </span>
      <ChevronDown className="size-3.5" />
    </span>
  );
}

function MenuButtonPlaceholder() {
  return (
    <span aria-hidden className="grid size-10 place-items-center rounded-[var(--radius-md)] text-fg lg:hidden">
      <Menu className="size-5" />
    </span>
  );
}

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  return (
    <header className="sticky top-0 z-40 border-b border-line">
      {/* Blur lives on a sibling layer: a filter on <header> itself would trap the fixed mobile menu. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65" />
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="rounded-[var(--radius-sm)]" aria-label={`Shamflare — ${t("home")}`}>
          <Wordmark id="sf-mark-header" />
        </Link>
        <nav aria-label={t("primary")} className="hidden lg:block">
          <Suspense fallback={<StaticNavLinks />}>
            <DesktopNavLinks />
          </Suspense>
        </nav>
        <div className="flex items-center gap-2">
          <Suspense fallback={<LanguageButtonPlaceholder />}>
            <LanguageSwitcher />
          </Suspense>
          <ButtonLink href="/contact" size="sm" className="hidden sm:inline-flex">
            {t("startProject")}
          </ButtonLink>
          <Suspense fallback={<MenuButtonPlaceholder />}>
            <MobileMenu />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
