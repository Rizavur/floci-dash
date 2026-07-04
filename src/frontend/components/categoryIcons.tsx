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

/**
 * Per-category accent colors, loosely inspired by AWS's own category color
 * coding (orange for Compute, green for Storage, blue for Database, purple
 * for Networking, red for Security, teal for ML, pink for App Integration,
 * etc.) so services are distinguishable by category at a glance instead of
 * everything sharing the same teal/grey status color.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  "Application Integration": "#E7157B",
  "Compute": "#ED7100",
  "Containers": "#2E86DE",
  "Database": "#3B48CC",
  "Developer Tools": "#C925D1",
  "Storage": "#7AA116",
  "Networking & Content Delivery": "#8C4FFF",
  "Security, Identity & Compliance": "#DD344C",
  "Management & Governance": "#57708C",
  "Analytics": "#8C4FA1",
  "Machine Learning": "#01A88D",
  "Cost Management": "#B58900",
  "Migration & Transfer": "#B85C38",
};

const FALLBACK_COLOR = "#6E7781";

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}

/** Hex color -> "r, g, b" for building rgba() tint backgrounds. */
function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function getCategoryColorBg(category: string, alpha = 0.14): string {
  return `rgba(${hexToRgb(getCategoryColor(category))}, ${alpha})`;
}
