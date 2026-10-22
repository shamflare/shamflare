/**
 * Site appearance: colors, fonts, type scale, shapes and scroll motion edited on
 * the dashboard's Appearance page (GET/PUT /api/v1/admin/appearance/).
 *
 * `appearanceCss()` turns a configuration into a small stylesheet of CSS
 * variable overrides. The public layout injects it, and the dashboard's live
 * preview injects the unsaved draft into the real site inside an iframe.
 *
 * Every value is re-validated here before it reaches CSS (the backend validates
 * too): colors must be #rrggbb and everything else comes from closed lists.
 * Keep the lists in sync with backend/apps/site_settings/appearance.py and the
 * fonts with lib/fonts.ts.
 */

export const THEMES = ["dark", "light"] as const;
export type ThemeName = (typeof THEMES)[number];

export const PALETTE_KEYS = ["bg", "surface", "fg", "muted", "accent", "accent_2", "accent_3", "on_accent"] as const;
export const PART_KEYS = [
  "header_bg",
  "header_fg",
  "hero_bg",
  "card_bg",
  "button_bg",
  "button_fg",
  "link",
  "footer_bg",
  "footer_fg",
  "whatsapp",
] as const;
export const COLOR_KEYS = [...PALETTE_KEYS, ...PART_KEYS] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];
export type ThemeColors = Record<ColorKey, string | null>;

export type FontDef = { key: string; label: string; script: "latin" | "arabic"; turkish: boolean; note?: string };

export const FONTS = [
  { key: "inter", label: "Inter", script: "latin", turkish: true, note: "Default body" },
  { key: "sora", label: "Sora", script: "latin", turkish: true, note: "Default headings" },
  { key: "poppins", label: "Poppins", script: "latin", turkish: true },
  { key: "manrope", label: "Manrope", script: "latin", turkish: true },
  { key: "plus-jakarta", label: "Plus Jakarta Sans", script: "latin", turkish: true },
  { key: "outfit", label: "Outfit", script: "latin", turkish: true },
  { key: "space-grotesk", label: "Space Grotesk", script: "latin", turkish: true },
  { key: "dm-sans", label: "DM Sans", script: "latin", turkish: true },
  { key: "montserrat", label: "Montserrat", script: "latin", turkish: true },
  { key: "lexend", label: "Lexend", script: "latin", turkish: true },
  { key: "playfair", label: "Playfair Display", script: "latin", turkish: true, note: "Serif" },
  { key: "ibm-plex-arabic", label: "IBM Plex Sans Arabic", script: "arabic", turkish: true, note: "Default Arabic" },
  { key: "tajawal", label: "Tajawal · تجوال", script: "arabic", turkish: false },
  { key: "cairo", label: "Cairo · القاهرة", script: "arabic", turkish: true },
  { key: "almarai", label: "Almarai · المراعي", script: "arabic", turkish: false },
  { key: "noto-kufi", label: "Noto Kufi Arabic", script: "arabic", turkish: true },
  { key: "readex", label: "Readex Pro", script: "arabic", turkish: true },
  { key: "changa", label: "Changa", script: "arabic", turkish: true },
  { key: "el-messiri", label: "El Messiri · المسيري", script: "arabic", turkish: true },
  { key: "alexandria", label: "Alexandria", script: "arabic", turkish: true },
  { key: "rubik", label: "Rubik", script: "arabic", turkish: true },
  { key: "vazirmatn", label: "Vazirmatn", script: "arabic", turkish: true },
  { key: "reem-kufi", label: "Reem Kufi · ريم كوفي", script: "arabic", turkish: true, note: "Display" },
  { key: "mada", label: "Mada · مدى", script: "arabic", turkish: true },
  { key: "zain", label: "Zain · زين", script: "arabic", turkish: false },
  { key: "baloo-bhaijaan", label: "Baloo Bhaijaan 2", script: "arabic", turkish: true, note: "Friendly" },
  { key: "markazi", label: "Markazi Text", script: "arabic", turkish: true, note: "Naskh serif" },
  { key: "amiri", label: "Amiri · أميري", script: "arabic", turkish: true, note: "Classic naskh" },
  { key: "lalezar", label: "Lalezar · لاله‌زار", script: "arabic", turkish: true, note: "Headings only" },
] as const satisfies readonly FontDef[];
export type FontKey = (typeof FONTS)[number]["key"];
const FONT_KEYS = new Set<string>(FONTS.map((f) => f.key));

export const FONT_ROLES = ["heading", "body", "arabic_heading", "arabic_body"] as const;
export type FontRole = (typeof FONT_ROLES)[number];

export const BUTTON_SHAPES = ["sharp", "soft", "rounded", "round", "pill"] as const;
export const BUTTON_STYLES = ["solid", "gradient", "outline", "soft"] as const;
export const BUTTON_SIZES = ["compact", "regular", "large"] as const;
export const BUTTON_WEIGHTS = [500, 600, 700] as const;
export const CARD_CORNERS = ["sharp", "soft", "rounded", "round"] as const;
export const HEADING_WEIGHTS = [400, 500, 600, 700, 800] as const;
export const REVEAL_STYLES = ["none", "fade", "rise", "zoom", "blur", "tilt"] as const;
export const REVEAL_SPEEDS = ["gentle", "normal", "brisk"] as const;
export const BODY_SCALE = [0.85, 1.25] as const;
export const HEADING_SCALE = [0.8, 1.3] as const;

export type Appearance = {
  preset: string;
  colors: Record<ThemeName, ThemeColors>;
  fonts: Record<FontRole, FontKey | null>;
  text: { body_scale: number; heading_scale: number; heading_weight: (typeof HEADING_WEIGHTS)[number] };
  buttons: {
    shape: (typeof BUTTON_SHAPES)[number];
    style: (typeof BUTTON_STYLES)[number];
    size: (typeof BUTTON_SIZES)[number];
    weight: (typeof BUTTON_WEIGHTS)[number];
    glow: boolean;
  };
  cards: { corners: (typeof CARD_CORNERS)[number] };
  motion: { reveal: (typeof REVEAL_STYLES)[number]; speed: (typeof REVEAL_SPEEDS)[number] };
};

const emptyColors = (): ThemeColors => Object.fromEntries(COLOR_KEYS.map((k) => [k, null])) as ThemeColors;

export function defaultAppearance(): Appearance {
  return {
    preset: "",
    colors: { dark: emptyColors(), light: emptyColors() },
    fonts: { heading: null, body: null, arabic_heading: null, arabic_body: null },
    text: { body_scale: 1, heading_scale: 1, heading_weight: 600 },
    buttons: { shape: "rounded", style: "solid", size: "regular", weight: 500, glow: true },
    cards: { corners: "rounded" },
    motion: { reveal: "blur", speed: "gentle" },
  };
}

// ---- validation ---------------------------------------------------------------

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

const pick = <T,>(value: unknown, choices: readonly T[], fallback: T): T =>
  choices.includes(value as T) ? (value as T) : fallback;

const clamp = (value: unknown, [min, max]: readonly [number, number], fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** Coerces untrusted input into a complete, valid configuration (invalid parts fall back to defaults). */
export function normalizeAppearance(raw: unknown): Appearance {
  const d = defaultAppearance();
  const src = obj(raw);
  const colors = obj(src.colors);
  for (const theme of THEMES) {
    const values = obj(colors[theme]);
    for (const key of COLOR_KEYS) {
      const v = values[key];
      d.colors[theme][key] = isHexColor(v) ? v.toLowerCase() : null;
    }
  }
  const fonts = obj(src.fonts);
  for (const role of FONT_ROLES) {
    const v = fonts[role];
    d.fonts[role] = typeof v === "string" && FONT_KEYS.has(v) ? (v as FontKey) : null;
  }
  const text = obj(src.text);
  d.text = {
    body_scale: clamp(text.body_scale, BODY_SCALE, 1),
    heading_scale: clamp(text.heading_scale, HEADING_SCALE, 1),
    heading_weight: pick(text.heading_weight, HEADING_WEIGHTS, 600),
  };
  const b = obj(src.buttons);
  d.buttons = {
    shape: pick(b.shape, BUTTON_SHAPES, "rounded"),
    style: pick(b.style, BUTTON_STYLES, "solid"),
    size: pick(b.size, BUTTON_SIZES, "regular"),
    weight: pick(b.weight, BUTTON_WEIGHTS, 500),
    glow: typeof b.glow === "boolean" ? b.glow : true,
  };
  d.cards = { corners: pick(obj(src.cards).corners, CARD_CORNERS, "rounded") };
  const m = obj(src.motion);
  d.motion = { reveal: pick(m.reveal, REVEAL_STYLES, "blur"), speed: pick(m.speed, REVEAL_SPEEDS, "gentle") };
  d.preset = typeof src.preset === "string" && /^[a-z0-9-]{0,40}$/.test(src.preset) ? src.preset : "";
  return d;
}

// ---- built-in palette (mirrors globals.css) -----------------------------------

type Palette = Record<(typeof PALETTE_KEYS)[number], string>;

export const BASE_PALETTE: Record<ThemeName, Palette & { bg_deep: string }> = {
  dark: {
    bg: "#0b1220",
    bg_deep: "#070c16",
    surface: "#111b2d",
    fg: "#f8fafc",
    muted: "#a7b5cc",
    accent: "#67e8f9",
    accent_2: "#38bdf8",
    accent_3: "#a78bfa",
    on_accent: "#04121c",
  },
  light: {
    bg: "#f5f7fb",
    bg_deep: "#eaeff6",
    surface: "#ffffff",
    fg: "#0b1220",
    muted: "#475569",
    accent: "#0e7490",
    accent_2: "#0369a1",
    accent_3: "#7c3aed",
    on_accent: "#ffffff",
  },
};

/** The color a key actually renders with: the override, else what it follows by default. */
export function effectiveColor(a: Appearance, theme: ThemeName, key: ColorKey): string {
  const c = a.colors[theme];
  const base = BASE_PALETTE[theme];
  const get = (k: ColorKey): string => effectiveColor(a, theme, k);
  if (c[key]) return c[key];
  switch (key) {
    case "header_bg":
    case "hero_bg":
      return get("bg");
    case "header_fg":
    case "footer_fg":
      return get("fg");
    case "card_bg":
      return get("surface");
    case "button_bg":
    case "link":
      return get("accent");
    case "button_fg":
      return get("on_accent");
    case "footer_bg":
      return c.bg ?? base.bg_deep;
    case "whatsapp":
      return "#25d366";
    default:
      return base[key];
  }
}

// ---- contrast (WCAG 2) ----------------------------------------------------------

function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrastRatio(a: string, b: string): number {
  if (!isHexColor(a) || !isHexColor(b)) return 21;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const CONTRAST_CHECKS: { label: string; fg: ColorKey; bg: ColorKey; min: number }[] = [
  { label: "Text on page", fg: "fg", bg: "bg", min: 4.5 },
  { label: "Secondary text", fg: "muted", bg: "bg", min: 4.5 },
  { label: "Text on cards", fg: "fg", bg: "card_bg", min: 4.5 },
  { label: "Button label", fg: "button_fg", bg: "button_bg", min: 4.5 },
  { label: "Header text", fg: "header_fg", bg: "header_bg", min: 4.5 },
  { label: "Footer text", fg: "footer_fg", bg: "footer_bg", min: 4.5 },
  { label: "Links", fg: "link", bg: "bg", min: 3 },
];

// ---- CSS generation ---------------------------------------------------------------

const SELECTOR: Record<ThemeName, string> = {
  // Dark is the default when no data-theme is set (no JavaScript).
  dark: 'html:root:not([data-theme="light"])',
  light: 'html:root[data-theme="light"]',
};

const mix = (a: string, b: string, pct: number) => `color-mix(in oklab, ${a}, ${b} ${pct}%)`;

function themeDeclarations(c: ThemeColors, theme: ThemeName): string[] {
  const out: string[] = [];
  const set = (name: string, value: string) => out.push(`--color-${name}:${value}`);
  const dark = theme === "dark";
  const lift = dark ? "#ffffff" : "#000000";

  if (c.bg) {
    set("bg", c.bg);
    set("bg-deep", dark ? mix(c.bg, "#000000", 32) : mix(c.bg, "#0b1220", 4));
  }
  if (c.surface) {
    set("surface", c.surface);
    set("surface-2", mix("var(--color-surface)", "var(--color-fg)", 5));
    set("surface-3", mix("var(--color-surface)", "var(--color-fg)", 10));
  }
  if (c.fg) set("fg", c.fg);
  if (c.muted) {
    set("muted", c.muted);
    set("subtle", mix("var(--color-muted)", "var(--color-bg)", 26));
    set("line", "color-mix(in srgb, var(--color-muted) 14%, transparent)");
    set("line-strong", "color-mix(in srgb, var(--color-muted) 28%, transparent)");
    out.push("--grid-line:color-mix(in srgb, var(--color-muted) 6%, transparent)");
  }
  if (c.accent) {
    set("accent", c.accent);
    set("accent-hover", mix(c.accent, lift, dark ? 22 : 16));
  }
  if (c.accent_2) set("accent-2", c.accent_2);
  if (c.accent_3) set("accent-3", c.accent_3);
  if (c.on_accent) set("on-accent", c.on_accent);
  if (c.header_bg) set("header", c.header_bg);
  if (c.header_fg) {
    set("header-fg", c.header_fg);
    set("header-muted", "color-mix(in oklab, var(--color-header-fg) 72%, var(--color-header))");
  }
  if (c.hero_bg) set("hero", c.hero_bg);
  if (c.card_bg) {
    set("card", c.card_bg);
    set("card-hover", mix("var(--color-card)", "var(--color-fg)", 5));
  }
  if (c.button_bg) {
    set("btn", c.button_bg);
    set("btn-hover", mix(c.button_bg, lift, dark ? 18 : 14));
  }
  if (c.button_fg) set("btn-fg", c.button_fg);
  if (c.link) set("link", c.link);
  if (c.footer_bg) set("footer", c.footer_bg);
  if (c.footer_fg) {
    set("footer-fg", c.footer_fg);
    set("footer-muted", "color-mix(in oklab, var(--color-footer-fg) 72%, var(--color-footer))");
    set("footer-subtle", "color-mix(in oklab, var(--color-footer-fg) 52%, var(--color-footer))");
  }
  if (c.whatsapp) set("whatsapp", c.whatsapp);
  return out;
}

const BUTTON_RADIUS: Record<Appearance["buttons"]["shape"], string> = {
  sharp: "0px",
  soft: "0.375rem",
  rounded: "0.625rem",
  round: "1rem",
  pill: "999px",
};
const CORNERS: Record<Appearance["cards"]["corners"], [string, string, string, string]> = {
  sharp: ["0px", "0px", "0px", "0px"],
  soft: ["0.25rem", "0.375rem", "0.5rem", "0.75rem"],
  rounded: ["0.375rem", "0.625rem", "0.875rem", "1.25rem"],
  round: ["0.5rem", "0.875rem", "1.375rem", "2rem"],
};
const BUTTON_SCALE: Record<Appearance["buttons"]["size"], number> = { compact: 0.9, regular: 1, large: 1.12 };
const REVEAL: Record<Appearance["motion"]["reveal"], string[]> = {
  none: ["--reveal-opacity:1", "--reveal-from:none", "--reveal-blur:0px"],
  fade: ["--reveal-from:none", "--reveal-blur:0px"],
  rise: ["--reveal-from:translate3d(0,64px,0)", "--reveal-blur:0px"],
  zoom: ["--reveal-from:scale(0.88)", "--reveal-blur:6px"],
  blur: [],
  tilt: ["--reveal-from:perspective(1100px) rotateX(16deg) translate3d(0,48px,0) scale(0.98)", "--reveal-blur:4px"],
};
const SPEED: Record<Appearance["motion"]["speed"], string[]> = {
  gentle: [],
  normal: ["--reveal-duration:0.9s"],
  brisk: ["--reveal-duration:0.6s"],
};

/** Stylesheet overriding the design tokens; empty for the built-in design. */
export function appearanceCss(input: unknown): string {
  const a = normalizeAppearance(input);
  const rules: string[] = [];

  for (const theme of THEMES) {
    const decls = themeDeclarations(a.colors[theme], theme);
    if (decls.length) rules.push(`${SELECTOR[theme]}{${decls.join(";")}}`);
  }

  const root: string[] = [];
  const font = (key: FontKey | null) => `var(--ff-${key})`;
  if (a.fonts.heading) root.push(`--font-heading:${font(a.fonts.heading)}`);
  if (a.fonts.body) root.push(`--font-body:${font(a.fonts.body)}`);
  if (a.fonts.arabic_heading) root.push(`--font-arabic-heading:${font(a.fonts.arabic_heading)}`);
  if (a.fonts.arabic_body) root.push(`--font-arabic-body:${font(a.fonts.arabic_body)}`);
  if (a.text.body_scale !== 1) root.push(`--fs-body:${a.text.body_scale}`);
  if (a.text.heading_scale !== 1) root.push(`--fs-heading:${a.text.heading_scale}`);

  const { shape, style, size, weight, glow } = a.buttons;
  if (shape !== "rounded" || a.cards.corners !== "rounded") root.push(`--radius-btn:${BUTTON_RADIUS[shape]}`);
  if (a.cards.corners !== "rounded") {
    const [sm, md, lg, xl] = CORNERS[a.cards.corners];
    root.push(`--radius-sm:${sm}`, `--radius-md:${md}`, `--radius-lg:${lg}`, `--radius-xl:${xl}`);
  }
  if (size !== "regular") root.push(`--btn-scale:${BUTTON_SCALE[size]}`);
  if (weight !== 500) root.push(`--btn-weight:${weight}`);
  if (style === "gradient") {
    root.push(
      "--btn-bg:linear-gradient(110deg,var(--color-btn),var(--color-accent-2) 60%,var(--color-accent-3))",
      "--btn-bg-hover:linear-gradient(110deg,var(--color-btn-hover),var(--color-btn) 45%,var(--color-accent-2))",
    );
  } else if (style === "outline") {
    root.push(
      "--btn-bg:transparent",
      "--btn-bg-hover:color-mix(in srgb,var(--color-btn) 14%,transparent)",
      "--btn-fg:var(--color-btn)",
      "--btn-fg-hover:var(--color-btn)",
      "--btn-border:var(--color-btn)",
    );
  } else if (style === "soft") {
    root.push(
      "--btn-bg:color-mix(in srgb,var(--color-btn) 16%,transparent)",
      "--btn-bg-hover:color-mix(in srgb,var(--color-btn) 26%,transparent)",
      "--btn-fg:var(--color-btn)",
      "--btn-fg-hover:var(--color-btn)",
      "--btn-border:color-mix(in srgb,var(--color-btn) 30%,transparent)",
    );
  }
  if (!glow) root.push("--btn-glow:none");
  root.push(...REVEAL[a.motion.reveal], ...SPEED[a.motion.speed]);

  if (root.length) rules.push(`html:root{${root.join(";")}}`);
  if (a.text.heading_weight !== 600) rules.push(`html:root :is(h1,h2,h3,h4){font-weight:${a.text.heading_weight}}`);
  return rules.join("\n");
}

/** Short stable hash, used to key the injected <style> by its content. */
export function cssHash(css: string): string {
  let h = 5381;
  for (let i = 0; i < css.length; i++) h = ((h << 5) + h + css.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// ---- presets ----------------------------------------------------------------------

type PresetPalette = Partial<Record<(typeof PALETTE_KEYS)[number], string>>;
export type Preset = {
  key: string;
  name: string;
  description: string;
  colors: Record<ThemeName, PresetPalette>;
  buttons?: Partial<Appearance["buttons"]>;
};

const p = (bg: string, surface: string, fg: string, muted: string, accent: string, accent_2: string, accent_3: string, on_accent: string): PresetPalette => ({
  bg,
  surface,
  fg,
  muted,
  accent,
  accent_2,
  accent_3,
  on_accent,
});

export const PRESETS: Preset[] = [
  {
    key: "shamflare",
    name: "Shamflare",
    description: "The original cyan glow on deep navy.",
    colors: { dark: {}, light: {} },
    buttons: { shape: "rounded", style: "solid" },
  },
  {
    key: "damascus-gold",
    name: "Damascus Gold",
    description: "Warm sand, brass and ink — calm and premium.",
    colors: {
      dark: p("#12100b", "#1c1912", "#fbf7ee", "#cbbf9f", "#e5b94e", "#d97706", "#c08457", "#1a1204"),
      light: p("#faf7f0", "#ffffff", "#231c0c", "#625539", "#8a5a00", "#b45309", "#9a3412", "#ffffff"),
    },
    buttons: { shape: "soft", style: "solid" },
  },
  {
    key: "emerald",
    name: "Emerald Night",
    description: "Fresh greens with a lime spark.",
    colors: {
      dark: p("#07130f", "#0d1f19", "#f0fdf4", "#a3c9b8", "#34d399", "#2dd4bf", "#a3e635", "#04140d"),
      light: p("#f3faf6", "#ffffff", "#052e1f", "#3f6b5a", "#047857", "#0f766e", "#4d7c0f", "#ffffff"),
    },
    buttons: { shape: "round", style: "solid" },
  },
  {
    key: "sunset",
    name: "Sunset",
    description: "Orange to rose gradients, energetic.",
    colors: {
      dark: p("#140c0a", "#1f1411", "#fff7ed", "#d6b8a8", "#fb923c", "#f43f5e", "#fbbf24", "#1a0a03"),
      light: p("#fff8f3", "#ffffff", "#2a1209", "#6b4a3a", "#c2410c", "#be123c", "#b45309", "#ffffff"),
    },
    buttons: { shape: "pill", style: "gradient" },
  },
  {
    key: "royal",
    name: "Royal Violet",
    description: "Violet and indigo with a pink accent.",
    colors: {
      dark: p("#0d0b1a", "#16132b", "#f5f3ff", "#b8b2d9", "#a78bfa", "#818cf8", "#f472b6", "#12052e"),
      light: p("#f7f5ff", "#ffffff", "#1e1338", "#574d7a", "#6d28d9", "#4f46e5", "#be185d", "#ffffff"),
    },
    buttons: { shape: "round", style: "gradient" },
  },
  {
    key: "ocean",
    name: "Deep Ocean",
    description: "Trustworthy blues, crisp and corporate.",
    colors: {
      dark: p("#06101f", "#0c1a30", "#eff6ff", "#a5b8d6", "#60a5fa", "#3b82f6", "#22d3ee", "#031027"),
      light: p("#f2f7fe", "#ffffff", "#0b1b33", "#45597a", "#1d4ed8", "#2563eb", "#0e7490", "#ffffff"),
    },
    buttons: { shape: "pill", style: "solid" },
  },
  {
    key: "graphite",
    name: "Graphite",
    description: "Monochrome and minimal, lets content lead.",
    colors: {
      dark: p("#0c0c0d", "#161618", "#fafafa", "#a1a1aa", "#fafafa", "#d4d4d8", "#a1a1aa", "#0c0c0d"),
      light: p("#fafafa", "#ffffff", "#09090b", "#52525b", "#18181b", "#3f3f46", "#71717a", "#fafafa"),
    },
    buttons: { shape: "sharp", style: "solid" },
  },
];

/** Applies a preset: replaces the palette (keeping part overrides cleared) and its button look. */
export function applyPreset(a: Appearance, preset: Preset): Appearance {
  const colors = { dark: emptyColors(), light: emptyColors() };
  for (const theme of THEMES) Object.assign(colors[theme], preset.colors[theme]);
  return { ...a, preset: preset.key, colors, buttons: { ...a.buttons, ...preset.buttons } };
}
