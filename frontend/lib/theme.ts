/**
 * Colour theme: the visitor chooses light, dark or "system" (follow the OS).
 * The choice lives in localStorage; the resolved theme is written to
 * <html data-theme="light|dark">, which switches the tokens in globals.css.
 */

export const THEME_STORAGE_KEY = "sf-theme";
export const THEME_PREFERENCES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/**
 * Opts the page into hide-until-seen scroll reveals before first paint (so
 * content never flashes visible and then disappears). If RevealObserver has
 * not taken over within 4 s (script failed to load), everything is shown.
 * Skipped entirely for visitors who prefer reduced motion.
 */
const REVEAL_INIT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.dataset.reveal="";setTimeout(function(){if(!window.__sfReveal)delete d.dataset.reveal},4000)}catch(e){}})()`;

/**
 * Runs inline in <head> before first paint so a light-theme visitor never sees
 * a dark flash. Kept dependency-free and wrapped in try/catch (storage can be
 * blocked); on failure the page stays on the dark default.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var t=p==="light"||p==="dark"?p:matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}})();${REVEAL_INIT}`;
