interface Props {
  label: string;
  value: string | number;
  variant?: "info" | "success" | "warning" | "default";
  subtext?: string;
  isText?: boolean;
  size?: "sm" | "md";
}

const ACCENT: Record<string, string> = {
  info:    "var(--sh-accent)",
  success: "var(--sh-ok)",
  warning: "var(--sh-warn)",
  default: "#a78bfa",
};

export default function StatCard({
  label,
  value,
  variant = "info",
  subtext,
  isText,
  size = "md",
}: Props) {
  const accent = ACCENT[variant] ?? ACCENT.info;
  const pad = size === "sm" ? "12px 16px" : "16px 20px";

  return (
    <div
      style={{
        padding: pad,
        background: "var(--sh-surface)",
        border: "1px solid var(--sh-line)",
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        gap: size === "sm" ? "4px" : "6px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Label */}
      <span style={{
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: "var(--sh-faint)",
        textTransform: "uppercase",
      }}>
        {label}
      </span>

      {/* Value — monospace for numbers */}
      <span style={{
        fontSize: isText ? "14px" : size === "sm" ? "20px" : "26px",
        fontWeight: 600,
        lineHeight: 1,
        color: accent,
        fontFamily: isText ? "var(--font-sans)" : "var(--font-mono)",
      }}>
        {value}
      </span>

      {/* Subtext */}
      {subtext && (
        <span style={{
          fontSize: "11px",
          color: "var(--sh-faint)",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
