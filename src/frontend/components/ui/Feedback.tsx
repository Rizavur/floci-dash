import { useState, type ReactNode, type MouseEvent } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { resolveIcon } from "./icons";

// ── StatusIndicator ─────────────────────────────────────────────────────
type StatusType = "success" | "error" | "warning" | "info" | "pending" | "loading" | "stopped" | "in-progress";

const STATUS_COLOR: Record<StatusType, string> = {
  success: "var(--sh-ok)",
  error: "var(--sh-fail)",
  warning: "var(--sh-warn)",
  info: "var(--sh-info)",
  pending: "var(--sh-faint)",
  loading: "var(--sh-info)",
  stopped: "var(--sh-faint)",
  "in-progress": "var(--sh-info)",
};

// Soft halo ring behind the dot, reusing the same translucent *-bg tokens
// used for status banners elsewhere — turns the previous flat, easy-to-miss
// 6px dot into a proper "live status" indicator. pending/stopped stay plain
// (no matching *-bg token, and they're meant to read as low-key/inactive).
const STATUS_HALO: Partial<Record<StatusType, string>> = {
  success: "var(--sh-ok-bg)",
  error: "var(--sh-fail-bg)",
  warning: "var(--sh-warn-bg)",
  info: "var(--sh-info-bg)",
  loading: "var(--sh-info-bg)",
  "in-progress": "var(--sh-info-bg)",
};

interface StatusIndicatorProps {
  type?: StatusType;
  children?: ReactNode;
  // "dot" (default) fits free-text messages (errors, loading text, sentences)
  // where a colored pill would look like an oversized, wrapping blob. "pill"
  // is for short, fixed-vocabulary labels (Running/Stopped/Active/Enabled)
  // — see StatusBadge, the main consumer.
  variant?: "dot" | "pill";
}

export function StatusIndicator({ type = "info", children, variant = "dot" }: StatusIndicatorProps) {
  const color = STATUS_COLOR[type] ?? "var(--sh-dim)";
  const halo = STATUS_HALO[type];
  const isSpinner = type === "loading" || type === "in-progress";

  if (variant === "pill" && !isSpinner) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 9px", borderRadius: 999,
        fontSize: "0.75rem", fontWeight: 600,
        background: halo ?? "var(--sh-elevated)", color,
        fontFamily: "var(--font-ui)",
      }}>
        {children}
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "0.75rem", color, fontFamily: "var(--font-ui)" }}>
      {isSpinner ? (
        <Spinner size="normal" />
      ) : (
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0,
          boxShadow: halo ? `0 0 0 3px ${halo}` : undefined,
        }} />
      )}
      {children}
    </span>
  );
}

// ── Spinner ─────────────────────────────────────────────────────────────
export function Spinner({ size = "normal" }: { size?: "normal" | "big" | "large" }) {
  const px = size === "big" || size === "large" ? 20 : 13;
  return (
    <span
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: px,
        height: px,
        borderRadius: "50%",
        border: "2px solid var(--sh-line)",
        borderTopColor: "var(--sh-accent)",
        animation: "fd-spin 0.7s linear infinite",
      }}
    />
  );
}

// Inject the spin keyframes once.
if (typeof document !== "undefined" && !document.getElementById("fd-ui-spin-keyframes")) {
  const style = document.createElement("style");
  style.id = "fd-ui-spin-keyframes";
  style.textContent = "@keyframes fd-spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}

// ── Badge ───────────────────────────────────────────────────────────────
type BadgeColor = "grey" | "blue" | "green" | "red";

const BADGE_COLORS: Record<string, { bg: string; fg: string }> = {
  grey: { bg: "var(--sh-elevated)", fg: "var(--sh-dim)" },
  blue: { bg: "var(--sh-info-bg)", fg: "var(--sh-info)" },
  green: { bg: "var(--sh-ok-bg)", fg: "var(--sh-ok)" },
  red: { bg: "var(--sh-fail-bg)", fg: "var(--sh-fail)" },
};

export function Badge({ color = "grey", children }: { color?: BadgeColor; children?: ReactNode }) {
  const c = BADGE_COLORS[color] ?? BADGE_COLORS.grey;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 7px",
        borderRadius: 999,
        fontSize: "0.6875rem",
        fontWeight: 600,
        background: c.bg,
        color: c.fg,
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </span>
  );
}

// ── Alert ───────────────────────────────────────────────────────────────
type AlertType = "success" | "error" | "warning" | "info";

const ALERT_STYLE: Record<AlertType, { bg: string; fg: string; icon: typeof CheckCircleIcon }> = {
  success: { bg: "var(--sh-ok-bg)", fg: "var(--sh-ok)", icon: CheckCircleIcon },
  error: { bg: "var(--sh-fail-bg)", fg: "var(--sh-fail)", icon: ExclamationCircleIcon },
  warning: { bg: "var(--sh-warn-bg)", fg: "var(--sh-warn)", icon: ExclamationTriangleIcon },
  info: { bg: "var(--sh-info-bg)", fg: "var(--sh-info)", icon: InformationCircleIcon },
};

interface AlertProps {
  type?: AlertType;
  header?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
  /** Accepted for API compatibility; the icon already conveys the alert type visually. */
  statusIconAriaLabel?: string;
  children?: ReactNode;
  /**
   * Solid surface background + shadow instead of the default translucent
   * tint. Inline alerts sit on an already-opaque page/card background, so
   * the subtle tint reads fine; a floating toast (see Flashbar) has nothing
   * behind it but the page content, so the translucent version blends into
   * dark backgrounds and looks like unreadable black text on black.
   */
  elevated?: boolean;
}

export function Alert({ type = "info", header, dismissible, onDismiss, action, statusIconAriaLabel, children, elevated }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const s = ALERT_STYLE[type];
  const Icon = s.icon;
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        background: elevated ? "var(--sh-surface)" : s.bg,
        border: `1px solid ${s.fg}${elevated ? "55" : "33"}`,
        boxShadow: elevated ? "0 8px 24px rgba(0,0,0,0.35)" : undefined,
        fontSize: "0.78125rem",
        fontFamily: "var(--font-ui)",
        color: "var(--sh-ink)",
      }}
    >
      <Icon aria-label={statusIconAriaLabel} className="tw:w-4 tw:h-4 tw:flex-shrink-0" style={{ color: s.fg, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {header && <div style={{ fontWeight: 600, marginBottom: 2 }}>{header}</div>}
        <div>{children}</div>
        {action && <div style={{ marginTop: 8 }}>{action}</div>}
      </div>
      {dismissible && (
        <button
          onClick={() => { setDismissed(true); onDismiss?.(); }}
          aria-label="Dismiss"
          style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--sh-faint)", flexShrink: 0 }}
        >
          <XMarkIcon className="tw:w-4 tw:h-4" />
        </button>
      )}
    </div>
  );
}

// ── Flashbar (toast list) ───────────────────────────────────────────────
export namespace FlashbarProps {
  export interface MessageDefinition {
    id?: string;
    type?: AlertType;
    header?: ReactNode;
    content?: ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
  }
}

export function Flashbar({ items }: { items: FlashbarProps.MessageDefinition[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <Alert key={item.id} type={item.type} header={item.header} dismissible={item.dismissible} onDismiss={item.onDismiss} elevated>
          {item.content}
        </Alert>
      ))}
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────
interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  variant?: "text-heading-xl" | "text-heading-m" | "text-heading-s" | "text-body" | "rect" | "circle";
}

const SKELETON_HEIGHT: Record<string, string> = {
  "text-heading-xl": "28px",
  "text-heading-m": "20px",
  "text-heading-s": "16px",
  "text-body": "14px",
};

export function Skeleton({ height, width = "100%", variant }: SkeletonProps) {
  const h = height ?? (variant ? SKELETON_HEIGHT[variant] : "14px");
  return (
    <span
      className="fd-skeleton"
      style={{ display: "block", height: h, width, borderRadius: variant === "circle" ? "50%" : 4 }}
    />
  );
}

// ── Link ────────────────────────────────────────────────────────────────
interface LinkProps {
  href?: string;
  external?: boolean;
  onFollow?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children?: ReactNode;
}

export function Link({ href = "#", external, onFollow, children }: LinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!external && href === "#") e.preventDefault();
        onFollow?.(e);
      }}
      style={{ color: "var(--sh-accent)", textDecoration: "none", cursor: "pointer" }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
    >
      {children}
    </a>
  );
}

// ── Icon ────────────────────────────────────────────────────────────────
export function Icon({ name, size = "normal" }: { name?: string; size?: "small" | "normal" | "medium" | "big" }) {
  const Cmp = resolveIcon(name);
  if (!Cmp) return null;
  const px = size === "big" ? "tw:w-5 tw:h-5" : size === "medium" ? "tw:w-4 tw:h-4" : "tw:w-3.5 tw:h-3.5";
  return <Cmp className={`${px} tw:inline-block tw:align-[-2px]`} />;
}
