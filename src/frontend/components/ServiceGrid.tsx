import { useImperativeHandle, useState, forwardRef } from "react";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { SERVICE_LABELS, CATEGORY_ORDER, SERVICE_CATEGORY_MAP } from "../types/services";
import { getCategoryIcon, getCategoryColor, getCategoryColorBg } from "./categoryIcons";
import ServiceCard from "./ServiceCard";

interface Props {
  services: Record<string, "running" | "available">;
  /** Service keys that currently have provisioned resources. */
  activeServices?: string[];
  /** Resource count per service key, used for the small badge on active cards. */
  resourceCounts?: Record<string, number>;
}

export interface ServiceGridHandle {
  expandAll: () => void;
  collapseAll: () => void;
}

const ServiceGrid = forwardRef<ServiceGridHandle, Props>(function ServiceGrid(
  { services, activeServices, resourceCounts },
  ref,
) {
  const activeSet = new Set(activeServices ?? []);
  // Collapsing is self-contained here (not lifted to DashboardHome) since
  // ServiceGrid already owns the category grouping — expandAll/collapseAll
  // are exposed via ref so the page's header buttons can drive it.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const grouped: Record<string, string[]> = {};
  for (const key of Object.keys(services)) {
    const cat = SERVICE_CATEGORY_MAP[key] || "Other";
    (grouped[cat] ??= []).push(key);
  }

  const orderedCategories: string[] = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
  if (grouped["Other"]?.length) orderedCategories.push("Other");

  useImperativeHandle(ref, () => ({
    expandAll: () => setCollapsed(new Set()),
    collapseAll: () => setCollapsed(new Set(orderedCategories)),
  }), [orderedCategories]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {orderedCategories.map((category) => {
        const keys = (grouped[category] ?? []).sort((a, b) =>
          (SERVICE_LABELS[a] || a).localeCompare(SERVICE_LABELS[b] || b)
        );
        const running = keys.filter((k) => services[k] === "running").length;
        const activeCount = keys.filter((k) => activeSet.has(k)).length;
        const Icon = getCategoryIcon(category);
        const categoryColor = getCategoryColor(category);
        const categoryColorBg = getCategoryColorBg(category);

        const isOpen = !collapsed.has(category);

        return (
          <div key={category}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category)}
              aria-expanded={isOpen}
              className="tw:flex tw:items-center tw:gap-2 tw:mb-2 tw:w-full tw:cursor-pointer tw:bg-transparent tw:border-0 tw:p-0 tw:text-left"
            >
              <ChevronRightIcon
                className="tw:w-2.5 tw:h-2.5 tw:flex-shrink-0"
                style={{ color: "var(--sh-faint)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
              />
              <span
                className="tw:flex tw:items-center tw:justify-center tw:flex-shrink-0"
                style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: categoryColorBg,
                  color: categoryColor,
                }}
              >
                <Icon className="tw:w-2.5 tw:h-2.5" />
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--sh-faint)",
                fontFamily: "var(--font-mono)",
              }}>
                {category}
              </span>
              {activeCount > 0 && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--sh-accent)",
                  background: "var(--sh-accent-bg)",
                  borderRadius: "999px",
                  padding: "1px 6px",
                }}>
                  {activeCount} active
                </span>
              )}
              <span className="tw:ml-auto" style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: running > 0 ? "var(--sh-ok)" : "var(--sh-faint)",
              }}>
                {running}/{keys.length}
              </span>
            </button>

            {/* Service cards */}
            {isOpen && (
              <div className="tw:grid tw:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] tw:gap-2 tw:max-sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
                {keys.map((key) => (
                  <ServiceCard
                    key={key}
                    serviceKey={key}
                    status={services[key]}
                    isActive={activeSet.has(key)}
                    resourceCount={resourceCounts?.[key]}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default ServiceGrid;
