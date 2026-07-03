import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { getServiceLabel } from "../types/services";
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

  // Three visual states: active (has resources) > running (idle) > unavailable.
  const borderColor = isActive ? "var(--sh-accent)" : isRunning ? "var(--sh-line)" : "var(--sh-line)";
  const textColor = isRunning ? "var(--sh-ink)" : "var(--sh-faint)";
  const background = isActive ? "var(--sh-accent-bg)" : "var(--sh-surface)";

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
      className="tw:group tw:relative tw:flex tw:items-center tw:gap-2 tw:cursor-pointer tw:select-none tw:outline-none tw:transition-all tw:duration-100"
      style={{
        padding: "9px 10px 9px 10px",
        background,
        border: "1px solid var(--sh-line)",
        borderLeft: `2px solid ${borderColor}`,
        borderRadius: "5px",
        fontFamily: "var(--font-ui)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isActive ? "var(--sh-accent-bg)" : "var(--sh-elevated)";
        e.currentTarget.style.borderLeftColor = isActive ? "var(--sh-accent)" : "var(--sh-dim)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = background;
        e.currentTarget.style.borderLeftColor = borderColor;
      }}
    >
      {/* Label */}
      <span className="tw:flex-1 tw:truncate tw:text-[12px] tw:font-medium" style={{ color: textColor }}>
        {label}
      </span>

      {/* Resource count badge — only shown for services with real data */}
      {isActive && !!resourceCount && (
        <span
          className="tw:flex-shrink-0"
          style={{
            fontSize: "10px",
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

      {/* Star */}
      <button
        onClick={handleStar}
        onKeyDown={handleStarKey}
        aria-label={fav ? `Unstar ${label}` : `Star ${label}`}
        className="tw:flex-shrink-0 tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:duration-100 tw:p-0.5 tw:rounded tw:bg-transparent tw:border-0 tw:cursor-pointer"
        style={{
          opacity: fav ? 1 : undefined,
          color: fav ? "var(--sh-warn)" : "var(--sh-faint)",
        }}
      >
        {fav
          ? <StarIcon className="tw:w-3 tw:h-3" />
          : <StarIconOutline className="tw:w-3 tw:h-3" />
        }
      </button>
    </div>
  );
}
