import { cn } from "@/lib/cn";

/**
 * Typographic Shamflare wordmark: a rounded-square mark with a bold "S" and a
 * crisp four-point star, followed by the lowercase name. The mark alone is
 * reused for the favicon (app/icon.svg). Replace this component when a final
 * SVG logo exists.
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
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#0B1220" stroke="#5EE3F7" strokeWidth="1.8" />
      <path
        d="M20.6 10.6c-1-1.4-2.6-2.1-4.6-2.1-2.9 0-4.9 1.6-4.9 3.8 0 5 9.9 2.9 9.9 7.6 0 2.3-2.1 3.9-5.2 3.9-2.2 0-4-.8-5.2-2.3"
        fill="none"
        stroke="#5EE3F7"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shining four-point star (twinkles unless reduced motion is preferred). */}
      <g className="sf-twinkle" filter={`url(#${id}-glow)`}>
        <path
          d="M24.9 3.9C25.16 6.74 25.56 7.14 28.4 7.4 25.56 7.66 25.16 8.06 24.9 10.9 24.64 8.06 24.24 7.66 21.4 7.4 24.24 7.14 24.64 6.74 24.9 3.9Z"
          fill="#FFFFFF"
        />
      </g>
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
  /** Unique per page: the SVG filter id. */
  id?: string;
}) {
  const sizes = {
    sm: { mark: "size-7", text: "text-base" },
    md: { mark: "size-9", text: "text-xl" },
    lg: { mark: "size-11", text: "text-2xl" },
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
