import { MessageCircle } from "lucide-react";

/**
 * Floating WhatsApp shortcut. Sits in the inline-end corner, stays clear of
 * content on small screens (icon only) and is a regular, labelled link.
 */
export function WhatsAppButton({ href, label, short }: { href: string; label: string; short: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex h-12 items-center gap-2 rounded-full border border-[#25D366]/40 bg-surface/90 ps-3.5 pe-3.5 text-sm font-medium text-fg shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:border-[#25D366]/80 hover:bg-surface-2 sm:end-6 sm:bottom-6 sm:pe-4.5"
    >
      <MessageCircle className="size-5 text-[#25D366]" aria-hidden />
      <span className="hidden sm:inline">{short}</span>
    </a>
  );
}
