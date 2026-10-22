import { getAppearance, isUnavailable } from "@/lib/api/server";
import { appearanceCss, cssHash } from "@/lib/appearance";

/** Prefix of the injected style's `href`; the dashboard preview looks it up to swap in a draft. */
export const APPEARANCE_STYLE_PREFIX = "sf-appearance";

/**
 * The colors, fonts and shapes chosen on the dashboard's Appearance page, as a
 * stylesheet of design-token overrides. React hoists it into <head>. Nothing is
 * rendered for the built-in design or when the API is unreachable.
 */
export async function AppearanceStyle() {
  const config = await getAppearance();
  if (!config || isUnavailable(config)) return null;
  const css = appearanceCss(config);
  if (!css) return null;
  return (
    <style href={`${APPEARANCE_STYLE_PREFIX}-${cssHash(css)}`} precedence="sf-appearance">
      {css}
    </style>
  );
}
