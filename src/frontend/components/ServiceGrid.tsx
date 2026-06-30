import { SpaceBetween } from "@cloudscape-design/components";
import { SERVICE_LABELS, CATEGORY_ORDER, SERVICE_CATEGORY_MAP } from "../types/services";
import ServiceCard from "./ServiceCard";

interface Props {
  services: Record<string, "running" | "available">;
}

export default function ServiceGrid({ services }: Props) {
  const grouped: Record<string, string[]> = {};
  for (const key of Object.keys(services)) {
    const cat = SERVICE_CATEGORY_MAP[key] || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(key);
  }

  const orderedCategories: string[] = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
  if (grouped["Other"]?.length) orderedCategories.push("Other");

  return (
    <SpaceBetween size="l">
      {orderedCategories.map((category) => {
        const keys = grouped[category].sort((a, b) =>
          (SERVICE_LABELS[a] || a).localeCompare(SERVICE_LABELS[b] || b)
        );
        return (
          <div key={category}>
            {/* Category header — Tailwind typography instead of Cloudscape Box */}
            <p className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-mb-3 fd-text-muted-subtle">
              {category}
            </p>
            {/* Responsive auto-fill grid — matches the existing fd-grid-responsive breakpoints */}
            <div className="tw-grid tw-grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tw-gap-3
                            max-sm:tw-grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-sm:tw-gap-2">
              {keys.map((key) => (
                <ServiceCard key={key} serviceKey={key} status={services[key]} />
              ))}
            </div>
          </div>
        );
      })}
    </SpaceBetween>
  );
}
