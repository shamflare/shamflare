import { Cloud, Globe, Monitor, Plug, ShieldCheck, Smartphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

const CAPABILITIES = [
  [1, Globe],
  [2, Smartphone],
  [3, Monitor],
  [4, Plug],
  [5, Cloud],
  [6, ShieldCheck],
] as const;

export async function CapabilityGrid() {
  const t = await getTranslations("Home");
  return (
    <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {CAPABILITIES.map(([n, Icon]) => (
        <li key={n} className="reveal flex gap-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-line bg-surface text-accent">
            <Icon className="size-5" strokeWidth={1.6} aria-hidden />
          </span>
          <div>
            <h3 className="text-lg font-semibold">{t(`capability${n}Title`)}</h3>
            <p className="mt-2 leading-relaxed text-muted">{t(`capability${n}Body`)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
