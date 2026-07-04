// ─────────────────────────────────────────────────────────────────────────
// Shared design-token helpers for the custom UI kit (components/ui/*).
// These map Cloudscape-style token strings (spacing sizes, color names,
// font sizes) onto the CSS custom properties defined in styles/dashboard.css
// (--sh-*), keeping every replacement component visually consistent with
// the hand-built AppLayoutShell / DashboardHome design.
// ─────────────────────────────────────────────────────────────────────────

export const SPACE: Record<string, string> = {
  n: "0",
  xxxs: "2px",
  xxs: "4px",
  xs: "8px",
  s: "12px",
  m: "16px",
  l: "20px",
  xl: "24px",
  xxl: "32px",
  xxxl: "40px",
};

export const FONT_SIZE: Record<string, string> = {
  "body-s": "0.75rem",
  "body-m": "0.8125rem",
  "heading-xs": "0.8125rem",
  "heading-s": "0.875rem",
  "heading-m": "1rem",
  "heading-l": "1.25rem",
  "heading-xl": "1.5rem",
  "display-l": "2rem",
};

const COLOR_TOKENS: Record<string, string> = {
  inherit: "inherit",
  "text-body-secondary": "var(--sh-dim)",
  "text-label": "var(--sh-faint)",
  "text-status-error": "var(--sh-fail)",
  "text-status-info": "var(--sh-info)",
  "text-status-success": "var(--sh-ok)",
  "text-status-warning": "var(--sh-warn)",
  "text-status-inactive": "var(--sh-faint)",
};

export function resolveColor(token?: string): string | undefined {
  if (!token) return undefined;
  return COLOR_TOKENS[token] ?? token;
}

export function resolveFontSize(token?: string): string | undefined {
  if (!token) return undefined;
  return FONT_SIZE[token] ?? token;
}

type PaddingShorthand =
  | string
  | Partial<Record<"top" | "bottom" | "left" | "right" | "horizontal" | "vertical", string>>;

/** Resolves Cloudscape-style padding/margin props (size token, or per-side object) to CSS. */
export function resolveSpacing(value?: PaddingShorthand): React.CSSProperties {
  if (!value) return {};
  if (typeof value === "string") {
    const size = SPACE[value] ?? value;
    return { padding: size };
  }
  const style: React.CSSProperties = {};
  if (value.horizontal) {
    style.paddingLeft = SPACE[value.horizontal] ?? value.horizontal;
    style.paddingRight = SPACE[value.horizontal] ?? value.horizontal;
  }
  if (value.vertical) {
    style.paddingTop = SPACE[value.vertical] ?? value.vertical;
    style.paddingBottom = SPACE[value.vertical] ?? value.vertical;
  }
  if (value.top) style.paddingTop = SPACE[value.top] ?? value.top;
  if (value.bottom) style.paddingBottom = SPACE[value.bottom] ?? value.bottom;
  if (value.left) style.paddingLeft = SPACE[value.left] ?? value.left;
  if (value.right) style.paddingRight = SPACE[value.right] ?? value.right;
  return style;
}

export function resolveMargin(value?: PaddingShorthand): React.CSSProperties {
  const padding = resolveSpacing(value);
  const margin: React.CSSProperties = {};
  if (padding.padding) margin.margin = padding.padding;
  if (padding.paddingTop) margin.marginTop = padding.paddingTop;
  if (padding.paddingBottom) margin.marginBottom = padding.paddingBottom;
  if (padding.paddingLeft) margin.marginLeft = padding.paddingLeft;
  if (padding.paddingRight) margin.marginRight = padding.paddingRight;
  return margin;
}
