"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { directionOf, localeNames, locales, type Locale } from "@/i18n/routing";
import type { TranslationMap, TranslationState } from "@/lib/admin/types";
import type { ProcessStep } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { Markdown } from "@/components/content/Markdown";
import { Button } from "@/components/ui/Button";
import { localState, type FieldDef, type Translation } from "@/lib/admin/forms";
import { ConfirmButton, Field, PublishSelect, StatusBadge, inputClass } from "./ui";

export type { FieldDef };

type Props<T extends Translation> = {
  fields: FieldDef[];
  value: TranslationMap<T>;
  onChange: (next: TranslationMap<T>) => void;
  serverStatus?: Partial<Record<Locale, TranslationState>>;
  /** Field errors keyed like `translations.tr.slug`. */
  errors: Record<string, string>;
  createEmpty: () => T;
  /** Whether translations carry their own draft/published status. */
  hasStatus?: boolean;
};

export function TranslationEditor<T extends Translation>({
  fields,
  value,
  onChange,
  serverStatus,
  errors,
  createEmpty,
  hasStatus = true,
}: Props<T>) {
  const [active, setActive] = useState<Locale>("en");
  const tabsId = useId();
  const tabRefs = useRef<Partial<Record<Locale, HTMLButtonElement | null>>>({});
  const current = value[active];
  const dir = directionOf(active);

  function setField(name: string, fieldValue: unknown) {
    if (!current) return;
    onChange({ ...value, [active]: { ...current, [name]: fieldValue } });
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const index = locales.indexOf(active);
    const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!offset) return;
    event.preventDefault();
    const next = locales[(index + offset + locales.length) % locales.length];
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  const errorFor = (name: string) => errors[`translations.${active}.${name}`];
  const languageErrors = (l: Locale) => Object.keys(errors).some((key) => key.startsWith(`translations.${l}.`));

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface">
      <div role="tablist" aria-label="Translations" className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-3">
        {locales.map((l) => {
          const state = localState(value[l], fields);
          const selected = l === active;
          return (
            <button
              key={l}
              ref={(el) => {
                tabRefs.current[l] = el;
              }}
              type="button"
              role="tab"
              id={`${tabsId}-tab-${l}`}
              aria-selected={selected}
              aria-controls={`${tabsId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(l)}
              onKeyDown={onTabKey}
              className={cn(
                "-mb-px flex items-center gap-2 rounded-t-[var(--radius-md)] border border-b-0 px-4 py-2.5 text-sm transition-colors",
                selected ? "border-line bg-bg text-fg" : "border-transparent text-muted hover:text-fg",
              )}
            >
              <span>{localeNames[l]}</span>
              <StatusBadge status={state} />
              {languageErrors(l) ? <span className="size-1.5 rounded-full bg-danger" aria-label="has errors" /> : null}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-tab-${active}`} className="bg-bg/40 p-5">
        {!current ? (
          <div className="flex flex-col items-start gap-4 py-6">
            <p className="text-sm text-muted">
              There is no {localeNames[active]} translation yet. Visitors browsing in {localeNames[active]} will not see this item
              until a translation is added and published.
            </p>
            <Button size="sm" onClick={() => onChange({ ...value, [active]: createEmpty() })}>
              <Plus className="size-4" aria-hidden />
              Add {localeNames[active]} translation
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {serverStatus?.[active] && serverStatus[active] !== localState(current, fields) ? (
              <p className="text-xs text-subtle">
                Saved state: <StatusBadge status={serverStatus[active] ?? "missing"} /> — unsaved changes below.
              </p>
            ) : null}
            {fields.map((field) => (
              <TranslationField
                key={`${active}-${field.name}`}
                field={field}
                locale={active}
                dir={dir}
                value={current[field.name]}
                error={errorFor(field.name)}
                onChange={(v) => setField(field.name, v)}
              />
            ))}
            <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
              {hasStatus ? (
                <Field label={`${localeNames[active]} translation status`} hint="Only published translations are visible to visitors." className="sm:w-64">
                  {(props) => (
                    <PublishSelect
                      id={props.id}
                      value={(current.status as "draft" | "published") ?? "draft"}
                      onChange={(v) => setField("status", v)}
                    />
                  )}
                </Field>
              ) : (
                <span />
              )}
              <ConfirmButton
                title={`Remove the ${localeNames[active]} translation?`}
                message="The translation will be deleted when you save. This cannot be undone after saving."
                confirmLabel="Remove"
                onConfirm={() => onChange({ ...value, [active]: null })}
              >
                <Trash2 className="size-4" aria-hidden />
                Remove translation
              </ConfirmButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TranslationField({
  field,
  locale,
  dir,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  locale: Locale;
  dir: "rtl" | "ltr";
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const [preview, setPreview] = useState(false);
  const text = typeof value === "string" ? value : "";

  if (field.kind === "process") {
    return <ProcessField label={field.label} steps={(value as ProcessStep[]) ?? []} dir={dir} locale={locale} error={error} onChange={onChange} />;
  }

  const hint =
    field.kind === "list"
      ? `${field.hint ? `${field.hint} ` : ""}One item per line.`
      : field.kind === "slug"
        ? (field.hint ?? "Used in the URL. Leave empty to generate it from the title.")
        : field.hint;

  return (
    <Field label={field.label} hint={hint} error={error} required={field.required}>
      {(props) => {
        if (field.kind === "text" || field.kind === "slug") {
          return (
            <input
              {...props}
              value={text}
              maxLength={field.maxLength}
              dir={field.kind === "slug" ? "ltr" : dir}
              lang={locale}
              onChange={(e) => onChange(e.target.value)}
              className={cn(inputClass, field.kind === "slug" && "font-mono")}
            />
          );
        }
        if (field.kind === "list") {
          const items = Array.isArray(value) ? (value as string[]) : [];
          return (
            <textarea
              {...props}
              rows={Math.max(4, items.length + 1)}
              dir={dir}
              lang={locale}
              value={items.join("\n")}
              // Keep lines verbatim while typing (so the caret never jumps); tidy up on blur and on save.
              onChange={(e) => onChange(e.target.value.split("\n"))}
              onBlur={(e) => onChange(e.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}
              className={inputClass}
            />
          );
        }
        if (field.kind === "markdown") {
          return (
            <div>
              <div className="mb-2 flex gap-1">
                <Button size="sm" variant={preview ? "ghost" : "secondary"} onClick={() => setPreview(false)} aria-pressed={!preview}>
                  <Pencil className="size-3.5" aria-hidden /> Write
                </Button>
                <Button size="sm" variant={preview ? "secondary" : "ghost"} onClick={() => setPreview(true)} aria-pressed={preview}>
                  <Eye className="size-3.5" aria-hidden /> Preview
                </Button>
              </div>
              {preview ? (
                <div dir={dir} lang={locale} className="min-h-40 rounded-[var(--radius-md)] border border-line bg-bg p-5">
                  {text.trim() ? <Markdown>{text}</Markdown> : <p className="text-sm text-subtle">Nothing to preview yet.</p>}
                </div>
              ) : (
                <textarea
                  {...props}
                  rows={14}
                  dir={dir}
                  lang={locale}
                  value={text}
                  onChange={(e) => onChange(e.target.value)}
                  className={cn(inputClass, "font-mono text-[0.8125rem] leading-relaxed")}
                />
              )}
              <p className="mt-1.5 text-xs text-subtle">Markdown: ## headings, **bold**, lists, [links](https://…). HTML is not rendered.</p>
            </div>
          );
        }
        return (
          <textarea
            {...props}
            rows={3}
            dir={dir}
            lang={locale}
            value={text}
            maxLength={field.maxLength}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );
      }}
    </Field>
  );
}

function ProcessField({
  label,
  steps,
  dir,
  locale,
  error,
  onChange,
}: {
  label: string;
  steps: ProcessStep[];
  dir: "rtl" | "ltr";
  locale: Locale;
  error?: string;
  onChange: (value: ProcessStep[]) => void;
}) {
  const update = (index: number, patch: Partial<ProcessStep>) =>
    onChange(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-fg">{label}</legend>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="grid gap-2 rounded-[var(--radius-md)] border border-line p-3 sm:grid-cols-[2rem_1fr_auto]">
            <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
            <div className="grid gap-2">
              <input
                aria-label={`Step ${index + 1} title`}
                value={step.title}
                dir={dir}
                lang={locale}
                onChange={(e) => update(index, { title: e.target.value })}
                className={inputClass}
                placeholder="Title"
              />
              <textarea
                aria-label={`Step ${index + 1} description`}
                value={step.description}
                dir={dir}
                lang={locale}
                rows={2}
                onChange={(e) => update(index, { description: e.target.value })}
                className={inputClass}
                placeholder="Description"
              />
            </div>
            <Button variant="ghost" size="sm" aria-label={`Remove step ${index + 1}`} onClick={() => onChange(steps.filter((_, i) => i !== index))}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ol>
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => onChange([...steps, { title: "", description: "" }])}>
        <Plus className="size-4" aria-hidden /> Add step
      </Button>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </fieldset>
  );
}
