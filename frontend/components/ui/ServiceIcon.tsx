import { Code, Globe, Layers, Monitor, Server, Shield, Smartphone, Wrench, type LucideIcon } from "lucide-react";

// Must match the allowed icon names in the backend (docs/api.md → admin services).
const icons: Record<string, LucideIcon> = {
  globe: Globe,
  smartphone: Smartphone,
  monitor: Monitor,
  wrench: Wrench,
  server: Server,
  code: Code,
  layers: Layers,
  shield: Shield,
};

export const SERVICE_ICON_NAMES = Object.keys(icons);

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Code;
  return <Icon className={className} aria-hidden strokeWidth={1.6} />;
}
