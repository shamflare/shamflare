"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/routing";
import { legalDefaults } from "@/content/legal";
import { apiRequest } from "@/lib/api/client";
import type { LegalKind } from "@/lib/api/types";
import { describeError } from "@/lib/admin/hooks";
import { cleanTranslations, errorsFrom } from "@/lib/admin/forms";
import type { AdminLegalDocument, LegalTranslation, TranslationMap } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { TranslationEditor, type FieldDef } from "@/components/admin/TranslationEditor";
import { Notice, PageTitle, Panel, Spinner, useFlash } from "@/components/admin/ui";

const KINDS: { kind: LegalKind; label: string; path: string }[] = [
  { kind: "privacy", label: "Privacy Policy", path: "privacy" },
  { kind: "terms", label: "Terms of Use", path: "terms" },
];

const FIELDS: FieldDef[] = [
  {
    name: "body",
    label: "Document text",
    kind: "markdown",
    hint: "Describe only what the website really does. Tables and mailto: links are supported.",
  },
];

type Loaded = { doc: AdminLegalDocument; translations: TranslationMap<LegalTranslation>; builtIn: Locale[] };

/** Languages without text in the CMS start from the built-in document the website shows today. */
function withDefaults(doc: AdminLegalDocument): Loaded {
  const translations: TranslationMap<LegalTranslation> = { ...doc.translations };
  const builtIn: Locale[] = [];
  for (const locale of locales) {
    if (!translations[locale]?.body?.trim()) {
      translations[locale] = { body: legalDefaults[doc.kind][locale].trim() };
      builtIn.push(locale);
    }
  }
  return { doc, translations, builtIn };
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(value)) : null;
}

export function LegalEditor() {
  const [active, setActive] = useState<LegalKind>("privacy");
  const [documents, setDocuments] = useState<Partial<Record<LegalKind, Loaded>>>({});
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useFlash();

  useEffect(() => {
    Promise.all(KINDS.map(({ kind }) => apiRequest<AdminLegalDocument>(`admin/legal/${kind}/`)))
      .then((docs) => setDocuments(Object.fromEntries(docs.map((doc) => [doc.kind, withDefaults(doc)]))))
      .catch((err: unknown) => setLoadError(describeError(err)));
  }, []);

  if (loadError) return <Notice kind="error">{loadError}</Notice>;
  const current = documents[active];
  if (!current) return <Spinner />;
  const meta = KINDS.find((k) => k.kind === active)!;

  async function save() {
    if (!current) return;
    setSaving(true);
    setErrors({});
    setFormError("");
    try {
      const saved = await apiRequest<AdminLegalDocument>(`admin/legal/${active}/`, {
        method: "PUT",
        body: { translations: cleanTranslations(current.translations) },
      });
      setDocuments((all) => ({ ...all, [active]: withDefaults(saved) }));
      setFlash(`${meta.label} saved. The website shows it within about a minute.`);
    } catch (err) {
      setErrors(errorsFrom(err));
      setFormError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  const lastUpdated = formatDate(current.doc.content_updated_at);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageTitle title="Legal pages" description="The Privacy Policy and Terms of Use shown on the website, in every language." />

      <div role="tablist" aria-label="Document" className="mb-6 inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-1">
        {KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={active === kind}
            onClick={() => {
              setActive(kind);
              setErrors({});
              setFormError("");
            }}
            className={cn(
              "rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors",
              active === kind ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 space-y-3" aria-live="polite">
        {formError ? <Notice kind="error">{formError}</Notice> : null}
        {flash ? <Notice kind="success">{flash}</Notice> : null}
      </div>

      <div className="space-y-6">
        <Panel
          title={meta.label}
          actions={
            <div className="flex flex-wrap gap-2">
              {locales.map((locale) => (
                <a
                  key={locale}
                  href={`/${locale}/${meta.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg"
                >
                  {locale.toUpperCase()} <ExternalLink className="size-3" aria-hidden />
                </a>
              ))}
            </div>
          }
        >
          <p className="text-sm text-muted">
            {lastUpdated ? (
              <>
                “Last updated” on the website: <span className="text-fg">{lastUpdated}</span>. It changes automatically when you
                save a change to the text.
              </>
            ) : (
              <>The website currently shows the built-in text. Saving stores it here and sets “Last updated” to today.</>
            )}
          </p>
          {current.builtIn.length > 0 ? (
            <p className="mt-2 text-sm text-muted">
              Pre-filled with the built-in text (not saved yet): {current.builtIn.map((l) => localeNames[l]).join(", ")}.
            </p>
          ) : null}
        </Panel>

        <TranslationEditor<LegalTranslation>
          key={active}
          fields={FIELDS}
          value={current.translations}
          onChange={(translations) => setDocuments((all) => ({ ...all, [active]: { ...current, translations } }))}
          errors={errors}
          createEmpty={() => ({ body: "" })}
          hasStatus={false}
        />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex justify-end border-t border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : `Save ${meta.label}`}
        </Button>
      </div>
    </form>
  );
}
