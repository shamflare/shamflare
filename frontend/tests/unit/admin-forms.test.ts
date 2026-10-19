import { describe, expect, it } from "vitest";
import { cleanTranslations, flattenFieldErrors } from "@/lib/admin/forms";
import { localState, type FieldDef } from "@/lib/admin/forms";

describe("flattenFieldErrors", () => {
  it("keeps dotted keys and flattens nested DRF errors", () => {
    expect(
      flattenFieldErrors({
        "translations.tr.slug": ["This slug is already used."],
        key: ["Required."],
        translations: { ar: { title: ["This field may not be blank."] } },
      }),
    ).toEqual({
      "translations.tr.slug": "This slug is already used.",
      key: "Required.",
      "translations.ar.title": "This field may not be blank.",
    });
  });
});

describe("cleanTranslations", () => {
  it("trims strings, drops blank list items and empty process steps, keeps deletions", () => {
    expect(
      cleanTranslations({
        en: { title: "  Web  ", capabilities: ["a", " ", "b "], process: [{ title: "", description: "" }, { title: "Plan", description: "" }] },
        tr: null,
      }),
    ).toEqual({
      en: { title: "Web", capabilities: ["a", "b"], process: [{ title: "Plan", description: "" }] },
      tr: null,
    });
  });
});

describe("localState", () => {
  const fields: FieldDef[] = [
    { name: "title", label: "Title", kind: "text", required: true },
    { name: "seo_title", label: "SEO", kind: "text" },
  ];

  it("reports missing, incomplete, draft and published translations", () => {
    expect(localState(undefined, fields)).toBe("missing");
    expect(localState({ title: " ", status: "published" }, fields)).toBe("incomplete");
    expect(localState({ title: "Hi", status: "draft" }, fields)).toBe("draft");
    expect(localState({ title: "Hi", status: "published" }, fields)).toBe("published");
  });
});
