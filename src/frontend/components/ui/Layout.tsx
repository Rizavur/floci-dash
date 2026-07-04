import type { ReactNode, CSSProperties, MouseEvent } from "react";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { SPACE, resolveColor, resolveFontSize, resolveSpacing, resolveMargin } from "./tokens";

// ── Box ─────────────────────────────────────────────────────────────────
type BoxVariant =
  | "h1" | "h2" | "h3" | "h4" | "h5"
  | "p" | "span" | "div" | "strong" | "small" | "code"
  | "awsui-key-label" | "awsui-gen-ai-label";

interface BoxProps {
  variant?: BoxVariant;
  color?: string;
  fontSize?: string;
  fontWeight?: string | number;
  padding?: Parameters<typeof resolveSpacing>[0];
  margin?: Parameters<typeof resolveMargin>[0];
  float?: "left" | "right";
  textAlign?: "left" | "center" | "right";
  display?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5"]);
const HEADING_SIZE: Record<string, number> = { h1: 24, h2: 18, h3: 15, h4: 14, h5: 13 };

export function Box({
  variant = "div", color, fontSize, fontWeight, padding, margin,
  float, textAlign, display, children, className, style,
}: BoxProps) {
  const Tag: any =
    HEADING_TAGS.has(variant) ? variant :
    variant === "p" ? "p" :
    variant === "strong" ? "strong" :
    variant === "small" ? "small" :
    variant === "code" ? "code" :
    variant === "span" ? "span" : "div";

  const isLabel = variant === "awsui-key-label";

  const computedStyle: CSSProperties = {
    color: resolveColor(color),
    // ponytail: plain variants (div/p/span/strong/small/code) had no default and
    // silently inherited the browser's ~16px, taller than the rest of this app's
    // ~12-13px scale (e.g. "strong" row labels rendering bigger than their own
    // section heading). 13px matches that scale; explicit fontSize still wins.
    fontSize: fontSize ? resolveFontSize(fontSize) : isLabel ? "11px" : HEADING_TAGS.has(variant) ? HEADING_SIZE[variant] : "13px",
    fontWeight: fontWeight ?? (HEADING_TAGS.has(variant) ? 600 : isLabel ? 600 : undefined),
    textTransform: isLabel ? "uppercase" : undefined,
    letterSpacing: isLabel ? "0.04em" : undefined,
    margin: HEADING_TAGS.has(variant) || variant === "p" ? 0 : undefined,
    float,
    textAlign,
    display,
    ...resolveSpacing(padding),
    ...resolveMargin(margin),
    ...style,
  };

  return (
    <Tag className={className} style={computedStyle}>
      {children}
    </Tag>
  );
}

// ── SpaceBetween ────────────────────────────────────────────────────────
interface SpaceBetweenProps {
  direction?: "horizontal" | "vertical";
  size?: keyof typeof SPACE | string;
  alignItems?: CSSProperties["alignItems"];
  children?: ReactNode;
  className?: string;
}

export function SpaceBetween({ direction = "vertical", size = "m", alignItems, children, className }: SpaceBetweenProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        flexWrap: direction === "horizontal" ? "wrap" : undefined,
        // Vertical SpaceBetween intentionally leaves cross-axis stretch as the
        // default: Container/Table/Alert etc. rely on it to go full-width.
        // Button opts itself out via `self-start` instead (see Button.tsx).
        alignItems: alignItems ?? (direction === "horizontal" ? "center" : undefined),
        gap: SPACE[size] ?? size,
        width: direction === "vertical" ? "100%" : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────
interface HeaderProps {
  variant?: "h1" | "h2" | "h3";
  counter?: ReactNode;
  description?: ReactNode;
  info?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const HEADER_SIZE: Record<string, number> = { h1: 20, h2: 15, h3: 13 };

export function Header({ variant = "h2", counter, description, info, actions, children, className }: HeaderProps) {
  const Tag: any = variant;
  return (
    <div className={className} style={{ display: "flex", alignItems: description ? "flex-start" : "center", justifyContent: "space-between", gap: 16, width: "100%" }}>
      <div style={{ minWidth: 0 }}>
        <Tag style={{ margin: 0, fontSize: HEADER_SIZE[variant], fontWeight: 600, color: "var(--sh-ink)", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)" }}>
          <span>{children}</span>
          {counter && <span style={{ fontWeight: 400, color: "var(--sh-faint)", fontSize: "0.8em" }}>{counter}</span>}
          {info && <span style={{ fontWeight: 400 }}>{info}</span>}
        </Tag>
        {description && (
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--sh-dim)" }}>{description}</div>
        )}
      </div>
      {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// ── Container ───────────────────────────────────────────────────────────
interface ContainerProps {
  header?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Container({ header, children, className }: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--sh-surface)",
        border: "1px solid var(--sh-line)",
        borderRadius: 8,
      }}
    >
      {header && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--sh-line)" }}>
          {header}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

// ── ContentLayout ───────────────────────────────────────────────────────
interface ContentLayoutProps {
  header?: ReactNode;
  breadcrumbs?: ReactNode;
  children?: ReactNode;
}

export function ContentLayout({ header, breadcrumbs, children }: ContentLayoutProps) {
  return (
    <div className="tw:p-6 tw:max-w-[1280px] tw:mx-auto" style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "var(--font-ui)" }}>
      {breadcrumbs}
      {header}
      {children}
    </div>
  );
}

// ── ColumnLayout ────────────────────────────────────────────────────────
interface ColumnLayoutProps {
  columns?: number;
  variant?: "default" | "text-grid";
  borders?: "none" | "vertical" | "horizontal" | "all";
  children?: ReactNode;
  className?: string;
}

export function ColumnLayout({ columns = 2, children, className }: ColumnLayoutProps) {
  return (
    <div
      className={className}
      style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 20 }}
    >
      {children}
    </div>
  );
}

// ── BreadcrumbGroup ─────────────────────────────────────────────────────
interface BreadcrumbItem {
  text: string;
  href: string;
}

interface BreadcrumbEvent {
  detail: { href: string };
  preventDefault: () => void;
}

interface BreadcrumbGroupProps {
  items: BreadcrumbItem[];
  onFollow?: (e: BreadcrumbEvent) => void;
}

export function BreadcrumbGroup({ items, onFollow }: BreadcrumbGroupProps) {
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "var(--font-ui)" }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.href + i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <ChevronRightIcon className="tw:w-3 tw:h-3" style={{ color: "var(--sh-faint)" }} />}
            {isLast ? (
              <span style={{ color: "var(--sh-dim)" }}>{item.text}</span>
            ) : (
              <a
                href={item.href}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  onFollow?.({ detail: { href: item.href }, preventDefault: () => e.preventDefault() });
                }}
                style={{ color: "var(--sh-faint)", textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; }}
              >
                {item.text}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
