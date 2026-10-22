import { Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ServiceSummary, SiteSettings } from "@/lib/api/types";
import { Wordmark } from "@/components/brand/Wordmark";
import { Container } from "@/components/ui/Section";
import { NAV_ITEMS } from "./nav";

type FooterProps = {
  settings: SiteSettings | null;
  services: ServiceSummary[];
  whatsappHref: string;
  year: number;
};

export async function SiteFooter({ settings, services, whatsappHref, year }: FooterProps) {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tWa = await getTranslations("WhatsApp");
  const linkClass = "text-muted transition-colors hover:text-fg";

  return (
    <footer className="sf-footer border-t border-line text-fg">
      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" aria-label="Shamflare" className="inline-block rounded-[var(--radius-sm)]">
            <Wordmark id="sf-mark-footer" />
          </Link>
          <p className="mt-5 max-w-sm leading-relaxed text-muted">{settings?.tagline || t("description")}</p>
          {settings?.tagline ? <p className="mt-3 max-w-sm text-sm leading-relaxed text-subtle">{t("description")}</p> : null}
        </div>

        <nav aria-label={t("explore")} className="md:col-span-2">
          <h2 className="text-sm font-semibold text-fg">{t("explore")}</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("services")} className="md:col-span-3">
          <h2 className="text-sm font-semibold text-fg">{t("services")}</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            {services.map((service) => (
              <li key={service.id}>
                <Link href={`/services/${service.slug}`} className={linkClass}>
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold text-fg">{t("contact")}</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            {whatsappHref ? (
              <li>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                  <WhatsAppIcon className="size-4" aria-hidden />
                  {tWa("short")}
                </a>
              </li>
            ) : null}
            {settings?.contact_email ? (
              <li>
                <a href={`mailto:${settings.contact_email}`} className={`${linkClass} inline-flex items-center gap-2 break-all`} dir="ltr">
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {settings.contact_email}
                </a>
              </li>
            ) : null}
            {settings?.social_links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-line py-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>{t("rights", { year })}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/privacy" className="transition-colors hover:text-fg">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-fg">
            {t("terms")}
          </Link>
          <a href="#top" className="transition-colors hover:text-fg">
            {t("backToTop")}
          </a>
        </div>
      </Container>
    </footer>
  );
}
