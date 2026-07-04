import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { getServiceLabel, SERVICE_CATEGORY_MAP } from "../types/services";
import { getCategoryIcon, getCategoryColor, getCategoryColorBg } from "./categoryIcons";
import { useFavorites } from "../stores/favorites";

interface Props {
  serviceKey: string;
  status: "running" | "available";
  /** Whether this service currently has any resources provisioned. */
  isActive?: boolean;
  /** Total resource count for this service, shown as a small badge when > 0. */
  resourceCount?: number;
}

export default function ServiceCard({ serviceKey, status, isActive, resourceCount }: Props) {
  const label = getServiceLabel(serviceKey);
  const isRunning = status === "running";
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(serviceKey);
  const category = SERVICE_CATEGORY_MAP[serviceKey] || "Other";
  const Icon = getCategoryIcon(category);
  // Icon badge uses a fixed per-category color so services are identifiable
  // by category at a glance; it dims when unavailable to keep status legible.
  const categoryColor = getCategoryColor(category);
  const categoryColorBg = getCategoryColorBg(category);

  // Running is the default/expected state for nearly every service here, so
  // it stays quiet (no badge, no colored border) — only the exceptions get
  // decorated: active (has resources) takes priority in blue, then
  // not-running in red, the thing actually worth noticing at a glance.
  const textColor = isRunning ? "var(--sh-ink)" : "var(--sh-faint)";
  const borderColor = isActive ? "var(--sh-accent)" : !isRunning ? "var(--sh-fail)" : "var(--sh-line)";

  const handleStar = (e: React.MouseEvent) => {
    // The star button is nested inside the card's <Link> (a real <a>) below —
    // stopPropagation alone won't stop the anchor's default "follow link"
    // action, so preventDefault is required too.
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(serviceKey);
  };
  const handleStarKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); e.stopPropagation();
      toggleFavorite(serviceKey);
    }
  };

  return (
    // A real <Link>/<a>, not a div+onClick — that's what makes ctrl/cmd/
    // middle-click and "Open in new tab" work; a plain div click handler has
    // no href for the browser to open.
    <Link
      to={`/services/${serviceKey}`}
      aria-label={`Open ${label}${isActive ? " (active)" : ""}`}
      className="tw:group tw:relative tw:flex tw:flex-col tw:gap-2 tw:cursor-pointer tw:select-none tw:outline-none tw:transition-all tw:duration-100"
      style={{
        padding: "10px 12px",
        background: isActive ? "var(--sh-accent-bg)" : "var(--sh-surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        fontFamily: "var(--font-ui)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--sh-accent)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Row 1: icon badge + label + resource count + star. The count badge
          used to live in a second row by itself — since running (the common
          case) has nothing else to show there, that made cards with a count
          unnecessarily two lines tall next to their one-line siblings.
          Folding it in here keeps every running card a single line. */}
      <div className="tw:flex tw:items-center tw:gap-2">
        <span
          className="tw:flex tw:items-center tw:justify-center tw:flex-shrink-0"
          style={{
            width: 22, height: 22, borderRadius: 6,
            background: categoryColorBg,
            color: categoryColor,
            opacity: isRunning ? 1 : 0.55,
          }}
        >
          <Icon className="tw:w-3 tw:h-3" />
        </span>
        <span className="tw:flex-1 tw:truncate tw:text-[0.75rem] tw:font-medium" style={{ color: textColor }}>
          {label}
        </span>

        {isActive && !!resourceCount && (
          <span
            className="tw:flex-shrink-0"
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: "var(--sh-accent)",
              background: "var(--sh-bg)",
              border: "1px solid var(--sh-accent)",
              borderRadius: "999px",
              padding: "1px 6px",
              lineHeight: 1.4,
            }}
          >
            {resourceCount}
          </span>
        )}

        <button
          onClick={handleStar}
          onKeyDown={handleStarKey}
          aria-label={fav ? `Unstar ${label}` : `Star ${label}`}
          className="tw:flex-shrink-0 tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:duration-100 tw:p-0.5 tw:rounded tw:bg-transparent tw:border-0 tw:cursor-pointer"
          style={{
            opacity: fav ? 1 : undefined,
            color: fav ? "var(--sh-star)" : "var(--sh-faint)",
          }}
        >
          {fav
            ? <StarIcon className="tw:w-3 tw:h-3" />
            : <StarIconOutline className="tw:w-3 tw:h-3" />
          }
        </button>
      </div>

      {/* Row 2: only rendered for the not-running exception (red pill,
          matching the card's red outline) — the common running case has
          nothing left to show here, so it no longer reserves a second line
          at all. */}
      {!isRunning && (
        <div className="tw:flex tw:items-center" style={{ paddingLeft: 30 }}>
          <span
            className="tw:flex-shrink-0"
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: "var(--sh-fail)",
              border: "1px solid var(--sh-fail)",
              borderRadius: "999px",
              padding: "1px 7px",
              lineHeight: 1.4,
            }}
          >
            Available
          </span>
        </div>
      )}
    </Link>
  );
}
