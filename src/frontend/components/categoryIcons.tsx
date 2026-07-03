import type { ComponentType } from "react";
import {
  BoltIcon,
  CpuChipIcon,
  CubeIcon,
  CircleStackIcon,
  CodeBracketIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  Squares2X2Icon,
} from "@heroicons/react/16/solid";

type IconComponent = ComponentType<{ className?: string }>;

/** Maps each service category to a representative Heroicon for quick visual scanning. */
export const CATEGORY_ICONS: Record<string, IconComponent> = {
  "Application Integration": BoltIcon,
  "Compute": CpuChipIcon,
  "Containers": CubeIcon,
  "Database": CircleStackIcon,
  "Developer Tools": CodeBracketIcon,
  "Storage": ArchiveBoxIcon,
  "Networking & Content Delivery": GlobeAltIcon,
  "Security, Identity & Compliance": ShieldCheckIcon,
  "Management & Governance": Cog6ToothIcon,
  "Analytics": ChartBarIcon,
  "Machine Learning": SparklesIcon,
  "Cost Management": CurrencyDollarIcon,
  "Migration & Transfer": ArrowsRightLeftIcon,
};

export function getCategoryIcon(category: string): IconComponent {
  return CATEGORY_ICONS[category] ?? Squares2X2Icon;
}
