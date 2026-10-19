import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

/**
 * Renders CMS Markdown. Raw HTML in the source is ignored (react-markdown's
 * default), so content edited in the dashboard cannot inject markup or scripts.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  if (!children.trim()) return null;
  return (
    <div className={cn("prose-sf", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Promote nothing above h2: the page already owns the h1.
          h1: ({ children: content }) => <h2>{content}</h2>,
          a: ({ href, children: content }) => {
            const external = typeof href === "string" && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {content}
              </a>
            );
          },
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element -- dimensions of CMS images are unknown
              <img src={src} alt={alt ?? ""} loading="lazy" className="rounded-[var(--radius-md)] border border-line" />
            ) : null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
