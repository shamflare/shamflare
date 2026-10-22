"use client";

import {
  Baseline,
  Blend,
  CircleAlert,
  Contrast,
  CreditCard,
  Image as ImageIcon,
  Link2,
  MousePointerClick,
  Palette,
  PanelBottom,
  PanelTop,
  Shapes,
  Sparkles,
  SwatchBook,
  Type,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { describeError } from "@/lib/admin/hooks";
import {
  BODY_SCALE,
  CONTRAST_CHECKS,
  HEADING_SCALE,
  PRESETS,
  appearanceCss,
  applyPreset,
  contrastRatio,
  defaultAppearance,
  effectiveColor,
  normalizeAppearance,
  type Appearance,
  type ColorKey,
  type FontRole,
  type Preset,
  type ThemeName,
} from "@/lib/appearance";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { ConfirmButton, Notice, Spinner, useFlash } from "@/components/admin/ui";
import { ColorField, FontPicker, Group, Segmented, Slider, TileGroup } from "./controls";
import { LivePreview, type PreviewHandle } from "./LivePreview";

type Tab = "theme" | "parts" | "type" | "shapes" | "motion";
const TABS: { key: Tab; label: string; icon: typeof Palette }[] = [
  { key: "theme", label: "Theme", icon: Palette },
  { key: "parts", label: "Parts", icon: SwatchBook },
  { key: "type", label: "Fonts", icon: Type },
  { key: "shapes", label: "Shapes", icon: Shapes },
  { key: "motion", label: "Motion", icon: Sparkles },
];

const PALETTE_FIELDS: { key: ColorKey; label: string; hint: string }[] = [
  { key: "accent", label: "Brand color", hint: "Buttons, highlights, icons" },
  { key: "accent_2", label: "Gradient middle", hint: "Headline gradient, glows" },
  { key: "accent_3", label: "Gradient end", hint: "Badges and the gradient's end" },
  { key: "on_accent", label: "Text on brand color", hint: "Labels on primary buttons" },
  { key: "bg", label: "Page background", hint: "The canvas behind everything" },
  { key: "surface", label: "Panels", hint: "Cards, inputs and boxes" },
  { key: "fg", label: "Main text", hint: "Headings and body text" },
  { key: "muted", label: "Secondary text", hint: "Descriptions; also borders" },
];

type PartDef = { title: string; description: string; icon: ReactNode; selector?: string; fields: { key: ColorKey; label: string }[] };
const PARTS: PartDef[] = [
  { title: "Header", description: "Top bar with the logo and navigation.", icon: <PanelTop className="size-4" />, selector: "header.sf-header", fields: [{ key: "header_bg", label: "Background" }, { key: "header_fg", label: "Text & links" }] },
  { title: "Hero", description: "The first section of the home page.", icon: <ImageIcon className="size-4" />, selector: ".sf-hero", fields: [{ key: "hero_bg", label: "Background" }] },
  { title: "Cards", description: "Services, projects and articles.", icon: <CreditCard className="size-4" />, selector: "main article", fields: [{ key: "card_bg", label: "Background" }] },
  { title: "Primary buttons", description: "“Start a project” and other main actions.", icon: <MousePointerClick className="size-4" />, selector: ".sf-btn-primary", fields: [{ key: "button_bg", label: "Button color" }, { key: "button_fg", label: "Button text" }] },
  { title: "Links", description: "Links in articles and card actions.", icon: <Link2 className="size-4" />, selector: "main .text-link", fields: [{ key: "link", label: "Link color" }] },
  { title: "Footer", description: "Bottom section with links and contact.", icon: <PanelBottom className="size-4" />, selector: "footer.sf-footer", fields: [{ key: "footer_bg", label: "Background" }, { key: "footer_fg", label: "Text & links" }] },
  { title: "WhatsApp button", description: "Floating chat shortcut.", icon: <Blend className="size-4" />, selector: ".sf-whatsapp", fields: [{ key: "whatsapp", label: "Accent" }] },
];

const FONT_ROLES: { role: FontRole; label: string; hint: string; script: "latin" | "arabic"; defaultKey: "sora" | "inter" | "ibm-plex-arabic" }[] = [
  { role: "arabic_heading", label: "Arabic headings", hint: "Titles on the Arabic site.", script: "arabic", defaultKey: "ibm-plex-arabic" },
  { role: "arabic_body", label: "Arabic body text", hint: "Paragraphs, menus and buttons on the Arabic site.", script: "arabic", defaultKey: "ibm-plex-arabic" },
  { role: "heading", label: "Headings (English & Turkish)", hint: "Titles and the logo. Arabic fonts work too — they include Latin letters.", script: "latin", defaultKey: "sora" },
  { role: "body", label: "Body text (English & Turkish)", hint: "Paragraphs, menus and buttons.", script: "latin", defaultKey: "inter" },
];

const SHAPE_RADIUS = { sharp: "0px", soft: "6px", rounded: "10px", round: "16px", pill: "999px" } as const;
const CORNER_RADIUS = { sharp: "0px", soft: "6px", rounded: "12px", round: "22px" } as const;

const REVEALS: { value: Appearance["motion"]["reveal"]; label: string; badge?: string }[] = [
  { value: "blur", label: "Blur & rise", badge: "New" },
  { value: "rise", label: "Rise" },
  { value: "zoom", label: "Zoom" },
  { value: "tilt", label: "3D tilt" },
  { value: "fade", label: "Fade" },
  { value: "none", label: "None" },
];

export function AppearanceEditor() {
  const [saved, setSaved] = useState<Appearance | null>(null);
  const [draft, setDraft] = useState<Appearance | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useFlash(5000);
  const [tab, setTab] = useState<Tab>("theme");
  const [mode, setMode] = useState<ThemeName>("dark");
  const [locale, setLocale] = useState<Locale>("ar");
  const [openFont, setOpenFont] = useState<FontRole | null>(null);
  const preview = useRef<PreviewHandle>(null);

  useEffect(() => {
    apiRequest<unknown>("admin/appearance/")
      .then((data) => {
        const config = normalizeAppearance(data);
        setSaved(config);
        setDraft(config);
      })
      .catch((err: unknown) => setLoadError(describeError(err)));
  }, []);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
  const css = useMemo(() => (draft ? appearanceCss(draft) : ""), [draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loadError) return <Notice kind="error">{loadError}</Notice>;
  if (!draft || !saved) return <Spinner />;

  const update = (patch: Partial<Appearance>) => setDraft({ ...draft, ...patch });
  const setColor = (key: ColorKey, value: string | null) =>
    update({ preset: "", colors: { ...draft.colors, [mode]: { ...draft.colors[mode], [key]: value } } });
  const eff = (key: ColorKey) => effectiveColor(draft, mode, key);

  async function save(config: Appearance) {
    setSaving(true);
    setFormError("");
    try {
      const result = normalizeAppearance(await apiRequest<unknown>("admin/appearance/", { method: "PUT", body: config }));
      setSaved(result);
      setDraft(result);
      setFlash("Appearance saved. Visitors see the new look within about a minute.");
    } catch (err) {
      setFormError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  const pickFont = (role: FontRole, value: Appearance["fonts"][FontRole]) => {
    update({ fonts: { ...draft.fonts, [role]: value } });
    const arabic = role.startsWith("arabic");
    if (arabic && locale !== "ar") setLocale("ar");
    if (!arabic && locale === "ar") setLocale("en");
  };

  const failing = CONTRAST_CHECKS.filter((c) => contrastRatio(eff(c.fg), eff(c.bg)) < c.min).length;

  return (
    <div className="pb-4">
      {/* Title + actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            Appearance
            {dirty ? <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Unsaved changes</span> : null}
          </h1>
          <p className="mt-1.5 text-sm text-muted">Colors, fonts, shapes and motion of the public website. Changes show live in the preview; nothing is public until you save.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ConfirmButton
            variant="secondary"
            className="text-muted hover:text-fg"
            title="Restore the original design?"
            message="All colors, fonts, shapes and motion return to the built-in Shamflare design. It is only published when you save."
            confirmLabel="Restore defaults"
            onConfirm={() => setDraft({ ...defaultAppearance() })}
          >
            Restore defaults
          </ConfirmButton>
          <Button variant="secondary" size="sm" disabled={!dirty || saving} onClick={() => setDraft(saved)}>
            <Undo2 className="size-4" aria-hidden /> Discard
          </Button>
          <Button size="sm" disabled={!dirty || saving} onClick={() => save(draft)}>
            {saving ? "Saving…" : "Save & publish"}
          </Button>
        </div>
      </div>
      <div className="mb-5 space-y-3 empty:hidden" aria-live="polite">
        {formError ? <Notice kind="error">{formError}</Notice> : null}
        {flash ? <Notice kind="success">{flash}</Notice> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* Preview first on small screens, sticky on the right on large ones */}
        <div className="h-[34rem] xl:sticky xl:top-6 xl:order-2 xl:h-[calc(100dvh-3rem)]">
          <LivePreview ref={preview} css={css} theme={mode} onThemeChange={setMode} locale={locale} onLocaleChange={setLocale} />
        </div>

        <div className="min-w-0 xl:order-1">
          {/* Tabs */}
          <div role="tablist" aria-label="Appearance sections" className="sticky top-14 z-20 -mx-1 mb-4 grid grid-cols-5 gap-1 rounded-[var(--radius-lg)] border border-line bg-surface/95 p-1 backdrop-blur lg:top-2">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[var(--radius-md)] py-2 text-[0.7rem] font-medium transition-colors",
                  tab === key ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {(tab === "theme" || tab === "parts") && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-bg px-3 py-2">
              <p className="text-xs text-muted">
                Editing colors for <strong className="text-fg">{mode === "dark" ? "dark" : "light"} mode</strong>
              </p>
              <Segmented
                label="Color mode being edited"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
              />
            </div>
          )}

          <div className="space-y-4">
            {tab === "theme" && (
              <>
                <Group title="Ready-made themes" description="A complete palette for dark and light mode, plus a matching button style." icon={<Palette className="size-4" />}>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((preset) => (
                      <PresetCard key={preset.key} preset={preset} mode={mode} active={draft.preset === preset.key} onPick={() => setDraft(applyPreset(draft, preset))} />
                    ))}
                  </div>
                </Group>
                <Group title="Brand palette" description="Fine-tune any color. Dashed swatches follow the default." icon={<SwatchBook className="size-4" />}>
                  {PALETTE_FIELDS.map((f) => (
                    <ColorField key={f.key} label={f.label} hint={f.hint} value={draft.colors[mode][f.key]} effective={eff(f.key)} onChange={(v) => setColor(f.key, v)} />
                  ))}
                </Group>
                <ContrastPanel draft={draft} mode={mode} failing={failing} />
              </>
            )}

            {tab === "parts" && (
              <>
                <p className="px-1 text-xs leading-relaxed text-subtle">
                  Give individual parts of the site their own colors. Use <span className="text-fg">⌖</span> to find the part in the preview.
                </p>
                {PARTS.map((part) => (
                  <Group key={part.title} title={part.title} description={part.description} icon={part.icon}>
                    {part.fields.map((f) => (
                      <ColorField
                        key={f.key}
                        label={f.label}
                        value={draft.colors[mode][f.key]}
                        effective={eff(f.key)}
                        onChange={(v) => setColor(f.key, v)}
                        onLocate={part.selector ? () => preview.current?.locate(part.selector!) : undefined}
                      />
                    ))}
                  </Group>
                ))}
                <ContrastPanel draft={draft} mode={mode} failing={failing} />
              </>
            )}

            {tab === "type" && (
              <>
                <Group title="Typefaces" description="Each language gets fonts designed for its script. The preview switches language to match." icon={<Type className="size-4" />}>
                  {FONT_ROLES.map((r) => (
                    <FontPicker
                      key={r.role}
                      label={r.label}
                      hint={r.hint}
                      script={r.script}
                      defaultKey={r.defaultKey}
                      value={draft.fonts[r.role]}
                      open={openFont === r.role}
                      onToggle={() => setOpenFont(openFont === r.role ? null : r.role)}
                      onChange={(v) => pickFont(r.role, v)}
                    />
                  ))}
                </Group>
                <Group title="Text size" description="Scales text across the site; spacing stays the same." icon={<Baseline className="size-4" />}>
                  <Slider label="Body text" value={draft.text.body_scale} min={BODY_SCALE[0]} max={BODY_SCALE[1]} step={0.025} onChange={(v) => update({ text: { ...draft.text, body_scale: v } })} />
                  <Slider label="Headings" value={draft.text.heading_scale} min={HEADING_SCALE[0]} max={HEADING_SCALE[1]} step={0.025} onChange={(v) => update({ text: { ...draft.text, heading_scale: v } })} />
                  <div>
                    <p className="mb-2 text-sm font-medium text-fg">Heading weight</p>
                    <Segmented
                      label="Heading weight"
                      value={draft.text.heading_weight}
                      onChange={(v) => update({ text: { ...draft.text, heading_weight: v } })}
                      options={([400, 500, 600, 700, 800] as const).map((w) => ({ value: w, label: <span style={{ fontWeight: w }}>Aa</span>, title: String(w) }))}
                    />
                  </div>
                </Group>
              </>
            )}

            {tab === "shapes" && (
              <>
                <Group title="Button shape" icon={<MousePointerClick className="size-4" />}>
                  <TileGroup
                    label="Button shape"
                    columns={5}
                    value={draft.buttons.shape}
                    onChange={(shape) => update({ buttons: { ...draft.buttons, shape } })}
                    options={(Object.keys(SHAPE_RADIUS) as (keyof typeof SHAPE_RADIUS)[]).map((shape) => ({
                      value: shape,
                      label: shape[0].toUpperCase() + shape.slice(1),
                      preview: <span className="h-6 w-12 bg-accent" style={{ borderRadius: SHAPE_RADIUS[shape] }} />,
                    }))}
                  />
                </Group>
                <Group title="Button style" description="How primary buttons are filled." icon={<Blend className="size-4" />}>
                  <TileGroup
                    label="Button style"
                    columns={2}
                    value={draft.buttons.style}
                    onChange={(style) => update({ buttons: { ...draft.buttons, style } })}
                    options={(["solid", "gradient", "outline", "soft"] as const).map((style) => ({
                      value: style,
                      label: style[0].toUpperCase() + style.slice(1),
                      preview: <ButtonSample draft={draft} mode={mode} style={style} />,
                    }))}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-fg">Size</p>
                      <Segmented
                        label="Button size"
                        value={draft.buttons.size}
                        onChange={(size) => update({ buttons: { ...draft.buttons, size } })}
                        options={[
                          { value: "compact", label: "S" , title: "Compact" },
                          { value: "regular", label: "M", title: "Regular" },
                          { value: "large", label: "L", title: "Large" },
                        ]}
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-fg">Label weight</p>
                      <Segmented
                        label="Button label weight"
                        value={draft.buttons.weight}
                        onChange={(weight) => update({ buttons: { ...draft.buttons, weight } })}
                        options={([500, 600, 700] as const).map((w) => ({ value: w, label: <span style={{ fontWeight: w }}>Aa</span>, title: String(w) }))}
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-bg px-3 py-2.5">
                    <span>
                      <span className="block text-sm font-medium text-fg">Glow on hover</span>
                      <span className="block text-xs text-subtle">A soft halo in the brand color.</span>
                    </span>
                    <input type="checkbox" className="sf-switch" checked={draft.buttons.glow} onChange={(e) => update({ buttons: { ...draft.buttons, glow: e.target.checked } })} />
                  </label>
                </Group>
                <Group title="Corners" description="Roundness of cards, panels, inputs and images." icon={<CreditCard className="size-4" />}>
                  <TileGroup
                    label="Corner style"
                    columns={4}
                    value={draft.cards.corners}
                    onChange={(corners) => update({ cards: { corners } })}
                    options={(Object.keys(CORNER_RADIUS) as (keyof typeof CORNER_RADIUS)[]).map((c) => ({
                      value: c,
                      label: c[0].toUpperCase() + c.slice(1),
                      preview: (
                        <span className="flex h-12 w-14 flex-col gap-1 border border-line-strong bg-surface-2 p-1.5" style={{ borderRadius: CORNER_RADIUS[c] }}>
                          <span className="h-1.5 w-8 rounded-full bg-accent" />
                          <span className="h-1 w-10 rounded-full bg-line-strong" />
                          <span className="h-1 w-6 rounded-full bg-line-strong" />
                        </span>
                      ),
                    }))}
                  />
                </Group>
              </>
            )}

            {tab === "motion" && (
              <>
                <Group
                  title="Scroll reveal"
                  description="How sections and cards appear as visitors scroll down. Card grids enter one after another, column by column."
                  icon={<Sparkles className="size-4" />}
                  actions={
                    <Button variant="secondary" size="sm" onClick={() => preview.current?.replayMotion()}>
                      Replay
                    </Button>
                  }
                >
                  <TileGroup
                    label="Reveal style"
                    columns={3}
                    value={draft.motion.reveal}
                    onChange={(reveal) => update({ motion: { ...draft.motion, reveal } })}
                    options={REVEALS.map((r) => ({ value: r.value, label: r.label, badge: r.badge, preview: <MotionSample kind={r.value} /> }))}
                  />
                  <div>
                    <p className="mb-2 text-sm font-medium text-fg">Pace</p>
                    <Segmented
                      label="Reveal pace"
                      value={draft.motion.speed}
                      onChange={(speed) => update({ motion: { ...draft.motion, speed } })}
                      options={[
                        { value: "gentle", label: "Slow motion" },
                        { value: "normal", label: "Normal" },
                        { value: "brisk", label: "Brisk" },
                      ]}
                    />
                    <p className="mt-2 text-xs leading-relaxed text-subtle">
                      Elements stay hidden until they scroll into view, then make their entrance once. Visitors who ask their system for reduced motion always see everything immediately.
                    </p>
                  </div>
                </Group>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PresetCard({ preset, mode, active, onPick }: { preset: Preset; mode: ThemeName; active: boolean; onPick: () => void }) {
  const look = applyPreset(defaultAppearance(), preset);
  const c = (key: ColorKey) => effectiveColor(look, mode, key);
  const radius = SHAPE_RADIUS[look.buttons.shape];
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cn(
        "group/preset overflow-hidden rounded-[var(--radius-md)] border text-start transition-[border-color,transform] hover:-translate-y-0.5",
        active ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-line-strong",
      )}
    >
      <span className="relative block h-20 p-2.5" style={{ background: c("bg") }}>
        <span className="absolute -top-6 -right-6 size-20 rounded-full opacity-40 blur-xl" style={{ background: c("accent_3") }} aria-hidden />
        <span className="relative block h-1.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${c("accent")}, ${c("accent_2")}, ${c("accent_3")})` }} />
        <span className="relative mt-1.5 block h-1 w-16 rounded-full opacity-60" style={{ background: c("muted") }} />
        <span className="relative mt-2.5 flex gap-1.5">
          <span
            className="h-4 w-11"
            style={{
              borderRadius: radius,
              background: look.buttons.style === "gradient" ? `linear-gradient(110deg, ${c("accent")}, ${c("accent_2")}, ${c("accent_3")})` : c("accent"),
            }}
          />
          <span className="h-4 w-8 border" style={{ borderRadius: radius, borderColor: c("muted"), opacity: 0.5 }} />
        </span>
        <span className="absolute end-2.5 bottom-2.5 h-8 w-10 rounded-[4px]" style={{ background: c("surface"), boxShadow: `0 0 0 1px ${c("muted")}33` }} />
      </span>
      <span className="block border-t border-line bg-bg px-2.5 py-2">
        <span className="flex items-center justify-between text-xs font-semibold text-fg">
          {preset.name}
          {active ? <span className="size-1.5 rounded-full bg-accent" /> : null}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[0.68rem] leading-snug text-subtle">{preset.description}</span>
      </span>
    </button>
  );
}

function ButtonSample({ draft, mode, style }: { draft: Appearance; mode: ThemeName; style: Appearance["buttons"]["style"] }) {
  const btn = effectiveColor(draft, mode, "button_bg");
  const fg = effectiveColor(draft, mode, "button_fg");
  const a2 = effectiveColor(draft, mode, "accent_2");
  const a3 = effectiveColor(draft, mode, "accent_3");
  const bg = effectiveColor(draft, mode, "bg");
  const styles = {
    solid: { background: btn, color: fg, border: `1px solid transparent` },
    gradient: { background: `linear-gradient(110deg, ${btn}, ${a2} 60%, ${a3})`, color: fg, border: `1px solid transparent` },
    outline: { background: "transparent", color: btn, border: `1px solid ${btn}` },
    soft: { background: `color-mix(in srgb, ${btn} 16%, transparent)`, color: btn, border: `1px solid color-mix(in srgb, ${btn} 30%, transparent)` },
  }[style];
  return (
    <span className="grid h-full w-full place-items-center rounded-[var(--radius-sm)]" style={{ background: bg }}>
      <span className="px-3 py-1.5 text-[0.7rem]" style={{ ...styles, borderRadius: SHAPE_RADIUS[draft.buttons.shape], fontWeight: draft.buttons.weight }}>
        Start a project
      </span>
    </span>
  );
}

function MotionSample({ kind }: { kind: Appearance["motion"]["reveal"] }) {
  return (
    <span className="flex h-full w-full items-end justify-center gap-1 overflow-hidden" data-motion={kind} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="sf-motion-sample h-9 w-5 rounded-[3px] border border-line-strong bg-surface-2" style={{ animationDelay: `${i * 140}ms` }}>
          <span className="m-1 block h-1 rounded-full bg-accent" />
        </span>
      ))}
    </span>
  );
}

function ContrastPanel({ draft, mode, failing }: { draft: Appearance; mode: ThemeName; failing: number }) {
  return (
    <Group
      title="Readability check"
      description={failing ? `${failing} combination${failing > 1 ? "s are" : " is"} hard to read in ${mode} mode.` : `All text is easy to read in ${mode} mode.`}
      icon={failing ? <CircleAlert className="size-4 text-warning" /> : <Contrast className="size-4" />}
    >
      <ul className="grid gap-1.5">
        {CONTRAST_CHECKS.map((check) => {
          const fg = effectiveColor(draft, mode, check.fg);
          const bg = effectiveColor(draft, mode, check.bg);
          const ratio = contrastRatio(fg, bg);
          const ok = ratio >= check.min;
          return (
            <li key={check.label} className="flex items-center gap-3 text-xs">
              <span className="grid h-6 w-9 shrink-0 place-items-center rounded-[4px] font-semibold" style={{ background: bg, color: fg, boxShadow: "inset 0 0 0 1px rgb(127 127 127 / 0.25)" }}>
                Aa
              </span>
              <span className="flex-1 text-muted">{check.label}</span>
              <span className="font-mono text-fg">{ratio.toFixed(1)}:1</span>
              <span className={cn("w-12 rounded-full border px-1.5 text-center text-[0.65rem] font-semibold", ok ? "border-success/40 text-success" : "border-warning/50 text-warning")}>
                {ok ? (ratio >= 7 ? "AAA" : "AA") : "Low"}
              </span>
            </li>
          );
        })}
      </ul>
    </Group>
  );
}
