import "../globals.css";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Shamflare Dashboard" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0b1220", colorScheme: "dark" };

// The dashboard is a private, English-only tool; it has its own root layout.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
