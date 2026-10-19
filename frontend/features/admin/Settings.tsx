"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { describeError } from "@/lib/admin/hooks";
import { cleanTranslations, errorsFrom } from "@/lib/admin/forms";
import type { AdminSettings, SettingsTranslation } from "@/lib/admin/types";
import { whatsappUrl } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { TranslationEditor, type FieldDef } from "@/components/admin/TranslationEditor";
import { Field, Notice, PageTitle, Panel, Spinner, inputClass, useFlash } from "@/components/admin/ui";

const FIELDS: FieldDef[] = [
  { name: "tagline", label: "Tagline", kind: "text", hint: "Shown in the footer. Default: “Turning Ideas Into Digital Products.”", maxLength: 160 },
  { name: "hero_title", label: "Home page headline", kind: "text", hint: "Leave empty to use the built-in headline.", maxLength: 160 },
  { name: "hero_subtitle", label: "Home page introduction", kind: "textarea", hint: "Leave empty to use the built-in text.", maxLength: 400 },
  { name: "about_intro", label: "About page introduction", kind: "textarea", maxLength: 400 },
  { name: "about_body", label: "About page — our approach", kind: "markdown", hint: "Describe how you work. Do not include facts you cannot verify." },
  { name: "whatsapp_message", label: "WhatsApp pre-filled message", kind: "text", maxLength: 300 },
];

const emptyTranslation = (): SettingsTranslation => ({
  tagline: "",
  hero_title: "",
  hero_subtitle: "",
  about_intro: "",
  about_body: "",
  whatsapp_message: "",
});

export function SettingsEditor() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useFlash();

  useEffect(() => {
    apiRequest<AdminSettings>("admin/site-settings/").then(setSettings).catch((err: unknown) => setLoadError(describeError(err)));
  }, []);

  if (loadError) return <Notice kind="error">{loadError}</Notice>;
  if (!settings) return <Spinner />;

  const update = (patch: Partial<AdminSettings>) => setSettings({ ...settings, ...patch });
  const preview = whatsappUrl(settings.whatsapp_number, settings.translations.en?.whatsapp_message ?? "");

  async function save() {
    if (!settings) return;
    setSaving(true);
    setErrors({});
    setFormError("");
    try {
      const saved = await apiRequest<AdminSettings>("admin/site-settings/", {
        method: "PUT",
        body: {
          company_name: settings.company_name.trim(),
          contact_email: settings.contact_email.trim(),
          whatsapp_number: settings.whatsapp_number.replace(/\D/g, ""),
          social_links: settings.social_links.filter((link) => link.label.trim() && link.url.trim()),
          translations: cleanTranslations(settings.translations),
        },
      });
      setSettings(saved);
      setFlash("Settings saved. The website reflects them within about a minute.");
    } catch (err) {
      setErrors(errorsFrom(err));
      setFormError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageTitle title="Site settings" description="Company details and editable website copy, shared by every page." />
      <div className="mb-6 space-y-3" aria-live="polite">
        {formError ? <Notice kind="error">{formError}</Notice> : null}
        {flash ? <Notice kind="success">{flash}</Notice> : null}
      </div>
      <div className="space-y-6">
        <Panel title="Company & contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company name" required error={errors.company_name}>
              {(props) => <input {...props} value={settings.company_name} onChange={(e) => update({ company_name: e.target.value })} className={inputClass} />}
            </Field>
            <Field label="Contact email" hint="Shown on the contact page and footer when set." error={errors.contact_email}>
              {(props) => (
                <input {...props} type="email" dir="ltr" value={settings.contact_email} onChange={(e) => update({ contact_email: e.target.value })} className={inputClass} />
              )}
            </Field>
            <Field
              label="WhatsApp number"
              hint={
                <>
                  International format, digits only (e.g. 905343299918).{" "}
                  {preview ? (
                    <a href={preview} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      Test link
                    </a>
                  ) : null}
                </>
              }
              error={errors.whatsapp_number}
            >
              {(props) => (
                <input
                  {...props}
                  dir="ltr"
                  inputMode="numeric"
                  value={settings.whatsapp_number}
                  onChange={(e) => update({ whatsapp_number: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              )}
            </Field>
          </div>
        </Panel>

        <Panel title="Social links">
          <div className="space-y-3">
            {settings.social_links.length === 0 ? <p className="text-sm text-muted">No social links. They appear in the footer when added.</p> : null}
            {settings.social_links.map((link, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
                <input
                  aria-label={`Link ${index + 1} label`}
                  placeholder="Label (e.g. GitHub)"
                  value={link.label}
                  onChange={(e) =>
                    update({ social_links: settings.social_links.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)) })
                  }
                  className={inputClass}
                />
                <input
                  aria-label={`Link ${index + 1} URL`}
                  placeholder="https://"
                  dir="ltr"
                  type="url"
                  value={link.url}
                  onChange={(e) => update({ social_links: settings.social_links.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)) })}
                  className={inputClass}
                />
                <Button variant="ghost" size="sm" aria-label={`Remove link ${index + 1}`} onClick={() => update({ social_links: settings.social_links.filter((_, i) => i !== index) })}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
            {errors.social_links ? <p className="text-xs text-danger">{errors.social_links}</p> : null}
            <Button variant="secondary" size="sm" onClick={() => update({ social_links: [...settings.social_links, { label: "", url: "" }] })}>
              <Plus className="size-4" aria-hidden /> Add link
            </Button>
          </div>
        </Panel>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Website copy</h2>
          <TranslationEditor<SettingsTranslation>
            fields={FIELDS}
            value={settings.translations}
            onChange={(translations) => update({ translations })}
            errors={errors}
            createEmpty={emptyTranslation}
            hasStatus={false}
          />
        </div>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex justify-end border-t border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
