"use client";

import { useState } from "react";
import type { Paginated } from "@/lib/api/types";
import { useResource } from "@/lib/admin/hooks";
import { cleanTranslations } from "@/lib/admin/forms";
import type { AdminProject, AdminService, ProjectTranslation } from "@/lib/admin/types";
import { TranslationEditor, type FieldDef } from "@/components/admin/TranslationEditor";
import { CoverUpload, GalleryUpload } from "@/components/admin/ImageUpload";
import { Checkbox, Field, Panel, PublishSelect, inputClass } from "@/components/admin/ui";
import { ContentTable, displayTitle } from "./ContentTable";
import { EditorLayout } from "./EditorLayout";
import { useEditor } from "./useEditor";

const FIELDS: FieldDef[] = [
  { name: "title", label: "Title", kind: "text", required: true, maxLength: 160 },
  { name: "slug", label: "URL slug", kind: "slug" },
  { name: "summary", label: "Summary", kind: "textarea", required: true, maxLength: 400 },
  { name: "body", label: "Project write-up", kind: "markdown", required: true, hint: "Goals, approach, technology choices. Never invent clients or results." },
  { name: "cover_alt", label: "Cover alt text", kind: "text", hint: "Describes the cover image for screen-reader users.", maxLength: 200 },
  { name: "seo_title", label: "SEO title", kind: "text", maxLength: 70 },
  { name: "seo_description", label: "SEO description", kind: "textarea", maxLength: 300 },
];

const emptyTranslation = (): ProjectTranslation => ({
  title: "",
  slug: "",
  summary: "",
  body: "",
  cover_alt: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
});

const emptyProject = (): AdminProject => ({
  id: 0,
  category: null,
  services: [],
  technologies: [],
  external_url: "",
  is_featured: false,
  is_demo: false,
  status: "draft",
  sort_order: 0,
  cover_image: null,
  images: [],
  created_at: "",
  updated_at: "",
  translations: { en: emptyTranslation() },
  translation_status: {},
});

export function ProjectList() {
  const { data, error, loading } = useResource<Paginated<AdminProject>>("admin/portfolio/", { page_size: 100 });
  return (
    <ContentTable
      title="Portfolio"
      description="Projects and clearly labelled demonstrations. Only real, verifiable work should be presented as client work."
      newHref="/admin/portfolio/new"
      newLabel="New project"
      rows={data?.results ?? null}
      loading={loading}
      error={error}
      editHref={(row) => `/admin/portfolio/${row.id}`}
      emptyMessage="No projects yet."
      extraColumns={[
        { header: "Type", cell: (row) => (row.is_demo ? "Demonstration" : "Project") },
        { header: "Featured", cell: (row) => (row.is_featured ? "Yes" : "—") },
        { header: "Order", cell: (row) => row.sort_order },
      ]}
    />
  );
}

export function ProjectEditor({ id }: { id: string }) {
  const services = useResource<Paginated<AdminService>>("admin/services/", { page_size: 100 });
  const editor = useEditor<AdminProject>({
    endpoint: "admin/portfolio/",
    listPath: "/admin/portfolio",
    id,
    createEmpty: emptyProject,
    toPayload: (item) => ({
      category: item.category,
      services: item.services,
      technologies: item.technologies.map((t) => t.trim()).filter(Boolean),
      external_url: item.external_url.trim(),
      is_featured: item.is_featured,
      is_demo: item.is_demo,
      status: item.status,
      sort_order: Number(item.sort_order) || 0,
      translations: cleanTranslations(item.translations),
    }),
  });
  const { item, setItem, errors } = editor;
  const update = (patch: Partial<AdminProject>) => item && setItem({ ...item, ...patch });
  const [techText, setTechText] = useState<string | null>(null);
  const serviceOptions = services.data?.results ?? [];

  return (
    <EditorLayout
      backHref="/admin/portfolio"
      backLabel="All projects"
      title={editor.isNew ? "New project" : item ? displayTitle(item.translations) : "Project"}
      loadError={editor.loadError}
      loading={!item}
      formError={editor.formError}
      flash={editor.flash}
      saving={editor.saving}
      onSave={editor.save}
      onDelete={editor.remove}
      deleteTitle="Delete this project?"
      deleteMessage="The project, its translations and its uploaded images will be permanently deleted."
      isNew={editor.isNew}
      aside={
        item ? (
          <>
            <Panel title="Publishing">
              <div className="space-y-4">
                <Field label="Project status" error={errors.status}>
                  {(props) => <PublishSelect id={props.id} value={item.status} onChange={(status) => update({ status })} />}
                </Field>
                <Checkbox
                  label="Demonstration project"
                  hint="Shows a “Demonstration project” label and notice on the website."
                  checked={item.is_demo}
                  onChange={(is_demo) => update({ is_demo })}
                />
                <Checkbox label="Featured" hint="Shown on the home page." checked={item.is_featured} onChange={(is_featured) => update({ is_featured })} />
                <Field label="Sort order" hint="Lower numbers appear first." error={errors.sort_order}>
                  {(props) => (
                    <input {...props} type="number" value={item.sort_order} onChange={(e) => update({ sort_order: Number(e.target.value) })} className={inputClass} />
                  )}
                </Field>
              </div>
            </Panel>
            <Panel title="Cover image">
              <CoverUpload<AdminProject>
                endpoint={`admin/portfolio/${item.id}/cover/`}
                current={item.cover_image}
                disabledReason={editor.isNew ? "Create the project first, then upload a cover image." : undefined}
                onUpdated={editor.replace}
              />
            </Panel>
          </>
        ) : null
      }
    >
      {item ? (
        <>
          <Panel title="Project details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Primary service (category)" error={errors.category}>
                {(props) => (
                  <select
                    {...props}
                    value={item.category ?? ""}
                    onChange={(e) => update({ category: e.target.value ? Number(e.target.value) : null })}
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {serviceOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {displayTitle(s.translations)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="External URL" hint="Optional link to the live project." error={errors.external_url}>
                {(props) => (
                  <input {...props} type="url" dir="ltr" placeholder="https://" value={item.external_url} onChange={(e) => update({ external_url: e.target.value })} className={inputClass} />
                )}
              </Field>
              <Field label="Technologies" hint="Comma-separated, e.g. Next.js, Django, PostgreSQL." error={errors.technologies} className="sm:col-span-2">
                {(props) => (
                  <input
                    {...props}
                    dir="ltr"
                    value={techText ?? item.technologies.join(", ")}
                    onChange={(e) => {
                      setTechText(e.target.value);
                      update({ technologies: e.target.value.split(",") });
                    }}
                    onBlur={() => setTechText(null)}
                    className={inputClass}
                  />
                )}
              </Field>
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-medium">Related services</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {serviceOptions.length === 0 ? <p className="text-sm text-subtle">No services available.</p> : null}
                  {serviceOptions.map((s) => (
                    <Checkbox
                      key={s.id}
                      label={displayTitle(s.translations)}
                      checked={item.services.includes(s.id)}
                      onChange={(checked) =>
                        update({ services: checked ? [...item.services, s.id] : item.services.filter((sid) => sid !== s.id) })
                      }
                    />
                  ))}
                </div>
                {errors.services ? <p className="mt-1.5 text-xs text-danger">{errors.services}</p> : null}
              </fieldset>
            </div>
          </Panel>

          <TranslationEditor<ProjectTranslation>
            fields={FIELDS}
            value={item.translations}
            onChange={(translations) => update({ translations })}
            serverStatus={item.translation_status}
            errors={errors}
            createEmpty={emptyTranslation}
          />

          <Panel title="Gallery">
            {editor.isNew ? (
              <p className="text-sm text-muted">Create the project first, then add gallery images.</p>
            ) : (
              <GalleryUpload<AdminProject> endpoint={`admin/portfolio/${item.id}/images/`} images={item.images} onUpdated={editor.replace} />
            )}
          </Panel>
        </>
      ) : null}
    </EditorLayout>
  );
}
