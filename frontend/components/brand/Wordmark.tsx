import { cn } from "@/lib/cn";

/**
 * Typographic Shamflare wordmark: a compact "flare" glyph (an S-curve cut by a
 * spark) followed by the lowercase name. The glyph alone is reused for the
 * favicon (app/icon.svg). Replace this component when a final SVG logo exists.
 */
export function BrandMark({ className, title, id = "sf-mark" }: { className?: string; title?: string; id?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={id} x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="0.55" stopColor="#67E8F9" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#111B2D" stroke={`url(#${id})`} strokeOpacity="0.55" />
      <path
        d="M21.5 9.5c-1.2-1.3-3-2-5.2-2-3.3 0-5.6 1.8-5.6 4.4 0 5.6 10.8 3.2 10.8 8.4 0 2.6-2.4 4.4-5.8 4.4-2.4 0-4.4-.9-5.7-2.4"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M24.5 4.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#67E8F9" />
    </svg>
  );
}

export function Wordmark({
  className,
  size = "md",
  id,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Unique per page: the SVG gradient id. */
  id?: string;
}) {
  const sizes = {
    sm: { mark: "size-6", text: "text-base" },
    md: { mark: "size-7", text: "text-lg" },
    lg: { mark: "size-9", text: "text-2xl" },
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <BrandMark className={sizes.mark} id={id} />
      <span className={cn("font-[family-name:var(--font-heading)] font-semibold tracking-[-0.03em] text-fg", sizes.text)}>
        sham<span className="text-accent">flare</span>
      </span>
    </span>
  );
}
