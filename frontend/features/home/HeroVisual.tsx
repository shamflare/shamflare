import type { CSSProperties } from "react";
import { CircleCheck, Rocket } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TiltStage } from "./TiltStage";

/** Depth of a layer in the 3D scene, plus its optional entrance delay. */
const depth = (z: number, delay?: string) => ({ "--z": `${z}px`, ...(delay ? { "--enter-delay": delay } : {}) }) as CSSProperties;

/**
 * Hero illustration: one product definition (the editor) flowing into web,
 * mobile and desktop surfaces. Pure HTML/CSS/SVG — no images to download.
 * It is decorative but labelled, and always laid out left-to-right because it
 * depicts code. On desktop it tilts in 3D toward the pointer (TiltStage), each
 * layer at its own depth.
 */
export async function HeroVisual() {
  const t = await getTranslations("Hero");

  return (
    <figure
      role="img"
      aria-label={t("visualLabel")}
      dir="ltr"
      className="relative mx-auto aspect-[10/9] w-full max-w-[34rem] select-none lg:max-w-none"
    >
      <TiltStage className="absolute inset-0">
        {/* Glow */}
        <div aria-hidden className="sf-depth absolute inset-[12%] rounded-full bg-accent-2/15 blur-3xl" style={depth(-90)} />

        {/* Connectors */}
        <svg aria-hidden viewBox="0 0 500 450" className="sf-depth absolute inset-0 size-full" fill="none" style={depth(42)}>
          <defs>
            <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#67E8F9" stopOpacity="0.9" />
              <stop offset="1" stopColor="#A78BFA" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {[
            "M380 150 C 405 150, 412 128, 412 100",
            "M215 290 C 200 335, 140 345, 92 345",
            "M285 290 C 300 340, 300 372, 312 376",
          ].map((d) => (
            <g key={d}>
              <path d={d} stroke="var(--color-line-strong)" strokeWidth="1.5" />
              <path d={d} stroke="url(#hero-line)" strokeWidth="1.5" strokeDasharray="6 114" strokeLinecap="round" className="flow-line" />
            </g>
          ))}
        </svg>

        {/* Editor */}
        <div
          className="sf-depth sf-tilt-shadow enter absolute top-[24%] left-[20%] w-[56%] overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-bg-deep/95"
          style={depth(48, "120ms")}
        >
          <div aria-hidden className="sf-glare pointer-events-none absolute inset-0 z-10" />
          <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
            <span className="size-2 rounded-full bg-[#fda4af]/70" />
            <span className="size-2 rounded-full bg-[#fcd34d]/70" />
            <span className="size-2 rounded-full bg-[#6ee7b7]/70" />
            <span className="ms-2 font-mono text-[0.6rem] text-subtle sm:text-[0.65rem]">product.config.ts</span>
          </div>
          <pre className="overflow-hidden px-3 py-3 font-mono text-[0.55rem] leading-[1.7] text-muted sm:px-4 sm:text-[0.7rem]">
            <code>
              <span className="text-accent-3">export const</span> <span className="text-fg">product</span> = {"{"}
              {"\n"}
              {"  "}platforms: [<span className="text-success">&quot;web&quot;</span>, <span className="text-success">&quot;mobile&quot;</span>,{" "}
              <span className="text-success">&quot;desktop&quot;</span>],
              {"\n"}
              {"  "}quality: {"{"} tests: <span className="text-accent-2">true</span>, a11y: <span className="text-success">&quot;AA&quot;</span> {"}"},
              {"\n"}
              {"  "}security: <span className="text-success">&quot;by-default&quot;</span>,
              {"\n"}
              {"  "}support: <span className="text-accent-2">true</span>,
              {"\n"}
              {"}"}
            </code>
          </pre>
          <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[0.6rem] sm:text-[0.7rem]">
            <span className="inline-flex items-center gap-1.5 text-success">
              <CircleCheck className="size-3.5" aria-hidden />
              {t("visualStatus")}
            </span>
            <span className="font-mono text-subtle">main · 4f2c9a1</span>
          </div>
        </div>

        {/* Web: browser window */}
        <div
          className="sf-depth enter absolute top-0 right-0 w-[32%] overflow-hidden rounded-[var(--radius-md)] border border-line-strong bg-surface shadow-[var(--shadow-card)]"
          style={depth(64, "260ms")}
        >
          <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
            <span className="size-1.5 rounded-full bg-line-strong" />
            <span className="size-1.5 rounded-full bg-line-strong" />
            <span className="ms-1 h-2.5 flex-1 rounded-full bg-bg/80" />
          </div>
          <div className="space-y-1.5 p-2.5">
            <div className="h-2 w-3/4 rounded bg-fg/80" />
            <div className="h-1.5 w-full rounded bg-muted/30" />
            <div className="h-1.5 w-5/6 rounded bg-muted/30" />
            <div className="mt-2 h-3.5 w-1/2 rounded bg-accent/80" />
          </div>
          <p className="border-t border-line px-2.5 py-1 font-mono text-[0.55rem] tracking-wider text-subtle uppercase sm:text-[0.6rem]">
            {t("visualWeb")}
          </p>
        </div>

        {/* Mobile: phone */}
        <div
          className="sf-depth enter absolute bottom-0 left-0 w-[18%] rounded-[1.1rem] border border-line-strong bg-surface p-1.5 shadow-[var(--shadow-card)]"
          style={depth(72, "380ms")}
        >
          <div className="aspect-[9/17] space-y-1.5 overflow-hidden rounded-[0.8rem] bg-bg-deep p-2">
            <div className="mx-auto h-1 w-1/3 rounded-full bg-line-strong" />
            <div className="mt-2 h-8 rounded-md bg-gradient-to-br from-accent-2/50 to-accent-3/40" />
            <div className="h-1.5 w-4/5 rounded bg-muted/35" />
            <div className="h-1.5 w-3/5 rounded bg-muted/35" />
            <div className="grid grid-cols-2 gap-1 pt-1">
              <div className="h-5 rounded bg-surface-3" />
              <div className="h-5 rounded bg-surface-3" />
            </div>
          </div>
          <p className="pt-1 text-center font-mono text-[0.5rem] tracking-wider text-subtle uppercase sm:text-[0.55rem]">
            {t("visualMobile")}
          </p>
        </div>

        {/* Desktop: monitor on a stand */}
        <div className="sf-depth enter absolute right-0 bottom-0 w-[38%]" style={depth(60, "500ms")}>
          {/* Bezel */}
          <div className="rounded-[var(--radius-md)] border border-line-strong bg-surface p-1 pb-0 shadow-[var(--shadow-card)]">
            {/* Screen */}
            <div className="relative overflow-hidden rounded-[calc(var(--radius-md)-4px)] border border-line bg-bg-deep">
              <div className="flex">
                <div className="w-1/4 space-y-1.5 border-e border-line bg-bg/60 p-2">
                  <div className="h-1.5 rounded bg-accent/70" />
                  <div className="h-1.5 rounded bg-muted/30" />
                  <div className="h-1.5 rounded bg-muted/30" />
                </div>
                <div className="flex-1 space-y-1.5 p-2">
                  <div className="flex items-end gap-1">
                    {[40, 65, 50, 85, 70].map((h) => (
                      <span key={h} className="w-full rounded-sm bg-accent-2/60" style={{ height: `${h * 0.28}px` }} />
                    ))}
                  </div>
                  <div className="h-1.5 w-2/3 rounded bg-muted/30" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-2 py-0.5">
                <p className="font-mono text-[0.5rem] tracking-wider text-subtle uppercase sm:text-[0.55rem]">{t("visualDesktop")}</p>
                <span className="inline-flex items-center gap-1 text-[0.5rem] text-accent sm:text-[0.55rem]">
                  <Rocket className="size-2.5" aria-hidden />
                  {t("visualDeploy")}
                </span>
              </div>
              {/* Glare */}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
            </div>
            {/* Chin with power light */}
            <div className="flex h-2 items-center justify-center">
              <span className="size-[3px] rounded-full bg-accent/80 shadow-[0_0_4px_var(--color-accent)]" />
            </div>
          </div>
          {/* Neck and base */}
          <div aria-hidden className="mx-auto h-2 w-[14%] bg-gradient-to-b from-line-strong to-surface" />
          <div aria-hidden className="mx-auto h-1 w-[38%] rounded-full border border-line-strong bg-surface" />
        </div>

        {/* Flare node */}
        <span aria-hidden className="sf-depth absolute top-[63%] left-[46%] grid size-4 place-items-center" style={depth(50)}>
          <span className="pulse-dot absolute size-4 rounded-full bg-accent/40 blur-[3px]" />
          <span className="size-1.5 rounded-full bg-accent" />
        </span>
      </TiltStage>
    </figure>
  );
}
