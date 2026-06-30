import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { getServiceLabel } from "../types/services";
import { useFavorites } from "../stores/favorites";

interface Props {
  serviceKey: string;
  status: "running" | "available";
}

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
        {fav
          ? <StarIcon className="tw-w-3 tw-h-3" />
          : <StarIconOutline className="tw-w-3 tw-h-3" />
        }
      </button>
    </div>
  );
}
