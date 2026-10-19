"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";
import { describeError, useResource } from "@/lib/admin/hooks";
import { cleanTranslations, errorsFrom } from "@/lib/admin/forms";
import type { AdminCategory, AdminPost, CategoryTranslation, PostTranslation } from "@/lib/admin/types";
import { locales, localeNames, directionOf } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { TranslationEditor, type FieldDef } from "@/components/admin/TranslationEditor";
import { CoverUpload } from "@/components/admin/ImageUpload";
import {
  ConfirmButton,
  Field,
  Notice,
  PageTitle,
  Panel,
  PublishSelect,
  Spinner,
  TranslationBadges,
  formatDateTime,
  inputClass,
} from "@/components/admin/ui";
import { ContentTable, displayTitle } from "./ContentTable";
import { EditorLayout } from "./EditorLayout";
import { useEditor } from "./useEditor";

const POST_FIELDS: FieldDef[] = [
  { name: "title", label: "Title", kind: "text", required: true, maxLength: 200 },
  { name: "slug", label: "URL slug", kind: "slug" },
  { name: "excerpt", label: "Excerpt", kind: "textarea", required: true, hint: "Shown in listings and as the article introduction.", maxLength: 400 },
  { name: "body", label: "Article", kind: "markdown", required: true },
  { name: "cover_alt", label: "Cover alt text", kind: "text", maxLength: 200 },
  { name: "seo_title", label: "SEO title", kind: "text", maxLength: 70 },
  { name: "seo_description", label: "SEO description", kind: "textarea", maxLength: 300 },
];

const emptyPostTranslation = (): PostTranslation => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_alt: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
});

const emptyPost = (): AdminPost => ({
  id: 0,
  category: null,
  author_name: "",
  status: "draft",
  published_at: null,
  cover_image: null,
  created_at: "",
  updated_at: "",
  translations: { en: emptyPostTranslation() },
  translation_status: {},
});

/** `datetime-local` works in local time; the API stores UTC ISO strings. */
function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PostList() {
  const { data, error, loading } = useResource<Paginated<AdminPost>>("admin/blog/posts/", { page_size: 100 });
  return (
    <ContentTable
      title="Blog posts"
      description="Articles appear in a language when the post and that translation are published and the publication date has passed."
      newHref="/admin/blog/new"
      newLabel="New post"
      rows={data?.results ?? null}
      loading={loading}
      error={error}
      editHref={(row) => `/admin/blog/${row.id}`}
      emptyMessage="No posts yet."
      extraColumns={[{ header: "Published at", cell: (row) => formatDateTime(row.published_at) }]}
    />
  );
}

export function PostEditor({ id }: { id: string }) {
  const categories = useResource<AdminCategory[] | Paginated<AdminCategory>>("admin/blog/categories/", { page_size: 100 });
  const categoryOptions = Array.isArray(categories.data) ? categories.data : (categories.data?.results ?? []);
  const editor = useEditor<AdminPost>({
    endpoint: "admin/blog/posts/",
    listPath: "/admin/blog",
    id,
    createEmpty: emptyPost,
    toPayload: (item) => ({
      category: item.category,
      status: item.status,
      published_at: item.published_at,
      translations: cleanTranslations(item.translations),
    }),
  });
  const { item, setItem, errors } = editor;
  const update = (patch: Partial<AdminPost>) => item && setItem({ ...item, ...patch });

  return (
    <EditorLayout
      backHref="/admin/blog"
      backLabel="All posts"
      title={editor.isNew ? "New post" : item ? displayTitle(item.translations) : "Post"}
      description={item?.author_name ? `Author: ${item.author_name}` : "The author is set to your account when the post is created."}
      loadError={editor.loadError}
      loading={!item}
      formError={editor.formError}
      flash={editor.flash}
      saving={editor.saving}
      onSave={editor.save}
      onDelete={editor.remove}
      deleteTitle="Delete this post?"
      deleteMessage="The post, all its translations and its cover image will be permanently deleted."
      isNew={editor.isNew}
      aside={
        item ? (
          <>
            <Panel title="Publishing">
              <div className="space-y-4">
                <Field label="Post status" error={errors.status}>
                  {(props) => <PublishSelect id={props.id} value={item.status} onChange={(status) => update({ status })} />}
                </Field>
                <Field label="Publication date" hint="Set automatically on first publish if left empty. A future date schedules the post." error={errors.published_at}>
                  {(props) => (
                    <input
                      {...props}
                      type="datetime-local"
                      value={toLocalInput(item.published_at)}
                      onChange={(e) => update({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className={inputClass}
                    />
                  )}
                </Field>
                <Field label="Category" error={errors.category}>
                  {(props) => (
                    <select
                      {...props}
                      value={item.category ?? ""}
                      onChange={(e) => update({ category: e.target.value ? Number(e.target.value) : null })}
                      className={inputClass}
                    >
                      <option value="">No category</option>
                      {categoryOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {displayTitle(c.translations, "name")}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </Panel>
            <Panel title="Cover image">
              <CoverUpload<AdminPost>
                endpoint={`admin/blog/posts/${item.id}/cover/`}
                current={item.cover_image}
                disabledReason={editor.isNew ? "Create the post first, then upload a cover image." : undefined}
                onUpdated={editor.replace}
              />
            </Panel>
          </>
        ) : null
      }
    >
      {item ? (
        <TranslationEditor<PostTranslation>
          fields={POST_FIELDS}
          value={item.translations}
          onChange={(translations) => update({ translations })}
          serverStatus={item.translation_status}
          errors={errors}
          createEmpty={emptyPostTranslation}
        />
      ) : null}
    </EditorLayout>
  );
}

/** Categories are small, so they are managed inline on one page. */
export function CategoryManager() {
  const { data, error, loading, reload } = useResource<AdminCategory[] | Paginated<AdminCategory>>("admin/blog/categories/", { page_size: 100 });
  const categories = Array.isArray(data) ? data : (data?.results ?? null);
  const [editing, setEditing] = useState<AdminCategory | null>(null);

  return (
    <>
      <PageTitle
        title="Blog categories"
        description="Each category needs a name in every language where its posts are published."
        actions={
          <Button size="sm" onClick={() => setEditing({ id: 0, sort_order: 0, translations: { en: { name: "", slug: "" } }, translation_status: {} })}>
            <Plus className="size-4" aria-hidden /> New category
          </Button>
        }
      />
      {error ? <Notice kind="error">{describeError(error)}</Notice> : null}
      {loading && !categories ? <Spinner /> : null}
      {editing ? (
        <CategoryForm
          key={editing.id}
          category={editing}
          onDone={() => {
            setEditing(null);
            reload();
          }}
          onCancel={() => setEditing(null)}
        />
      ) : null}
      {categories ? (
        <ul className="mt-6 divide-y divide-line rounded-[var(--radius-lg)] border border-line">
          {categories.length === 0 ? <li className="px-4 py-12 text-center text-sm text-muted">No categories yet.</li> : null}
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="font-medium">{displayTitle(category.translations, "name")}</span>
                <TranslationBadges status={category.translation_status} />
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditing(category)}>
                Edit
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function CategoryForm({ category, onDone, onCancel }: { category: AdminCategory; onDone: () => void; onCancel: () => void }) {
  const isNew = category.id === 0;
  const [value, setValue] = useState(category);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setErrors({});
    setFormError("");
    try {
      await apiRequest(isNew ? "admin/blog/categories/" : `admin/blog/categories/${category.id}/`, {
        method: isNew ? "POST" : "PUT",
        body: { sort_order: Number(value.sort_order) || 0, translations: cleanTranslations(value.translations) },
      });
      onDone();
    } catch (err) {
      setErrors(errorsFrom(err));
      setFormError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await apiRequest(`admin/blog/categories/${category.id}/`, { method: "DELETE" });
      onDone();
    } catch (err) {
      setFormError(describeError(err));
    }
  }

  return (
    <Panel title={isNew ? "New category" : "Edit category"}>
      <div className="space-y-5">
        {formError ? <Notice kind="error">{formError}</Notice> : null}
        <div className="grid gap-4 md:grid-cols-3">
          {locales.map((l) => {
            const translation = value.translations[l];
            return (
              <fieldset key={l} className="space-y-3 rounded-[var(--radius-md)] border border-line p-4">
                <legend className="px-1 text-sm font-medium">{localeNames[l]}</legend>
                {translation ? (
                  <>
                    <Field label="Name" error={errors[`translations.${l}.name`]}>
                      {(props) => (
                        <input
                          {...props}
                          dir={directionOf(l)}
                          lang={l}
                          value={translation.name}
                          onChange={(e) => setValue({ ...value, translations: { ...value.translations, [l]: { ...translation, name: e.target.value } } })}
                          className={inputClass}
                        />
                      )}
                    </Field>
                    <Field label="Slug" hint="Leave empty to generate." error={errors[`translations.${l}.slug`]}>
                      {(props) => (
                        <input
                          {...props}
                          dir="ltr"
                          value={translation.slug}
                          onChange={(e) => setValue({ ...value, translations: { ...value.translations, [l]: { ...translation, slug: e.target.value } } })}
                          className={`${inputClass} font-mono`}
                        />
                      )}
                    </Field>
                    <Button variant="ghost" size="sm" className="text-danger" onClick={() => setValue({ ...value, translations: { ...value.translations, [l]: null } })}>
                      Remove {localeNames[l]}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setValue({ ...value, translations: { ...value.translations, [l]: { name: "", slug: "" } as CategoryTranslation } })}
                  >
                    <Plus className="size-4" aria-hidden /> Add {localeNames[l]}
                  </Button>
                )}
              </fieldset>
            );
          })}
        </div>
        <Field label="Sort order" className="max-w-40">
          {(props) => (
            <input {...props} type="number" value={value.sort_order} onChange={(e) => setValue({ ...value, sort_order: Number(e.target.value) })} className={inputClass} />
          )}
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          {!isNew ? (
            <ConfirmButton title="Delete this category?" message="Posts in this category will remain, without a category." onConfirm={remove}>
              Delete category
            </ConfirmButton>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save category"}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

