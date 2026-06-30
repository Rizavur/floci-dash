import { useNavigate } from "react-router-dom";
import { Box } from "@cloudscape-design/components";
import { getServiceLabel } from "../types/services";
import { useFavorites } from "../stores/favorites";

interface Props {
  serviceKey: string;
  status: "running" | "available";
}

const STAR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.9L8 12.4 3.7 14.6l.8-4.9L1 6.3l4.8-.8z"/></svg>';

export default function ServiceCard({ serviceKey, status }: Props) {
  const navigate = useNavigate();
  const label = getServiceLabel(serviceKey);
  const isRunning = status === "running";
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(serviceKey);

  const handleClick = () => navigate(`/services/${serviceKey}`);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/services/${serviceKey}`);
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(serviceKey);
  };

  const handleStarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
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
      className={[
        "fd-accent-card",
        isRunning ? "fd-accent-success" : "fd-accent-warning",
        // Tailwind: lift + shadow on hover; GPU-composited transition avoids layout shift
        "tw-cursor-pointer tw-select-none tw-outline-none",
        "tw-transition-all tw-duration-150 tw-ease-out",
        "hover:tw--translate-y-px hover:tw-shadow-md",
        "tw-flex tw-items-center tw-gap-3",
      ].join(" ")}
    >
      {/* Status dot */}
      <span
        className="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-shrink-0"
        style={{
          backgroundColor: "currentColor",
          boxShadow: "0 0 6px currentColor",
        }}
      />

      {/* Label */}
      <div className="tw-flex-1 tw-min-w-0">
        <Box variant="p" fontWeight="bold">{label}</Box>
      </div>

      {/* Favourite star */}
      <button
        onClick={handleStarClick}
        onKeyDown={handleStarKeyDown}
        aria-label={fav ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
        className={[
          "tw-shrink-0 tw-p-1 tw-rounded",
          "tw-bg-transparent tw-border-0 tw-cursor-pointer",
          "tw-transition-opacity tw-duration-150",
          fav
            ? "tw-opacity-100"
            : "tw-opacity-40 hover:tw-opacity-100",
        ].join(" ")}
        style={{
          color: fav
            ? "var(--color-text-status-warning)"
            : "var(--color-text-body-secondary)",
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: STAR_SVG }}
          className="tw-block tw-w-3.5 tw-h-3.5"
        />
      </button>
    </div>
  );
}
