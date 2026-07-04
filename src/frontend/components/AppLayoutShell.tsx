import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  StarIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  Cog6ToothIcon,
} from "@heroicons/react/16/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
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

// Shared icon size — all nav/UI icons at 14×14 px
const IC = "tw:w-3.5 tw:h-3.5 tw:flex-shrink-0";

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
      className="tw:group tw:relative tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:cursor-pointer tw:select-none tw:rounded-[4px] tw:transition-colors tw:duration-100"
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
        <span className="tw:absolute tw:left-0 tw:top-1 tw:bottom-1 tw:w-[2px] tw:rounded-full"
              style={{ background: "var(--sh-accent)" }} />
      )}

      {/* Status dot */}
      <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full tw:flex-shrink-0"
            style={{ background: isRunning ? "var(--sh-ok)" : "var(--sh-faint)" }} />

      {/* Label */}
      <span className="tw:flex-1 tw:text-[12px] tw:leading-none tw:truncate tw:font-medium"
            style={{ color: active ? "var(--sh-accent)" : "var(--sh-dim)", fontFamily: "var(--font-ui)" }}>
        {label}
      </span>

      {/* Favourite star — show on hover or when starred */}
      {onToggleFav && (
        <button
          onClick={(e) => onToggleFav(e, serviceKey)}
          className="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:duration-100 tw:p-0.5 tw:rounded"
          style={{
            opacity: fav ? 1 : undefined,
            color: fav ? "var(--sh-star)" : "var(--sh-faint)",
            background: "transparent", border: "none", cursor: "pointer",
          }}
          aria-label={fav ? `Unstar ${label}` : `Star ${label}`}
        >
          {fav
            ? <StarIcon className={IC} />
            : <StarIconOutline className="tw:w-3.5 tw:h-3.5 tw:flex-shrink-0" />
          }
        </button>
      )}
    </div>
  );
}

interface Props { children: React.ReactNode }

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
  // Active service key, computed early so it can seed the collapsed-categories
  // default below (needs to run before that useState's lazy initializer).
  const activeKey = location.pathname.match(/^\/services\/([^/]+)/)?.[1] ?? "";
  // With 67 services across 13 categories, having every category expanded by
  // default makes the sidebar extremely long. Start with everything collapsed
  // except whichever category the current page belongs to, so context isn't
  // lost — users mostly navigate via Favorites/Recent/Search anyway.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const activeCategory = SERVICE_CATEGORY_MAP[activeKey];
    // ponytail: "Other" is a fallback bucket, not part of CATEGORY_ORDER — include it too, else it never collapses.
    return new Set([...CATEGORY_ORDER, "Other"].filter((c) => c !== activeCategory));
  });
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

  // Health summary
  const running = health?.stats.running ?? 0;
  const total = health?.stats.total ?? 0;
  const version = health?.version ?? "—";

  // ── Sidebar content ──────────────────────────────────────────────────────
  const SidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "var(--font-ui)" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3"
           style={{ borderBottom: "1px solid var(--sh-line)" }}>
        <button
          onClick={() => navigate("/")}
          className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer tw:bg-transparent tw:border-0 tw:p-0"
        >
          <span className="tw:inline-flex tw:items-center tw:justify-center tw:w-[22px] tw:h-[22px] tw:rounded-[5px] tw:text-[11px] tw:font-bold"
                style={{ background: "var(--sh-accent)", color: "var(--sh-bg)" }}>
            F
          </span>
          <span className="tw:text-[13px] tw:font-semibold" style={{ color: "var(--sh-ink)" }}>
            Floci Dash
          </span>
        </button>

        {/* Health pill */}
        <span className="tw:flex tw:items-center tw:gap-1 tw:text-[10px] tw:font-mono tw:px-1.5 tw:py-0.5 tw:rounded"
              style={{
                color: running === total && total > 0 ? "var(--sh-ok)" : "var(--sh-warn)",
                background: "var(--sh-elevated)",
                border: "1px solid var(--sh-line)",
              }}>
          <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full tw:flex-shrink-0"
                style={{ background: running === total && total > 0 ? "var(--sh-ok)" : "var(--sh-warn)" }} />
          {running}/{total}
        </span>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="tw:px-3 tw:pt-3 tw:pb-2">
        <div className="tw:relative">
          <span className="tw:absolute tw:left-2.5 tw:top-1/2 tw:-translate-y-1/2" style={{ color: "var(--sh-faint)" }}>
            <MagnifyingGlassIcon className={IC} />
          </span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search services…"
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setNavQuery(""); }}
            className="tw:w-full tw:pl-7 tw:pr-3 tw:py-1.5 tw:text-[12px] tw:rounded-[5px] tw:outline-none"
            style={{
              background: "var(--sh-elevated)",
              border: "1px solid var(--sh-line)",
              color: "var(--sh-ink)",
              fontFamily: "var(--font-ui)",
            }}
          />
        </div>
      </div>

      {/* ── Nav list (scrollable) ────────────────────────────────── */}
      <nav className="tw:flex-1 tw:overflow-y-auto tw:px-2 tw:pb-2"
           style={{ scrollbarWidth: "none" }}>

        {/* Search results */}
        {searchResults !== null && (
          <div>
            <p className="tw:px-2 tw:pt-2 tw:pb-1 tw:text-[10px] tw:uppercase tw:tracking-widest tw:font-semibold"
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
              className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:mb-1 tw:cursor-pointer tw:rounded-[4px] tw:transition-colors tw:duration-100 tw:text-[12px] tw:font-medium"
              style={{
                background: location.pathname === "/" ? "var(--sh-accent-bg)" : "transparent",
                color: location.pathname === "/" ? "var(--sh-accent)" : "var(--sh-dim)",
                outline: "none",
              }}
              onMouseEnter={(e) => { if (location.pathname !== "/") e.currentTarget.style.background = "var(--sh-hover)"; }}
              onMouseLeave={(e) => { if (location.pathname !== "/") e.currentTarget.style.background = "transparent"; }}
            >
              <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full"
                    style={{ background: location.pathname === "/" ? "var(--sh-accent)" : "var(--sh-faint)" }} />
              Dashboard
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="tw:mb-1">
                <p className="tw:px-2 tw:pt-2 tw:pb-1 tw:text-[10px] tw:uppercase tw:tracking-widest tw:font-semibold"
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
              <div className="tw:mb-1">
                <p className="tw:px-2 tw:pt-2 tw:pb-1 tw:text-[10px] tw:uppercase tw:tracking-widest tw:font-semibold"
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
            <div className="tw:my-2 tw:mx-2" style={{ height: "1px", background: "var(--sh-line-sub)" }} />

            {/* Categories */}
            {orderedCategories.map((cat) => {
              const keys = (grouped[cat] || []).sort((a, b) =>
                (SERVICE_LABELS[a] || a).localeCompare(SERVICE_LABELS[b] || b)
              );
              const isOpen = !collapsed.has(cat);
              return (
                <div key={cat} className="tw:mb-0.5">
                  <button
                    onClick={() => toggleCollapse(cat)}
                    className="tw:flex tw:items-center tw:gap-1.5 tw:w-full tw:px-2 tw:py-1.5 tw:cursor-pointer tw:rounded-[3px]"
                    style={{
                      background: "transparent", border: "none",
                      color: "var(--sh-faint)", fontFamily: "var(--font-mono)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-dim)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; }}
                  >
                    <ChevronRightIcon
                      className={IC}
                      style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                    />
                    <span className="tw:text-[10px] tw:uppercase tw:tracking-widest tw:font-semibold tw:truncate">
                      {cat}
                    </span>
                    <span className="tw:ml-auto tw:text-[10px] tw:font-mono">{keys.length}</span>
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
      <div className="tw:flex tw:items-center tw:justify-between tw:px-3 tw:py-2"
           style={{ borderTop: "1px solid var(--sh-line)" }}>
        <button
          onClick={() => navigate("/settings")}
          className="tw:flex tw:items-center tw:gap-1.5 tw:text-[11px] tw:cursor-pointer tw:rounded-[4px] tw:px-2 tw:py-1 tw:bg-transparent tw:border-0 tw:transition-colors"
          style={{ color: "var(--sh-faint)", fontFamily: "var(--font-ui)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-dim)"; e.currentTarget.style.background = "var(--sh-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; e.currentTarget.style.background = "transparent"; }}
        >
          <Cog6ToothIcon className={IC} /> Settings
        </button>

        <button
          onClick={toggleDarkMode}
          className="tw:flex tw:items-center tw:justify-center tw:w-7 tw:h-7 tw:rounded-[4px] tw:cursor-pointer tw:bg-transparent tw:border-0 tw:transition-colors"
          style={{ color: "var(--sh-faint)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sh-hover)"; e.currentTarget.style.color = "var(--sh-dim)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sh-faint)"; }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <SunIcon className={IC} /> : <MoonIcon className={IC} />}
        </button>
      </div>
    </div>
  );

  // ── Shell ─────────────────────────────────────────────────────────────────
  return (
    <div
      id="app-shell"
      className={darkMode ? "" : "light"}
      // Structural layout uses inline styles so the shell ALWAYS renders
      // correctly regardless of whether Tailwind CSS is emitted.
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--sh-bg)",
        fontFamily: "var(--font-ui)",
      }}
    >
      {/* ── Skip link ─────────────────────────────────────────── */}
      <a href="#main-content" className="fd-skip-link">Skip to content</a>

      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside
        className="tw:hidden tw:md:flex tw:flex-col"
        style={{
          width: 220,
          flexShrink: 0,
          height: "100%",
          background: "var(--sh-surface)",
          borderRight: "1px solid var(--sh-line)",
          // Fallback: show on wider screens even without Tailwind
          display: window.innerWidth >= 768 ? undefined : "none",
        }}
      >
        {SidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            style={{
              position: "relative", width: 220, height: "100%",
              display: "flex", flexDirection: "column",
              background: "var(--sh-surface)", borderRight: "1px solid var(--sh-line)",
            }}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main area ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Mobile topbar — hidden above md via Tailwind; inline flex as fallback
            (the sidebar's inline display:none fallback mirrors this) */}
        <div className="tw:md:hidden"
             style={{
               display: window.innerWidth >= 768 ? "none" : "flex",
               alignItems: "center", gap: 12, padding: "12px 16px", flexShrink: 0,
               background: "var(--sh-surface)", borderBottom: "1px solid var(--sh-line)",
             }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded tw:cursor-pointer tw:bg-transparent tw:border-0"
            style={{ color: "var(--sh-dim)" }}
          >
            <Bars3Icon className="tw:w-4 tw:h-4" />
          </button>
          <span className="tw:text-[13px] tw:font-semibold" style={{ color: "var(--sh-ink)" }}>
            Floci Dash
          </span>
          <span className="tw:ml-auto tw:font-mono tw:text-[11px]" style={{ color: "var(--sh-ok)" }}>
            v{version}
          </span>
        </div>

        {/* Page content */}
        <main
          id="main-content"
          style={{ flex: 1, overflowY: "auto", background: "var(--sh-bg)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
