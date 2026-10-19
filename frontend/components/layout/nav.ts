/** Primary navigation, shared by Server and Client Components. */
export const NAV_ITEMS = [
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
