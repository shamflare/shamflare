import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono, Sora } from "next/font/google";

// Sora (headings) and Inter (body) cover Latin and Turkish; IBM Plex Sans Arabic
// is used for both roles when the document language is Arabic (see globals.css).
const heading = Sora({ subsets: ["latin", "latin-ext"], variable: "--font-heading", display: "swap" });
const body = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-code", display: "swap", preload: false });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = `${heading.variable} ${body.variable} ${code.variable} ${arabic.variable}`;
