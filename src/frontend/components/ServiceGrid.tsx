import { SERVICE_LABELS, CATEGORY_ORDER, SERVICE_CATEGORY_MAP } from "../types/services";
import ServiceCard from "./ServiceCard";

interface Props {
  services: Record<string, "running" | "available">;
}

export default function ServiceGrid({ services }: Props) {
  const grouped: Record<string, string[]> = {};
  for (const key of Object.keys(services)) {
    const cat = SERVICE_CATEGORY_MAP[key] || "Other";
    (grouped[cat] ??= []).push(key);
  }

  const orderedCategories: string[] = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
  if (grouped["Other"]?.length) orderedCategories.push("Other");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {orderedCategories.map((category) => {
        const keys = (grouped[category] ?? []).sort((a, b) =>
          (SERVICE_LABELS[a] || a).localeCompare(SERVICE_LABELS[b] || b)
        );
        const running = keys.filter((k) => services[k] === "running").length;

        return (
          <div key={category}>
            {/* Category header */}
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <span style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--sh-faint)",
                fontFamily: "var(--font-mono)",
              }}>
                {category}
              </span>
              <span style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: running > 0 ? "var(--sh-ok)" : "var(--sh-faint)",
              }}>
                {running}/{keys.length}
              </span>
            </div>

            {/* Service cards */}
            <div className="tw-grid tw-grid-cols-[repeat(auto-fill,minmax(180px,1fr))] tw-gap-1.5 max-sm:tw-grid-cols-[repeat(auto-fill,minmax(130px,1fr))]">
              {keys.map((key) => (
                <ServiceCard key={key} serviceKey={key} status={services[key]} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
