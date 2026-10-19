import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="font-mono text-sm text-accent" dir="ltr">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{t("title")}</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">{t("body")}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">{t("home")}</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          {t("contact")}
        </ButtonLink>
      </div>
    </Container>
  );
}
