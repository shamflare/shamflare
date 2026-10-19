"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Folder,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Settings,
  Tag,
  X,
} from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { AdminUser } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { Wordmark } from "@/components/brand/Wordmark";
import { Spinner } from "./ui";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/portfolio", label: "Portfolio", icon: Folder },
  { href: "/admin/blog", label: "Blog posts", icon: FileText, exclude: "/admin/blog/categories" },
  { href: "/admin/blog/categories", label: "Blog categories", icon: Tag },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

type Session = { user: AdminUser; signOut: () => Promise<void> };
const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside AdminShell");
  return session;
}

/**
 * Client-side gate for the dashboard UI. It only decides what to render — every
 * admin API endpoint independently requires an authenticated staff session.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [state, setState] = useState<"checking" | "ready" | "error">("checking");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    let cancelled = false;
    apiRequest<AdminUser>("auth/me/")
      .then((me) => {
        if (cancelled) return;
        if (!me.is_staff) throw new ApiError(403, null);
        setUser(me);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
        } else {
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
    // Checked once per dashboard visit; API calls report expired sessions individually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiRequest("auth/logout/", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  }, [router]);

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">The dashboard API is unavailable</h1>
        <p className="mt-3 text-sm text-muted">The backend could not be reached. Check that the Django service is running, then reload.</p>
      </div>
    );
  }
  if (state === "checking" || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(`${item.href}/`)) && !(item.exclude && pathname.startsWith(item.exclude));

  const nav = (
    <nav aria-label="Dashboard">
      <ul className="grid gap-0.5">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <item.icon className={cn("size-4", active && "text-accent")} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-line pt-4 text-sm">
      <p className="truncate px-3 text-xs text-subtle">Signed in as {user.username}</p>
      <a href="/en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-muted hover:bg-surface hover:text-fg">
        <ExternalLink className="size-4" aria-hidden /> View website
      </a>
      <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-muted hover:bg-surface hover:text-fg">
        <LogOut className="size-4" aria-hidden /> Sign out
      </button>
    </div>
  );

  return (
    <SessionContext.Provider value={{ user, signOut }}>
      <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-e border-line bg-bg-deep p-4 lg:flex">
          <Link href="/admin" className="px-2 pt-1" aria-label="Dashboard overview">
            <Wordmark size="sm" id="sf-mark-admin" />
          </Link>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          {footer}
        </aside>

        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg-deep px-4 lg:hidden">
          <Link href="/admin" aria-label="Dashboard overview">
            <Wordmark size="sm" id="sf-mark-admin-mobile" />
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-[var(--radius-md)] hover:bg-surface"
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </header>
        <div id="admin-menu" hidden={!menuOpen} className="fixed inset-x-0 top-14 bottom-0 z-30 space-y-6 overflow-y-auto bg-bg-deep p-4 lg:hidden">
          {nav}
          {footer}
        </div>

        <main className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </SessionContext.Provider>
  );
}
