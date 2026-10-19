"use client";

import type { Paginated } from "@/lib/api/types";
import { useResource } from "@/lib/admin/hooks";
import { cleanTranslations } from "@/lib/admin/forms";
import type { AdminService, ServiceTranslation } from "@/lib/admin/types";
import { SERVICE_ICON_NAMES, ServiceIcon } from "@/components/ui/ServiceIcon";
import { TranslationEditor, type FieldDef } from "@/components/admin/TranslationEditor";
import { Checkbox, Field, Panel, PublishSelect, inputClass } from "@/components/admin/ui";
import { ContentTable, displayTitle } from "./ContentTable";
import { EditorLayout } from "./EditorLayout";
import { useEditor } from "./useEditor";

const FIELDS: FieldDef[] = [
  { name: "title", label: "Title", kind: "text", required: true, maxLength: 160 },
  { name: "slug", label: "URL slug", kind: "slug" },
  { name: "summary", label: "Summary", kind: "textarea", required: true, hint: "One or two sentences shown on cards and listings.", maxLength: 400 },
  { name: "description", label: "Description", kind: "markdown", required: true },
  { name: "capabilities", label: "What we deliver", kind: "list" },
  { name: "use_cases", label: "Typical use cases", kind: "list" },
  { name: "process", label: "Delivery process", kind: "process" },
  { name: "seo_title", label: "SEO title", kind: "text", hint: "Defaults to the title.", maxLength: 70 },
  { name: "seo_description", label: "SEO description", kind: "textarea", hint: "Defaults to the summary. Around 150 characters.", maxLength: 300 },
];

const emptyTranslation = (): ServiceTranslation => ({
  title: "",
  slug: "",
  summary: "",
  description: "",
  capabilities: [],
  use_cases: [],
  process: [],
  seo_title: "",
  seo_description: "",
  status: "draft",
});

const emptyService = (): AdminService => ({
  id: 0,
  key: "",
  icon: "code",
  status: "draft",
  is_featured: false,
  sort_order: 0,
  created_at: "",
  updated_at: "",
  translations: { en: emptyTranslation() },
  translation_status: {},
});

export function ServiceList() {
  const { data, error, loading } = useResource<Paginated<AdminService>>("admin/services/", { page_size: 100 });
  return (
    <ContentTable
      title="Services"
      description="Services shown on the website. A service is public in a language only when the service and that translation are both published."
      newHref="/admin/services/new"
      newLabel="New service"
      rows={data?.results ?? null}
      loading={loading}
      error={error}
      editHref={(row) => `/admin/services/${row.id}`}
      emptyMessage="No services yet."
      extraColumns={[
        { header: "Key", cell: (row) => <span className="font-mono text-xs">{row.key}</span> },
        { header: "Order", cell: (row) => row.sort_order },
        { header: "Featured", cell: (row) => (row.is_featured ? "Yes" : "—") },
      ]}
    />
  );
}

export function ServiceEditor({ id }: { id: string }) {
  const editor = useEditor<AdminService>({
    endpoint: "admin/services/",
    listPath: "/admin/services",
    id,
    createEmpty: emptyService,
    toPayload: (item) => ({
      key: item.key.trim(),
      icon: item.icon,
      status: item.status,
      is_featured: item.is_featured,
      sort_order: Number(item.sort_order) || 0,
      translations: cleanTranslations(item.translations),
    }),
  });
  const { item, setItem, errors } = editor;
  const update = (patch: Partial<AdminService>) => item && setItem({ ...item, ...patch });

  return (
    <EditorLayout
      backHref="/admin/services"
      backLabel="All services"
      title={editor.isNew ? "New service" : item ? displayTitle(item.translations) : "Service"}
      description="Hosting or other future services can be prepared here as drafts and published when ready."
      loadError={editor.loadError}
      loading={!item}
      formError={editor.formError}
      flash={editor.flash}
      saving={editor.saving}
      onSave={editor.save}
      onDelete={editor.remove}
      deleteTitle="Delete this service?"
      deleteMessage="The service and all its translations will be permanently deleted. Projects linked to it keep existing but lose the link."
      isNew={editor.isNew}
      aside={
        item ? (
          <Panel title="Publishing">
            <div className="space-y-4">
              <Field label="Service status" hint="Draft services are never shown publicly." error={errors.status}>
                {(props) => <PublishSelect id={props.id} value={item.status} onChange={(status) => update({ status })} />}
              </Field>
              <Field label="Key" required hint="Stable identifier used by filters and inquiries, e.g. website-development." error={errors.key}>
                {(props) => (
                  <input {...props} value={item.key} onChange={(e) => update({ key: e.target.value })} className={`${inputClass} font-mono`} dir="ltr" />
                )}
              </Field>
              <Field label="Icon" error={errors.icon}>
                {(props) => (
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-line text-accent">
                      <ServiceIcon name={item.icon} className="size-5" />
                    </span>
                    <select {...props} value={item.icon} onChange={(e) => update({ icon: e.target.value })} className={inputClass}>
                      {SERVICE_ICON_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </Field>
              <Field label="Sort order" hint="Lower numbers appear first." error={errors.sort_order}>
                {(props) => (
                  <input {...props} type="number" value={item.sort_order} onChange={(e) => update({ sort_order: Number(e.target.value) })} className={inputClass} />
                )}
              </Field>
              <Checkbox label="Featured" hint="Highlighted on the home page." checked={item.is_featured} onChange={(is_featured) => update({ is_featured })} />
            </div>
          </Panel>
        ) : null
      }
    >
      {item ? (
        <TranslationEditor<ServiceTranslation>
          fields={FIELDS}
          value={item.translations}
          onChange={(translations) => update({ translations })}
          serverStatus={item.translation_status}
          errors={errors}
          createEmpty={emptyTranslation}
        />
      ) : null}
    </EditorLayout>
  );
}
