import type { ReactNode, MouseEvent } from "react";
import { resolveIcon } from "./icons";
import { Spinner } from "./Feedback";

type ButtonVariant = "primary" | "normal" | "link" | "icon" | "inline-icon" | "inline-link";

interface ButtonProps {
  variant?: ButtonVariant;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Alias for onClick, matching a Link-style API used by a few call sites. */
  onFollow?: () => void;
  loading?: boolean;
  disabled?: boolean;
  iconName?: string;
  ariaLabel?: string;
  /** Style a "primary" button as a destructive action (red) instead of the accent color. */
  danger?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
}

const BASE = "tw:inline-flex tw:items-center tw:justify-center tw:gap-1.5 tw:cursor-pointer tw:select-none tw:whitespace-nowrap tw:transition-colors tw:duration-100 tw:text-[0.75rem] tw:font-medium tw:rounded-[5px] tw:border tw:disabled:tw:cursor-not-allowed tw:disabled:tw:opacity-50";

// Normalize variant aliases to their base visual style.
function normalize(variant: ButtonVariant): "primary" | "normal" | "link" | "icon" {
  if (variant === "inline-icon") return "icon";
  if (variant === "inline-link") return "link";
  return variant;
}

function variantStyle(variant: ButtonVariant, disabled?: boolean, danger?: boolean) {
  switch (normalize(variant)) {
    case "primary":
      return {
        className: `${BASE} tw:px-3 tw:py-1.5 tw:border-transparent`,
        style: { background: disabled ? "var(--sh-faint)" : danger ? "var(--sh-fail)" : "var(--sh-accent)", color: "var(--sh-bg)" },
      };
    case "link":
      return {
        className: `${BASE} tw:px-1 tw:py-0.5 tw:border-transparent tw:bg-transparent`,
        style: { color: "var(--sh-accent)" },
      };
    case "icon":
      return {
        className: `${BASE} tw:w-7 tw:h-7 tw:p-0 tw:border-transparent tw:bg-transparent`,
        style: { color: "var(--sh-dim)" },
      };
    case "normal":
    default:
      return {
        className: `${BASE} tw:px-3 tw:py-1.5`,
        style: { background: "var(--sh-elevated)", borderColor: "var(--sh-line)", color: "var(--sh-ink)" },
      };
  }
}

export function Button({
  variant = "normal", onClick, onFollow, loading, disabled, iconName, ariaLabel, danger,
  href, target, rel, type = "button", fullWidth, children, className,
}: ButtonProps) {
  const base = normalize(variant);
  const isIconOnly = base === "icon";
  const isDestructive = (base === "icon" && iconName === "remove") || (base === "primary" && danger);
  const Icon = resolveIcon(iconName);
  const { className: variantClassName, style } = variantStyle(variant, disabled, danger);
  const isDisabled = disabled || loading;
  const handleClick = onClick ?? (onFollow ? () => onFollow() : undefined);
  const content = (
    <>
      {loading ? (
        <Spinner size="normal" />
      ) : (
        Icon && <Icon className={isIconOnly ? "tw:w-4 tw:h-4" : "tw:w-3.5 tw:h-3.5"} />
      )}
      {!isIconOnly && children}
    </>
  );

  // w-fit (not self-start): a lone Button inside a vertical SpaceBetween
  // (which defaults its children to align-items: stretch for other
  // full-width content like Container/Table) would otherwise get stretched
  // to the parent's full width. w-fit constrains the button's own size
  // instead of overriding align-self, so horizontal button rows (e.g. a
  // modal's Cancel/Delete footer) still get vertically centered against
  // each other via the parent's align-items: center — self-start pinned
  // every button to the cross-axis start instead, making shorter buttons
  // (e.g. the "link" variant Cancel) sit visibly higher than taller ones.
  const widthClass = fullWidth ? "tw:w-full" : isIconOnly ? "" : "tw:w-fit";
  const mergedClassName = `${variantClassName} ${widthClass} ${className ?? ""}`.trim();

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        aria-label={ariaLabel}
        className={mergedClassName}
        style={style}
        onClick={isDisabled ? (e) => e.preventDefault() : handleClick}
        onMouseEnter={(e) => { if (base === "normal" && !isDisabled) e.currentTarget.style.background = "var(--sh-hover)"; if (base === "icon" && !isDisabled) { e.currentTarget.style.background = isDestructive ? "var(--sh-fail-bg)" : "var(--sh-hover)"; e.currentTarget.style.color = isDestructive ? "var(--sh-fail)" : "var(--sh-ink)"; } }}
        onMouseLeave={(e) => { if (base === "normal") e.currentTarget.style.background = "var(--sh-elevated)"; if (base === "icon") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sh-dim)"; } }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={mergedClassName}
      style={style}
      onMouseEnter={(e) => { if (isDisabled) return; if (base === "normal") e.currentTarget.style.background = "var(--sh-hover)"; if (base === "icon") { e.currentTarget.style.background = isDestructive ? "var(--sh-fail-bg)" : "var(--sh-hover)"; e.currentTarget.style.color = isDestructive ? "var(--sh-fail)" : "var(--sh-ink)"; } if (base === "primary") e.currentTarget.style.opacity = "0.9"; }}
      onMouseLeave={(e) => { if (base === "normal") e.currentTarget.style.background = "var(--sh-elevated)"; if (base === "icon") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sh-dim)"; } if (base === "primary") e.currentTarget.style.opacity = "1"; }}
    >
      {content}
    </button>
  );
}
