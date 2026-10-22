"use client";

import { Check, Crosshair, RotateCcw } from "lucide-react";
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FONTS, isHexColor, type FontKey } from "@/lib/appearance";

/** Card-style group of related controls. */
export function Group({ title, description, icon, actions, children }: { title: string; description?: ReactNode; icon?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface">
      <header className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          {icon ? <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-surface-2 text-accent">{icon}</span> : null}
          <div>
            <h3 className="text-sm font-semibold text-fg">{title}</h3>
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-subtle">{description}</p> : null}
          </div>
        </div>
        {actions}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/**
 * A color override. Empty means "follow the default", shown as a dashed swatch
 * of the color it currently resolves to.
 */
export function ColorField({
  label,
  hint,
  value,
  effective,
  onChange,
  onLocate,
}: {
  label: string;
  hint?: string;
  value: string | null;
  effective: string;
  onChange: (value: string | null) => void;
  onLocate?: () => void;
}) {
  const id = useId();
  const [text, setText] = useState(value ?? "");
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value ?? "");
  }

  const commit = (raw: string) => {
    const v = raw.trim().replace(/^([0-9a-f]{6})$/i, "#$1");
    if (v === "") onChange(null);
    else if (isHexColor(v)) onChange(v.toLowerCase());
  };

  return (
    <div className="group/color flex items-center gap-3">
      <label
        className={cn(
          "relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-md)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)] transition-transform hover:scale-105",
          !value && "outline-2 -outline-offset-2 outline-line-strong outline-dashed",
        )}
        style={{ background: effective }}
        title={value ? `Pick ${label.toLowerCase()}` : `Following the default (${effective}) — click to override`}
      >
        <input
          type="color"
          value={isHexColor(effective) ? effective : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block truncate text-sm font-medium text-fg">
          {label}
        </label>
        {hint ? <p className="truncate text-xs text-subtle">{hint}</p> : null}
      </div>
      <input
        id={id}
        dir="ltr"
        spellCheck={false}
        placeholder={effective}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (isHexColor(e.target.value.trim())) commit(e.target.value);
        }}
        onBlur={() => {
          commit(text);
          setText(value ?? "");
        }}
        className="w-[5.75rem] rounded-[var(--radius-sm)] border border-line bg-bg px-2 py-1.5 font-mono text-xs text-fg uppercase outline-none placeholder:text-subtle placeholder:normal-case focus:border-accent/70"
        aria-label={`${label} hex value`}
      />
      <div className="flex w-14 justify-end gap-0.5">
        {onLocate ? (
          <IconButton label={`Show ${label.toLowerCase()} in the preview`} onClick={onLocate}>
            <Crosshair className="size-3.5" />
          </IconButton>
        ) : null}
        {value ? (
          <IconButton label={`Reset ${label.toLowerCase()} to default`} onClick={() => onChange(null)}>
            <RotateCcw className="size-3.5" />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}

export function IconButton({ label, onClick, children, active }: { label: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-7 place-items-center rounded-[var(--radius-sm)] text-subtle transition-colors hover:bg-surface-2 hover:text-fg",
        active && "bg-surface-2 text-fg",
      )}
    >
      {children}
    </button>
  );
}

/** Row of mutually exclusive options (radio group semantics). */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex rounded-[var(--radius-md)] border border-line bg-bg p-0.5", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              active ? "bg-surface-3 text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Grid of visual option tiles (radio group semantics). */
export function TileGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 3,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; preview: ReactNode; badge?: string }[];
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4 | 5;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("grid gap-2", { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" }[columns])}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "group/tile relative flex flex-col items-center gap-2 rounded-[var(--radius-md)] border bg-bg p-2.5 pb-2 text-xs transition-[border-color,background-color]",
              active ? "border-accent/70 bg-accent/5 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {active ? (
              <span className="absolute top-1.5 end-1.5 grid size-4 place-items-center rounded-full bg-accent text-on-accent">
                <Check className="size-2.5" strokeWidth={3} aria-hidden />
              </span>
            ) : null}
            {option.badge ? (
              <span className="absolute top-1.5 start-1.5 rounded-full bg-accent-3/15 px-1.5 text-[0.6rem] font-semibold text-accent-3">{option.badge}</span>
            ) : null}
            <span className="grid h-14 w-full place-items-center">{option.preview}</span>
            <span className="font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => `${Math.round(v * 100)}%`,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        <span className="flex items-center gap-1">
          <span className="rounded-[var(--radius-sm)] bg-bg px-1.5 py-0.5 font-mono text-xs text-accent">{format(value)}</span>
          {value !== 1 ? (
            <IconButton label={`Reset ${label.toLowerCase()}`} onClick={() => onChange(1)}>
              <RotateCcw className="size-3" />
            </IconButton>
          ) : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sf-range w-full"
        style={{ "--pct": `${pct}%` } as CSSProperties}
      />
    </div>
  );
}

const SAMPLE = {
  latin: "Turning ideas into digital products",
  arabic: "نحوّل الأفكار إلى منتجات رقمية",
};

/** Font chooser for one role: current choice plus an expandable grid of live samples. */
export function FontPicker({
  label,
  hint,
  value,
  defaultKey,
  script,
  open,
  onToggle,
  onChange,
}: {
  label: string;
  hint: string;
  value: FontKey | null;
  defaultKey: FontKey;
  script: "latin" | "arabic";
  open: boolean;
  onToggle: () => void;
  onChange: (value: FontKey | null) => void;
}) {
  const current = FONTS.find((f) => f.key === (value ?? defaultKey))!;
  const options = FONTS.filter((f) => (script === "arabic" ? f.script === "arabic" : true));
  const sample = SAMPLE[script];
  const dir = script === "arabic" ? "rtl" : "ltr";
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    document.getElementById(listId)?.querySelector<HTMLElement>("[aria-checked=true]")?.scrollIntoView({ block: "nearest" });
  }, [open, listId]);

  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-bg">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={listId} className="flex w-full items-center gap-3 p-3 text-start">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs text-subtle">
            {label}
            {!value ? <span className="rounded-full border border-line px-1.5 text-[0.6rem]">default</span> : null}
          </span>
          <span className="mt-1 block truncate text-lg text-fg" dir={dir} style={{ fontFamily: `var(--ff-${current.key})` }}>
            {sample}
          </span>
        </span>
        <span className="shrink-0 rounded-[var(--radius-sm)] border border-line-strong px-2 py-1 text-xs text-muted">{current.label.split(" · ")[0]}</span>
      </button>
      {open ? (
        <div id={listId} role="radiogroup" aria-label={label} className="grid max-h-80 gap-1.5 overflow-y-auto border-t border-line p-2 sm:grid-cols-2">
          <p className="px-1 pb-1 text-xs text-subtle sm:col-span-2">{hint}</p>
          {options.map((font) => {
            const active = font.key === (value ?? defaultKey);
            return (
              <button
                key={font.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(font.key === defaultKey ? null : font.key)}
                className={cn(
                  "rounded-[var(--radius-sm)] border p-2.5 text-start transition-colors",
                  active ? "border-accent/70 bg-accent/5" : "border-line hover:border-line-strong hover:bg-surface",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-[0.7rem] text-subtle">
                  <span className="truncate">{font.label}</span>
                  {"note" in font && font.note ? <span className="shrink-0 text-accent-3">{font.note}</span> : null}
                </span>
                <span className="mt-1 block truncate text-[1.05rem] leading-snug text-fg" dir={dir} style={{ fontFamily: `var(--ff-${font.key})` }}>
                  {sample}
                </span>
                {script === "latin" && !font.turkish ? <span className="mt-0.5 block text-[0.65rem] text-warning">No Turkish letters (ğ ş ı) — falls back</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
