import { describe, expect, it } from "vitest";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") acc[path] = value;
    else Object.assign(acc, flatten(value, path));
    return acc;
  }, {});
}

/** Top-level ICU argument names, e.g. "{count} / {max}" → ["count", "max"]. */
function placeholders(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  let current = "";
  for (const char of message) {
    if (char === "{") {
      depth++;
      if (depth === 1) current = "";
    } else if (char === "}") {
      if (depth === 1) names.add(current.split(",")[0].trim());
      depth--;
    } else if (depth === 1) {
      current += char;
    }
  }
  return [...names].sort();
}

const catalogues = { en: flatten(en), tr: flatten(tr), ar: flatten(ar) };

describe("translation catalogues", () => {
  const englishKeys = Object.keys(catalogues.en).sort();

  for (const [locale, messages] of Object.entries(catalogues)) {
    it(`${locale} has exactly the English keys`, () => {
      expect(Object.keys(messages).sort()).toEqual(englishKeys);
    });

    it(`${locale} has no empty messages`, () => {
      const empty = Object.entries(messages).filter(([, value]) => !value.trim());
      expect(empty).toEqual([]);
    });

    it(`${locale} uses the same placeholders as English`, () => {
      const mismatched = englishKeys.filter((key) => placeholders(messages[key]).join() !== placeholders(catalogues.en[key]).join());
      expect(mismatched).toEqual([]);
    });
  }

  it("Arabic interface strings are actually Arabic", () => {
    const latinOnly = ["Nav.home", "Hero.title", "Form.submit", "Footer.description"].filter(
      (key) => !/[؀-ۿ]/.test(catalogues.ar[key]),
    );
    expect(latinOnly).toEqual([]);
  });
});
