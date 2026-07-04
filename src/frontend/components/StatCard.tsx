import type { ComponentType } from "react";

interface Props {
  label: string;
  value: string | number;
  variant?: "info" | "success" | "warning" | "default";
  subtext?: string;
  isText?: boolean;
  size?: "sm" | "md";
  /** Optional leading icon (Heroicon component) for stronger visual identity. */
  icon?: ComponentType<{ className?: string }>;
  /** Optional 0–100 progress value rendered as a thin bar under the content (e.g. running/total). */
  progress?: number;
}

const ACCENT: Record<string, string> = {
  info:    "var(--sh-accent)",
  success: "var(--sh-ok)",
  warning: "var(--sh-warn)",
  default: "#a78bfa",
};

const ACCENT_BG: Record<string, string> = {
  info:    "var(--sh-accent-bg)",
  success: "var(--sh-ok-bg)",
  warning: "var(--sh-warn-bg)",
  default: "rgba(167, 139, 250, 0.1)",
};

export default function StatCard({
  label,
  value,
  variant = "info",
  subtext,
  isText,
  size = "md",
  icon: Icon,
  progress,
}: Props) {
  const accent = ACCENT[variant] ?? ACCENT.info;
  const accentBg = ACCENT_BG[variant] ?? ACCENT_BG.info;
  const pad = size === "sm" ? "12px 16px" : "16px 20px";

  return (
    <div
      className="tw:group tw:transition-all tw:duration-150"
      style={{
        padding: pad,
        background: "var(--sh-surface)",
        border: "1px solid var(--sh-line)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: size === "sm" ? "4px" : "8px",
        fontFamily: "var(--font-ui)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--sh-dim)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--sh-line)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header row: label + icon badge */}
      <div className="tw:flex tw:items-center tw:justify-between">
        <span style={{
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.02em",
          color: "var(--sh-dim)",
          textTransform: "uppercase",
        }}>
          {label}
        </span>
        {Icon && (
          <span
            className="tw:flex tw:items-center tw:justify-center tw:flex-shrink-0"
            style={{
              width: size === "sm" ? 20 : 24,
              height: size === "sm" ? 20 : 24,
              borderRadius: 6,
              background: accentBg,
              color: accent,
            }}
          >
            <Icon className={size === "sm" ? "tw:w-3 tw:h-3" : "tw:w-3.5 tw:h-3.5"} />
          </span>
        )}
      </div>

      {/* Value — monospace for numbers. Wraps long unbroken text (e.g. an ETag
          hash) onto multiple lines instead of overflowing the card or clipping
          it against `overflow: hidden` above — full value stays visible. */}
      <span style={{
        fontSize: isText ? "0.875rem" : size === "sm" ? "1.25rem" : "1.625rem",
        fontWeight: 600,
        lineHeight: isText ? 1.4 : 1,
        color: accent,
        fontFamily: isText ? "var(--font-ui)" : "var(--font-mono)",
        wordBreak: "break-all",
      }}>
        {value}
      </span>

      {/* Subtext */}
      {subtext && (
        <span style={{
          fontSize: "0.6875rem",
          color: "var(--sh-faint)",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {subtext}
        </span>
      )}

      {/* Progress bar */}
      {typeof progress === "number" && (
        <div style={{ height: 3, borderRadius: 999, background: "var(--sh-elevated)", overflow: "hidden", marginTop: 2 }}>
          <div
            style={{
              height: "100%",
              width: `${Math.max(0, Math.min(100, progress))}%`,
              background: accent,
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}
