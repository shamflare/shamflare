import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}

export function Section({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-20 sm:py-28", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  align?: "start" | "center";
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  as: Heading = "h2",
  align = "start",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "reveal flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <Heading
          id={id}
          className={cn(
            "font-semibold text-fg",
            Heading === "h1" ? "text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </Heading>
        {description ? <p className="mt-5 text-lg leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Page-level header used at the top of inner pages. */
export function PageHeader({ eyebrow, title, description, children }: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_80%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 start-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-accent-2/10 blur-3xl rtl:translate-x-1/2" />
      <Container className="relative pt-16 pb-14 sm:pt-24 sm:pb-20">
        {children}
        <SectionHeader as="h1" eyebrow={eyebrow} title={title} description={description} />
      </Container>
    </header>
  );
}

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}
