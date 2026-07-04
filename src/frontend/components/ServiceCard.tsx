import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  // Three visual states: active (has resources) > running (idle) > unavailable.
  const accent = isActive ? "var(--sh-accent)" : isRunning ? "var(--sh-ok)" : "var(--sh-faint)";
  const textColor = isRunning ? "var(--sh-ink)" : "var(--sh-faint)";

  const handleClick = () => navigate(`/services/${serviceKey}`);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); }
  };
  const handleStar = (e: React.MouseEvent) => {
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
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${label}${isActive ? " (active)" : ""}`}
      className="tw:group tw:relative tw:flex tw:flex-col tw:gap-2 tw:cursor-pointer tw:select-none tw:outline-none tw:transition-all tw:duration-100"
      style={{
        padding: "10px 12px",
        background: isActive ? "var(--sh-accent-bg)" : "var(--sh-surface)",
        border: `1px solid ${isActive ? "var(--sh-accent)" : "var(--sh-line)"}`,
        borderRadius: "8px",
        fontFamily: "var(--font-ui)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--sh-accent)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isActive ? "var(--sh-accent)" : "var(--sh-line)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Row 1: icon badge + label + star */}
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

      {/* Row 2: status dot + text + resource count badge */}
      <div className="tw:flex tw:items-center tw:gap-1.5" style={{ paddingLeft: 30 }}>
        <span className="tw:flex-shrink-0 tw:w-1.5 tw:h-1.5 tw:rounded-full" style={{ background: accent }} />
        <span style={{ fontSize: "0.625rem", color: "var(--sh-faint)", fontFamily: "var(--font-mono)" }}>
          {isRunning ? "Running" : "Available"}
        </span>

        {/* Resource count badge — only shown for services with real data */}
        {isActive && !!resourceCount && (
          <span
            className="tw:ml-auto tw:flex-shrink-0"
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
      </div>
    </div>
  );
}
