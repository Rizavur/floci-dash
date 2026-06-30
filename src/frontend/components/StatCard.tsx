import { Box } from "@cloudscape-design/components";

const VARIANTS: Record<string, { accent: string; icon: string }> = {
  info:    { accent: "fd-accent-info",    icon: "●" },
  success: { accent: "fd-accent-success", icon: "●" },
  warning: { accent: "fd-accent-warning", icon: "●" },
  default: { accent: "fd-accent-purple",  icon: "◆" },
};

interface Props {
  label: string;
  value: string | number;
  variant?: "info" | "success" | "warning" | "default";
  subtext?: string;
  isText?: boolean;
  size?: "sm" | "md";
}

export default function StatCard({
  label,
  value,
  variant = "info",
  subtext,
  isText,
  size = "md",
}: Props) {
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const padding = size === "sm" ? "tw-p-4" : "tw-p-5";

  return (
    <div className={`fd-accent-card tw-flex tw-flex-col tw-gap-1.5 ${padding}`}>
      {/* Label row */}
      <Box variant="small" color="text-body-secondary">
        <span className={`${v.accent} tw-mr-1.5`}>{v.icon}</span>
        {label}
      </Box>

      {/* Value */}
      <Box variant={isText ? "h4" : "h1"} color="inherit" padding={{ top: "xxs" }}>
        <span className={v.accent} style={{ fontWeight: 700, fontSize: isText ? 14 : undefined }}>
          {value}
        </span>
      </Box>

      {/* Subtext */}
      {subtext && (
        <Box variant="small" color="text-body-secondary" padding={{ top: "xxs" }}>
          {subtext}
        </Box>
      )}
    </div>
  );
}
