import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHealth, useActiveServices } from "../hooks/useSystem";
import { useSettings } from "../stores/settings";
import { useFavorites } from "../stores/favorites";
import { useRecentlyVisited } from "../hooks/useRecentlyVisited";
import {
  SERVICE_LABELS,
  CATEGORY_ORDER,
  SERVICE_CATEGORY_MAP,
  getServiceLabel,
} from "../types/services";

interface Props { children: React.ReactNode }

// ── Icons (inline SVG, no dependency) ─────────────────────────────────────

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"
       style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
    <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const IconStar = ({ filled }: { filled: boolean }) => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"}
       stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
  </svg>
);

const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
  </svg>
);

const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
  </svg>
);

const IconMenu = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const IconSettings = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.892 3.434-.901 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.892-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.474l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
  </svg>
);

// ── Nav item component ─────────────────────────────────────────────────────

interface NavItemProps {
  label: string;
  serviceKey: string;
  status?: "running" | "available";
  active: boolean;
  fav?: boolean;
  onNavigate: (key: string) => void;
  onToggleFav?: (e: React.MouseEvent, key: string) => void;
}

function NavItem({ label, serviceKey, status, active, fav, onNavigate, onToggleFav }: NavItemProps) {
  const isRunning = status === "running";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(serviceKey)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate(serviceKey); } }}
      className="tw-group tw-relative tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-cursor-pointer tw-select-none tw-rounded-[4px] tw-transition-colors tw-duration-100"
      style={{
        background: active ? "var(--sh-accent-bg)" : "transparent",
        color: active ? "var(--sh-accent)" : "var(--sh-dim)",
        outline: "none",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--sh-hover)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Active indicator */}
      {active && (
        <span className="tw-absolute tw-left-0 tw-top-1 tw-bottom-1 tw-w-[2px] tw-rounded-full"
              style={{ background: "var(--sh-accent)" }} />
      )}

      {/* Status dot */}
      <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-flex-shrink-0"
            style={{ background: isRunning ? "var(--sh-ok)" : "var(--sh-faint)" }} />

      {/* Label */}
      <span className="tw-flex-1 tw-text-[12px] tw-leading-none tw-truncate tw-font-medium"
            style={{ color: active ? "var(--sh-accent)" : "var(--sh-dim)", fontFamily: "var(--font-sans)" }}>
        {label}
      </span>

      {/* Favourite star — show on hover or when starred */}
      {onToggleFav && (
        <button
          onClick={(e) => onToggleFav(e, serviceKey)}
          className="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-100 tw-p-0.5 tw-rounded"
          style={{
            opacity: fav ? 1 : undefined,
            color: fav ? "var(--sh-warn)" : "var(--sh-faint)",
            background: "transparent", border: "none", cursor: "pointer",
          }}
          aria-label={fav ? `Unstar ${label}` : `Star ${label}`}
        >
          <IconStar filled={!!fav} />
        </button>
      )}
    </div>
  );
}

// ── Main shell ─────────────────────────────────────────────────────────────

export default function AppLayoutShell({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useSettings();
  const { data: health } = useHealth();
  const { data: active } = useActiveServices();
  const favorites = useFavorites((s) => s.favorites);
  const { toggleFavorite, isFavorite } = useFavorites();
  const recentlyVisited = useRecentlyVisited((s) => s.recentlyVisited);
  const [navQuery, setNavQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Apply dark mode ──────────────────────────────────────────────────────
  useEffect(() => {
    // Keep Cloudscape dark mode in sync (for tables/forms in service pages)
    if (darkMode) {
      document.body.classList.add("awsui-dark-mode");
    } else {
      document.body.classList.remove("awsui-dark-mode");
    }
  }, [darkMode]);

  // ── Track navigation for recently visited ───────────────────────────────
  useEffect(() => {
    const match = location.pathname.match(/^\/services\/([^/]+)/);
    if (match) useRecentlyVisited.getState().addVisited(match[1]);
  }, [location.pathname]);

  // ── Build navigation tree ───────────────────────────────────────────────
  const services = health?.services ?? {};
  const activeSet = new Set(active?.activeServices ?? []);

  const toggleCollapse = useCallback((cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const handleToggleFav = useCallback((e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    toggleFavorite(key);
  }, [toggleFavorite]);

  const handleNavigate = useCallback((key: string) => {
    const path = `/services/${key}`;
    navigate(path);
    setSidebarOpen(false);
  }, [navigate]);

  const query = navQuery.trim().toLowerCase();

  // Grouped service list
  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const key of Object.keys(services)) {
      const cat = SERVICE_CATEGORY_MAP[key] || "Other";
      (groups[cat] ??= []).push(key);
    }
    return groups;
  }, [services]);

  const orderedCategories = useMemo(() => {
    const cats: string[] = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
    if (grouped["Other"]?.length) cats.push("Other");
    return cats;
  }, [grouped]);

  // Filtered view when searching
  const searchResults = useMemo(() => {
    if (!query) return null;
    return Object.keys(services)
      .filter((k) => (SERVICE_LABELS[k] || k).toLowerCase().includes(query))
      .sort((a, b) => (SERVICE_LABELS[a] || a).localeCompare(SERVICE_LABELS[b] || b));
  }, [query, services]);

  // Active service key
  const activeKey = location.pathname.match(/^\/services\/([^/]+)/)?.[1] ?? "";

  // Health summary
  const running = health?.stats.running ?? 0;
  const total = health?.stats.total ?? 0;
  const version = health?.version ?? "—";

  // ── Sidebar content ──────────────────────────────────────────────────────
  const SidebarContent = (
    <div className="tw-flex tw-flex-col tw-h-full" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3"
           style={{ borderBottom: "1px solid var(--sh-line)" }}>
        <button
          onClick={() => navigate("/")}
          className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-bg-transparent tw-border-0 tw-p-0"
        >
          <span className="tw-inline-flex tw-items-center tw-justify-center tw-w-[22px] tw-h-[22px] tw-rounded-[5px] tw-text-[11px] tw-font-bold"
                style={{ background: "var(--sh-accent)", color: "#0d1117" }}>
            F
          </span>
          <span className="tw-text-[13px] tw-font-semibold" style={{ color: "var(--sh-ink)" }}>
            Floci Dash
          </span>
        </button>

        {/* Health pill */}
        <span className="tw-flex tw-items-center tw-gap-1 tw-text-[10px] tw-font-mono tw-px-1.5 tw-py-0.5 tw-rounded"
              style={{
                color: running === total && total > 0 ? "var(--sh-ok)" : "var(--sh-warn)",
                background: "var(--sh-elevated)",
                border: "1px solid var(--sh-line)",
              }}>
          <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-flex-shrink-0"
                style={{ background: running === total && total > 0 ? "var(--sh-ok)" : "var(--sh-warn)" }} />
          {running}/{total}
        </span>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="tw-px-3 tw-pt-3 tw-pb-2">
        <div className="tw-relative">
          <span className="tw-absolute tw-left-2.5 tw-top-1/2 tw--translate-y-1/2" style={{ color: "var(--sh-faint)" }}>
            <IconSearch />
          </span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search services…"
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setNavQuery(""); }}
            className="tw-w-full tw-pl-7 tw-pr-3 tw-py-1.5 tw-text-[12px] tw-rounded-[5px] tw-outline-none"
            style={{
              background: "var(--sh-elevated)",
              border: "1px solid var(--sh-line)",
              color: "var(--sh-ink)",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>
      </div>

      {/* ── Nav list (scrollable) ────────────────────────────────── */}
      <nav className="tw-flex-1 tw-overflow-y-auto tw-px-2 tw-pb-2"
           style={{ scrollbarWidth: "none" }}>

        {/* Search results */}
        {searchResults !== null && (
          <div>
            <p className="tw-px-2 tw-pt-2 tw-pb-1 tw-text-[10px] tw-uppercase tw-tracking-widest tw-font-semibold"
               style={{ color: "var(--sh-faint)", fontFamily: "var(--font-mono)" }}>
              {searchResults.length ? `${searchResults.length} match${searchResults.length !== 1 ? "es" : ""}` : "No matches"}
            </p>
            {searchResults.map((key) => (
              <NavItem key={key} serviceKey={key} label={getServiceLabel(key)}
                       status={services[key]} active={activeKey === key}
                       fav={isFavorite(key)} onNavigate={handleNavigate}
                       onToggleFav={handleToggleFav} />
            ))}
          </div>
        )}

        {/* Normal view */}
        {searchResults === null && (
          <>
            {/* Dashboard link */}
            <div
              role="button" tabIndex={0}
              onClick={() => { navigate("/"); setSidebarOpen(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { navigate("/"); setSidebarOpen(false); } }}
              className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-mb-1 tw-cursor-pointer tw-rounded-[4px] tw-transition-colors tw-duration-100 tw-text-[12px] tw-font-medium"
              style={{
                background: location.pathname === "/" ? "var(--sh-accent-bg)" : "transparent",
                color: location.pathname === "/" ? "var(--sh-accent)" : "var(--sh-dim)",
                outline: "none",
              }}
              onMouseEnter={(e) => { if (location.pathname !== "/") e.currentTarget.style.background = "var(--sh-hover)"; }}
              onMouseLeave={(e) => { if (location.pathname !== "/") e.currentTarget.style.background = "transparent"; }}
            >
              <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full"
                    style={{ background: location.pathname === "/" ? "var(--sh-accent)" : "var(--sh-faint)" }} />
              Dashboard
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="tw-mb-1">
                <p className="tw-px-2 tw-pt-2 tw-pb-1 tw-text-[10px] tw-uppercase tw-tracking-widest tw-font-semibold"
                   style={{ color: "var(--sh-faint)", fontFamily: "var(--font-mono)" }}>
                  Starred
                </p>
                {favorites
                  .filter((k) => k in services)
                  .map((key) => (
                    <NavItem key={key} serviceKey={key} label={getServiceLabel(key)}
                             status={services[key]} active={activeKey === key}
                             fav onNavigate={handleNavigate}
                             onToggleFav={handleToggleFav} />
                  ))}
              </div>
            )}

            {/* Recently visited */}
            {recentlyVisited.filter((k) => k in services).length > 0 && (
              <div className="tw-mb-1">
                <p className="tw-px-2 tw-pt-2 tw-pb-1 tw-text-[10px] tw-uppercase tw-tracking-widest tw-font-semibold"
                   style={{ color: "var(--sh-faint)", fontFamily: "var(--font-mono)" }}>
                  Recent
                </p>
                {recentlyVisited
                  .filter((k) => k in services)
                  .slice(0, 5)
                  .map((key) => (
                    <NavItem key={key} serviceKey={key} label={getServiceLabel(key)}
                             status={services[key]} active={activeKey === key}
                             fav={isFavorite(key)} onNavigate={handleNavigate}
                             onToggleFav={handleToggleFav} />
                  ))}
              </div>
            )}

            {/* Divider before categories */}
            <div className="tw-my-2 tw-mx-2" style={{ height: "1px", background: "var(--sh-line-sub)" }} />

            {/* Categories */}
            {orderedCategories.map((cat) => {
              const keys = (grouped[cat] || []).sort((a, b) =>
                (SERVICE_LABELS[a] || a).localeCompare(SERVICE_LABELS[b] || b)
              );
              const isOpen = !collapsed.has(cat);
              return (
                <div key={cat} className="tw-mb-0.5">
                  <button
                    onClick={() => toggleCollapse(cat)}
                    className="tw-flex tw-items-center tw-gap-1.5 tw-w-full tw-px-2 tw-py-1.5 tw-cursor-pointer tw-rounded-[3px]"
                    style={{
                      background: "transparent", border: "none",
                      color: "var(--sh-faint)", fontFamily: "var(--font-mono)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-dim)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; }}
                  >
                    <span style={{ flexShrink: 0 }}><IconChevron open={isOpen} /></span>
                    <span className="tw-text-[10px] tw-uppercase tw-tracking-widest tw-font-semibold tw-truncate">
                      {cat}
                    </span>
                    <span className="tw-ml-auto tw-text-[10px] tw-font-mono">{keys.length}</span>
                  </button>

                  {isOpen && (
                    <div>
                      {keys.map((key) => (
                        <NavItem key={key} serviceKey={key} label={getServiceLabel(key)}
                                 status={services[key]} active={activeKey === key}
                                 fav={isFavorite(key)} onNavigate={handleNavigate}
                                 onToggleFav={handleToggleFav} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </nav>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2"
           style={{ borderTop: "1px solid var(--sh-line)" }}>
        <button
          onClick={() => navigate("/settings")}
          className="tw-flex tw-items-center tw-gap-1.5 tw-text-[11px] tw-cursor-pointer tw-rounded-[4px] tw-px-2 tw-py-1 tw-bg-transparent tw-border-0 tw-transition-colors"
          style={{ color: "var(--sh-faint)", fontFamily: "var(--font-sans)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-dim)"; e.currentTarget.style.background = "var(--sh-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; e.currentTarget.style.background = "transparent"; }}
        >
          <IconSettings /> Settings
        </button>

        <button
          onClick={toggleDarkMode}
          className="tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-rounded-[4px] tw-cursor-pointer tw-bg-transparent tw-border-0 tw-transition-colors"
          style={{ color: "var(--sh-faint)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sh-hover)"; e.currentTarget.style.color = "var(--sh-dim)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sh-faint)"; }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </div>
  );

  // ── Shell ─────────────────────────────────────────────────────────────────
  return (
    <div
      id="app-shell"
      className={`tw-flex tw-h-screen tw-overflow-hidden${darkMode ? "" : " light"}`}
      style={{ background: "var(--sh-bg)", fontFamily: "var(--font-sans)" }}
    >
      {/* ── Skip link ─────────────────────────────────────────── */}
      <a href="#main-content" className="fd-skip-link">Skip to content</a>

      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside
        className="tw-hidden md:tw-flex tw-flex-col tw-w-[220px] tw-flex-shrink-0 tw-h-full"
        style={{ background: "var(--sh-surface)", borderRight: "1px solid var(--sh-line)" }}
      >
        {SidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ────────────────────────────── */}
      {sidebarOpen && (
        <div className="md:tw-hidden tw-fixed tw-inset-0 tw-z-50 tw-flex">
          <div
            className="tw-absolute tw-inset-0"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="tw-relative tw-w-[220px] tw-h-full tw-flex tw-flex-col"
            style={{ background: "var(--sh-surface)", borderRight: "1px solid var(--sh-line)" }}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="tw-flex-1 tw-flex tw-flex-col tw-overflow-hidden">

        {/* Mobile topbar */}
        <div className="md:tw-hidden tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-flex-shrink-0"
             style={{ background: "var(--sh-surface)", borderBottom: "1px solid var(--sh-line)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded tw-cursor-pointer tw-bg-transparent tw-border-0"
            style={{ color: "var(--sh-dim)" }}
          >
            <IconMenu />
          </button>
          <span className="tw-text-[13px] tw-font-semibold" style={{ color: "var(--sh-ink)" }}>
            Floci Dash
          </span>
          <span className="tw-ml-auto tw-font-mono tw-text-[11px]" style={{ color: "var(--sh-ok)" }}>
            v{version}
          </span>
        </div>

        {/* Page content */}
        <main
          id="main-content"
          className="tw-flex-1 tw-overflow-auto"
          style={{ background: "var(--sh-bg)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
