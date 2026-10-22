import { describe, expect, it } from "vitest";
import { PRESETS, appearanceCss, applyPreset, contrastRatio, defaultAppearance, effectiveColor, normalizeAppearance } from "@/lib/appearance";

describe("appearanceCss", () => {
  it("emits nothing for the built-in design", () => {
    expect(appearanceCss(defaultAppearance())).toBe("");
    expect(appearanceCss({})).toBe("");
  });

  it("maps colors per theme, fonts, shapes and motion to token overrides", () => {
    const css = appearanceCss({
      colors: { dark: { accent: "#34D399", header_bg: "#000000" }, light: { bg: "#ffffff" } },
      fonts: { arabic_body: "tajawal", heading: "poppins" },
      text: { body_scale: 1.1, heading_weight: 700 },
      buttons: { shape: "pill", style: "gradient", glow: false },
      motion: { reveal: "none" },
    });
    expect(css).toContain('html:root:not([data-theme="light"]){--color-accent:#34d399');
    expect(css).toContain("--color-header:#000000");
    expect(css).toContain('html:root[data-theme="light"]{--color-bg:#ffffff');
    expect(css).toContain("--font-arabic-body:var(--ff-tajawal)");
    expect(css).toContain("--font-heading:var(--ff-poppins)");
    expect(css).toContain("--fs-body:1.1");
    expect(css).toContain("--radius-btn:999px");
    expect(css).toContain("--btn-bg:linear-gradient(");
    expect(css).toContain("--btn-glow:none");
    expect(css).toContain("--reveal-opacity:1");
    expect(css).toContain(":is(h1,h2,h3,h4){font-weight:700}");
  });

  it("never lets untrusted values reach the stylesheet", () => {
    const css = appearanceCss({
      colors: { dark: { accent: "red}</style><script>alert(1)</script>", bg: "#12345" } },
      fonts: { body: "x);}body{display:none" },
      text: { body_scale: 99, heading_weight: "900;color:red" },
      buttons: { shape: "</style>" },
    });
    expect(css).not.toMatch(/<|script|display:none|red/);
    expect(normalizeAppearance({ text: { body_scale: 99 } }).text.body_scale).toBe(1.25);
  });
});

describe("helpers", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("resolves part colors through their defaults", () => {
    const a = defaultAppearance();
    a.colors.dark.accent = "#ff0000";
    expect(effectiveColor(a, "dark", "button_bg")).toBe("#ff0000");
    expect(effectiveColor(a, "dark", "link")).toBe("#ff0000");
    expect(effectiveColor(a, "light", "button_bg")).toBe("#0e7490");
  });

  it("presets produce valid configurations that stay readable", () => {
    for (const preset of PRESETS) {
      const look = applyPreset(defaultAppearance(), preset);
      expect(normalizeAppearance(look)).toEqual(look);
      for (const theme of ["dark", "light"] as const) {
        const ratio = contrastRatio(effectiveColor(look, theme, "fg"), effectiveColor(look, theme, "bg"));
        expect(ratio, `${preset.key} ${theme}`).toBeGreaterThan(7);
        const btn = contrastRatio(effectiveColor(look, theme, "button_fg"), effectiveColor(look, theme, "button_bg"));
        expect(btn, `${preset.key} ${theme} button`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
