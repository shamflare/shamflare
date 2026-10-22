import {
  Alexandria,
  Almarai,
  Amiri,
  Baloo_Bhaijaan_2,
  Cairo,
  Changa,
  DM_Sans,
  El_Messiri,
  IBM_Plex_Sans_Arabic,
  Inter,
  JetBrains_Mono,
  Lalezar,
  Lexend,
  Mada,
  Manrope,
  Markazi_Text,
  Montserrat,
  Noto_Kufi_Arabic,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  Readex_Pro,
  Reem_Kufi,
  Rubik,
  Sora,
  Space_Grotesk,
  Tajawal,
  Vazirmatn,
  Zain,
} from "next/font/google";

/*
 * Every typeface the dashboard's Appearance page can choose from. Each one is
 * self-hosted by next/font and exposed as a `--ff-<key>` variable on <html>;
 * globals.css maps the roles (--font-heading, --font-body, the Arabic roles) to
 * Sora / Inter / IBM Plex Sans Arabic by default and lib/appearance.ts remaps
 * them. Only the defaults are preloaded: browsers download a font file only once
 * text is actually rendered with it, so unused choices cost no bandwidth.
 *
 * next/font needs literal options at module scope, hence one call per font.
 * Keys must match FONTS in lib/appearance.ts and FONT_KEYS in the backend.
 */

// Defaults (preloaded)
const sora = Sora({ subsets: ["latin", "latin-ext"], variable: "--ff-sora", display: "swap" });
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--ff-inter", display: "swap" });
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-ibm-plex-arabic",
  display: "swap",
  preload: false,
});
const code = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-code", display: "swap", preload: false });

// Latin choices
const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--ff-poppins", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--ff-manrope", display: "swap", preload: false });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--ff-plus-jakarta", display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin", "latin-ext"], variable: "--ff-outfit", display: "swap", preload: false });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--ff-space-grotesk", display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--ff-dm-sans", display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin", "latin-ext"], variable: "--ff-montserrat", display: "swap", preload: false });
const lexend = Lexend({ subsets: ["latin", "latin-ext"], variable: "--ff-lexend", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--ff-playfair", display: "swap", preload: false });

// Arabic choices
const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700", "800"], variable: "--ff-tajawal", display: "swap", preload: false });
const cairo = Cairo({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-cairo", display: "swap", preload: false });
const almarai = Almarai({ subsets: ["arabic", "latin"], weight: ["400", "700", "800"], variable: "--ff-almarai", display: "swap", preload: false });
const notoKufi = Noto_Kufi_Arabic({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-noto-kufi", display: "swap", preload: false });
const readex = Readex_Pro({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-readex", display: "swap", preload: false });
const changa = Changa({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-changa", display: "swap", preload: false });
const elMessiri = El_Messiri({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-el-messiri", display: "swap", preload: false });
const alexandria = Alexandria({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-alexandria", display: "swap", preload: false });
const rubik = Rubik({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-rubik", display: "swap", preload: false });
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-vazirmatn", display: "swap", preload: false });
const reemKufi = Reem_Kufi({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-reem-kufi", display: "swap", preload: false });
const mada = Mada({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-mada", display: "swap", preload: false });
const zain = Zain({ subsets: ["arabic", "latin"], weight: ["400", "700", "800"], variable: "--ff-zain", display: "swap", preload: false });
const balooBhaijaan = Baloo_Bhaijaan_2({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-baloo-bhaijaan", display: "swap", preload: false });
const markazi = Markazi_Text({ subsets: ["arabic", "latin", "latin-ext"], variable: "--ff-markazi", display: "swap", preload: false });
const amiri = Amiri({ subsets: ["arabic", "latin", "latin-ext"], weight: ["400", "700"], variable: "--ff-amiri", display: "swap", preload: false });
const lalezar = Lalezar({ subsets: ["arabic", "latin", "latin-ext"], weight: "400", variable: "--ff-lalezar", display: "swap", preload: false });

export const fontVariables = [
  sora,
  inter,
  ibmPlexArabic,
  code,
  poppins,
  manrope,
  plusJakarta,
  outfit,
  spaceGrotesk,
  dmSans,
  montserrat,
  lexend,
  playfair,
  tajawal,
  cairo,
  almarai,
  notoKufi,
  readex,
  changa,
  elMessiri,
  alexandria,
  rubik,
  vazirmatn,
  reemKufi,
  mada,
  zain,
  balooBhaijaan,
  markazi,
  amiri,
  lalezar,
]
  .map((font) => font.variable)
  .join(" ");
