import { useNavigate } from "react-router-dom";
import { getServiceLabel } from "../types/services";
import { useFavorites } from "../stores/favorites";

interface Props {
  serviceKey: string;
  status: "running" | "available";
}

const STAR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>';

export default function ServiceCard({ serviceKey, status }: Props) {
  const navigate = useNavigate();
  const label = getServiceLabel(serviceKey);
  const isRunning = status === "running";
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(serviceKey);

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
      aria-label={`Open ${label}`}
      className="tw-group tw-relative tw-flex tw-items-center tw-gap-2.5 tw-cursor-pointer tw-select-none tw-outline-none tw-transition-all tw-duration-100"
      style={{
        padding: "9px 12px 9px 10px",
        background: "var(--sh-surface)",
        border: "1px solid var(--sh-line)",
        borderLeft: `2px solid ${isRunning ? "var(--sh-ok)" : "var(--sh-line)"}`,
        borderRadius: "5px",
        fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--sh-elevated)";
        e.currentTarget.style.borderLeftColor = isRunning ? "var(--sh-ok)" : "var(--sh-dim)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--sh-surface)";
        e.currentTarget.style.borderLeftColor = isRunning ? "var(--sh-ok)" : "var(--sh-line)";
      }}
    >
      {/* Label */}
      <span className="tw-flex-1 tw-truncate tw-text-[12px] tw-font-medium"
            style={{ color: isRunning ? "var(--sh-ink)" : "var(--sh-dim)" }}>
        {label}
      </span>

      {/* Star */}
      <button
        onClick={handleStar}
        onKeyDown={handleStarKey}
        aria-label={fav ? `Unstar ${label}` : `Star ${label}`}
        className="tw-flex-shrink-0 tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-100 tw-p-0.5 tw-rounded tw-bg-transparent tw-border-0 tw-cursor-pointer"
        style={{
          opacity: fav ? 1 : undefined,
          color: fav ? "var(--sh-warn)" : "var(--sh-faint)",
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: STAR_SVG }}
              style={{ width: 11, height: 11, display: "block" }} />
      </button>
    </div>
  );
}
