"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Error");
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24" role="alert">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">{t("body")}</p>
      <Button className="mt-10" onClick={reset}>
        {t("retry")}
      </Button>
    </Container>
  );
}
