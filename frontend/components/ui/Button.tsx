import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

// Shape, weight, size and the primary style follow the dashboard's Appearance settings (CSS variables).
const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] [font-weight:var(--btn-weight)] whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-quart)] " +
  "disabled:pointer-events-none disabled:opacity-55 select-none";

const variants: Record<Variant, string> = {
  primary: "sf-btn-primary active:translate-y-px",
  secondary:
    "border border-line-strong bg-surface/60 text-fg hover:border-accent/50 hover:bg-surface-2 active:translate-y-px",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-[calc(2.25rem*var(--btn-scale))] px-[calc(0.875rem*var(--btn-scale))] text-sm",
  md: "h-[calc(2.75rem*var(--btn-scale))] px-[calc(1.25rem*var(--btn-scale))] text-[length:calc(0.9375rem*var(--fs-body,1))]",
  lg: "h-[calc(3rem*var(--btn-scale))] px-[calc(1.5rem*var(--btn-scale))] text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

/** Locale-aware internal link styled as a button. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link {...props} className={buttonClasses({ variant, size, className })} />;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} {...props} className={buttonClasses({ variant, size, className })} />;
}
