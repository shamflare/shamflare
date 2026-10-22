"use client";

import { ExternalLink, Monitor, Moon, Play, RefreshCw, Smartphone, Sun, Tablet } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ThemeName } from "@/lib/appearance";
import { locales, type Locale } from "@/i18n/routing";
import { IconButton, Segmented } from "./controls";

const PAGES = [
  { path: "", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/blog", label: "Blog" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
] as const;

const DEVICES = {
  desktop: { width: 1280, icon: Monitor, label: "Desktop" },
  tablet: { width: 820, icon: Tablet, label: "Tablet" },
  mobile: { width: 390, icon: Smartphone, label: "Mobile" },
} as const;
type Device = keyof typeof DEVICES;

const DRAFT_STYLE_ID = "sf-appearance-draft";
const HIGHLIGHT_STYLE_ID = "sf-appearance-highlight";

export type PreviewHandle = {
  /** Scrolls the preview to the first element matching `selector` and flashes an outline around it. */
  locate: (selector: string) => void;
  /** Scrolls back to the top and glides down so scroll reveals play again. */
  replayMotion: () => void;
};

type Props = {
  css: string;
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

/**
 * The real public site in a same-origin iframe. The unsaved draft is injected as
 * a <style> into the framed document (and the published appearance stylesheet
 * is switched off there), so every change shows instantly without saving.
 */
export const LivePreview = forwardRef<PreviewHandle, Props>(function LivePreview({ css, theme, onThemeChange, locale, onLocaleChange }, ref) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<string>("");
  const [device, setDevice] = useState<Device>("desktop");
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentPath, setCurrentPath] = useState("");

  const src = `/${locale}${page}`;

  const doc = () => {
    try {
      return frameRef.current?.contentDocument ?? null;
    } catch {
      return null;
    }
  };

  // Apply draft CSS + theme to the framed page.
  const apply = useCallback(() => {
    const d = doc();
    if (!d?.head) return;
    d.querySelectorAll<HTMLStyleElement>('style[data-href^="sf-appearance-"]').forEach((el) => {
      el.media = "not all"; // the published look; the draft replaces it
    });
    let style = d.getElementById(DRAFT_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = d.createElement("style");
      style.id = DRAFT_STYLE_ID;
    }
    style.textContent = css;
    d.head.appendChild(style); // (re)append so it stays last
    d.documentElement.dataset.theme = theme;
  }, [css, theme]);

  useEffect(apply, [apply]);

  // Scale the device-width page down to the available space.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBox({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const frameWidth = DEVICES[device].width;
  const scale = box.width ? Math.min(1, box.width / frameWidth) : 1;
  const frameHeight = box.height ? box.height / scale : 800;

  const onLoad = () => {
    setLoading(false);
    apply();
    const d = doc();
    if (!d) return;
    setCurrentPath(frameRef.current?.contentWindow?.location.pathname ?? "");
    // Track client-side navigation inside the frame (links, language switcher).
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    const sync = () => {
      setCurrentPath(win.location.pathname);
      // A locale change re-renders <html>, dropping data-theme and the draft style.
      requestAnimationFrame(apply);
    };
    win.addEventListener("popstate", sync);
    const observer = new MutationObserver(() => {
      if (win.location.pathname !== currentPathRef.current) sync();
      if (!d.getElementById(DRAFT_STYLE_ID) || d.documentElement.dataset.theme !== themeRef.current) apply();
    });
    observer.observe(d.documentElement, { attributes: true, attributeFilter: ["data-theme", "lang"], childList: true });
    observer.observe(d.head, { childList: true });
  };

  const currentPathRef = useRef(currentPath);
  const themeRef = useRef(theme);
  useEffect(() => {
    currentPathRef.current = currentPath;
    themeRef.current = theme;
  });

  const replayMotion = () => {
    const win = frameRef.current?.contentWindow;
    const d = doc();
    if (!win || !d) return;
    win.scrollTo({ top: 0 });
    win.dispatchEvent(new Event("sf:reveal-reset")); // hide everything again (RevealObserver)
    const end = Math.min(d.documentElement.scrollHeight - win.innerHeight, win.innerHeight * 3.2);
    const start = performance.now();
    const duration = 6500;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      win.scrollTo({ top: end * eased });
      if (t < 1) win.requestAnimationFrame(step);
    };
    win.requestAnimationFrame(step);
  };

  useImperativeHandle(ref, () => ({
    replayMotion,
    locate(selector) {
      const d = doc();
      const target = d?.querySelector<HTMLElement>(selector);
      if (!d || !target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      let flash = d.getElementById(HIGHLIGHT_STYLE_ID);
      if (!flash) {
        flash = d.createElement("style");
        flash.id = HIGHLIGHT_STYLE_ID;
        d.head.appendChild(flash);
      }
      d.querySelectorAll("[data-sf-locate]").forEach((el) => el.removeAttribute("data-sf-locate"));
      target.setAttribute("data-sf-locate", "");
      flash.textContent =
        "@keyframes sf-locate{0%,100%{outline-color:transparent}20%,60%{outline-color:#f472b6}}" +
        "[data-sf-locate]{outline:3px solid transparent;outline-offset:4px;animation:sf-locate 1.6s ease 2}";
    },
  }));

  const shownPath = currentPath || src;

  return (
    <div className="flex h-full min-h-[32rem] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bg-deep shadow-[var(--shadow-float)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2.5">
        <select
          aria-label="Preview page"
          value={page}
          onChange={(e) => {
            setPage(e.target.value);
            setLoading(true);
          }}
          className="rounded-[var(--radius-md)] border border-line bg-bg px-2.5 py-1.5 text-xs font-medium text-fg outline-none focus:border-accent/70"
        >
          {PAGES.map((p) => (
            <option key={p.path} value={p.path}>
              {p.label}
            </option>
          ))}
        </select>
        <Segmented
          label="Preview language"
          value={locale}
          onChange={(l) => {
            onLocaleChange(l);
            setLoading(true);
          }}
          options={locales.map((l) => ({ value: l, label: <span className="uppercase">{l}</span> }))}
        />
        <Segmented
          label="Color mode"
          value={theme}
          onChange={onThemeChange}
          options={[
            { value: "dark", label: <Moon className="size-3.5" aria-label="Dark" />, title: "Dark mode" },
            { value: "light", label: <Sun className="size-3.5" aria-label="Light" />, title: "Light mode" },
          ]}
        />
        <Segmented
          label="Device"
          value={device}
          onChange={setDevice}
          className="max-sm:hidden"
          options={(Object.keys(DEVICES) as Device[]).map((d) => {
            const Icon = DEVICES[d].icon;
            return { value: d, label: <Icon className="size-3.5" aria-label={DEVICES[d].label} />, title: DEVICES[d].label };
          })}
        />
        <div className="ms-auto flex items-center gap-0.5">
          <IconButton label="Replay scroll animation" onClick={replayMotion}>
            <Play className="size-3.5" />
          </IconButton>
          <IconButton
            label="Reload preview"
            onClick={() => {
              setLoading(true);
              setReloadKey((k) => k + 1);
            }}
          >
            <RefreshCw className="size-3.5" />
          </IconButton>
          <a href={shownPath} target="_blank" rel="noopener noreferrer" title="Open the published page in a new tab" className="grid size-7 place-items-center rounded-[var(--radius-sm)] text-subtle hover:bg-surface-2 hover:text-fg">
            <ExternalLink className="size-3.5" aria-label="Open the published page in a new tab" />
          </a>
        </div>
      </div>

      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-bg px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-center gap-2 truncate rounded-full bg-surface px-3 py-1 font-mono text-[0.7rem] text-subtle" dir="ltr">
          <span className={cn("size-1.5 shrink-0 rounded-full", loading ? "animate-pulse bg-warning" : "bg-success")} aria-hidden />
          shamflare.com{shownPath}
        </span>
        <span className="text-[0.65rem] font-medium tracking-wide text-accent uppercase">Live draft</span>
      </div>

      {/* Scaled viewport */}
      <div ref={viewportRef} className={cn("relative flex-1 overflow-hidden", device !== "desktop" && "bg-[radial-gradient(circle_at_50%_0%,var(--color-surface-2),var(--color-bg-deep)_70%)]")}>
        <div
          className={cn("absolute top-0 origin-top transition-[width] duration-300", device === "desktop" ? "start-0" : "left-1/2 -translate-x-1/2")}
          style={{ width: frameWidth * scale, height: box.height }}
        >
          <iframe
            key={`${src}-${reloadKey}`}
            ref={frameRef}
            src={src}
            title="Website preview"
            onLoad={onLoad}
            className={cn("origin-top-left border-0 bg-bg transition-opacity duration-300", loading && "opacity-40", device !== "desktop" && "shadow-[0_0_0_1px_var(--color-line-strong)]")}
            style={{ width: frameWidth, height: frameHeight, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
});
