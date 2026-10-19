import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { PostSummary, ProjectSummary, ServiceSummary } from "@/lib/api/types";
import { formatDate } from "@/lib/site";
import { Badge } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

const cardBase =
  "group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface " +
  "shadow-[var(--shadow-card)] transition-[border-color,background-color] duration-300 " +
  "hover:border-accent/35 hover:bg-surface-2 focus-within:border-accent/50";

/** Makes the whole card clickable while keeping a single, labelled link for assistive tech. */
const stretchedLink = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

export async function ServiceCard({ service, index }: { service: ServiceSummary; index?: number }) {
  const t = await getTranslations("Common");
  return (
    <article className={`${cardBase} p-6 sm:p-7`}>
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-[var(--radius-md)] border border-line bg-bg text-accent transition-colors group-hover:border-accent/40">
          <ServiceIcon name={service.icon} className="size-6" />
        </span>
        {index !== undefined ? (
          <span className="font-mono text-xs text-subtle" dir="ltr">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-fg">
        <Link href={`/services/${service.slug}`} className={stretchedLink}>
          {service.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted">{service.summary}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        {t("viewService")}
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden />
      </span>
    </article>
  );
}

function CoverPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-grid relative flex size-full items-center justify-center bg-bg-deep" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgb(56_189_248/0.18),transparent)]" />
      <span className="relative font-mono text-xs tracking-[0.2em] text-subtle uppercase" dir="ltr">
        {label}
      </span>
    </div>
  );
}

export async function ProjectCard({ project, priority = false }: { project: ProjectSummary; priority?: boolean }) {
  const t = await getTranslations("Common");
  const tp = await getTranslations("Portfolio");
  return (
    <article className={cardBase}>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.cover_alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <CoverPlaceholder label={project.category?.title ?? project.title} />
        )}
        {project.is_demo ? (
          <Badge className="absolute top-3 start-3 border-accent-3/40 bg-bg/80 text-accent-3 backdrop-blur">
            {t("demoBadge")}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {project.category ? <p className="eyebrow text-[0.7rem]">{project.category.title}</p> : null}
        <h3 className="mt-2 text-xl font-semibold text-fg">
          <Link href={`/portfolio/${project.slug}`} className={stretchedLink}>
            {project.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted">{project.summary}</p>
        {project.technologies.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={tp("technologies")}>
            {project.technologies.slice(0, 4).map((tech) => (
              <li key={tech}>
                <Badge dir="ltr">{tech}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export async function PostCard({ post, locale }: { post: PostSummary; locale: Locale }) {
  const t = await getTranslations("Common");
  return (
    <article className={cardBase}>
      {post.cover_image ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-line">
          <Image
            src={post.cover_image}
            alt={post.cover_alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
          {post.category ? <span className="text-accent">{post.category.name}</span> : null}
          <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
          <span aria-hidden>·</span>
          <span>{t("minutesRead", { minutes: post.reading_time_minutes })}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-snug text-fg">
          <Link href={`/blog/${post.slug}`} className={stretchedLink}>
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted">{post.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          {t("readArticle")}
          <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
        </span>
      </div>
    </article>
  );
}
