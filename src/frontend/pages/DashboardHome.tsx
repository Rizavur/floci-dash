import { useRef, useState } from "react";
import {
  Squares2X2Icon,
  SignalIcon,
  FireIcon,
  CubeIcon,
  StarIcon,
  PlusCircleIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowRightCircleIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/16/solid";
import { useHealth, useActiveServices } from "../hooks/useSystem";
import { useResourceCounts } from "../hooks/useResourceCounts";
import { useActivityFeed, type ActivityEntry } from "../hooks/useActivityFeed";
import { useFavorites } from "../stores/favorites";
import ServiceGrid, { type ServiceGridHandle } from "../components/ServiceGrid";
import ServiceCard from "../components/ServiceCard";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

const SERVICE_ICONS: Record<string, string> = {
  s3: "S3", dynamodb: "DB", ec2: "EC2", lambda: "λ",
  rds: "RDS", sqs: "SQS", sns: "SNS", kms: "KMS", cloudwatch: "CW",
};

const ACTIVITY_STYLE: Record<ActivityEntry["action"], { icon: typeof PlusCircleIcon; color: string }> = {
  create: { icon: PlusCircleIcon, color: "var(--sh-ok)" },
  delete: { icon: TrashIcon, color: "var(--sh-fail)" },
  update: { icon: PencilSquareIcon, color: "var(--sh-warn)" },
  navigate: { icon: ArrowRightCircleIcon, color: "var(--sh-faint)" },
};

// Shown as a starting point in the Favorites section before the user has starred anything.
const DEFAULT_FAVORITES = ["s3", "dynamodb", "ec2", "lambda", "rds", "sqs", "sns", "kms", "iam"];

// ── Section heading ───────────────────────────────────────────────────────

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
      <h2 style={{
        fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "var(--sh-faint)",
        fontFamily: "var(--font-mono)", margin: 0,
      }}>
        {title}
      </h2>
      {action}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { data: health, isLoading, isError, error } = useHealth();
  const { data: active } = useActiveServices();
  const { data: resourceCounts } = useResourceCounts();
  const { entries, clearActivity } = useActivityFeed();
  const favorites = useFavorites((s) => s.favorites);
  const serviceGridRef = useRef<ServiceGridHandle>(null);
  const [allCategoriesExpanded, setAllCategoriesExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="tw:p-8" style={{ fontFamily: "var(--font-ui)" }}>
        <div className="tw:grid tw:grid-cols-2 tw:lg:grid-cols-4 tw:gap-3 tw:mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="fd-skeleton tw:h-[80px] tw:rounded-md" />
          ))}
        </div>
        <div className="fd-skeleton tw:h-[120px] tw:rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="tw:p-8">
        <EmptyState
          icon="⚠"
          title={(error as Error)?.message || "Cannot connect to Floci"}
          description="Make sure the Floci container is running (./start.sh)."
        />
      </div>
    );
  }

  if (!health) return null;

  const activeServices = active?.activeServices ?? [];
  const activeSet = new Set(activeServices);

  const totalResources = resourceCounts
    ? Object.values(resourceCounts).reduce((a, b) => a + b, 0)
    : null;

  const nonZeroCounts = resourceCounts
    ? Object.entries(resourceCounts)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];
  const maxCount = nonZeroCounts.length ? nonZeroCounts[0][1] : 0;

  const runningPct = health.stats.total > 0 ? (health.stats.running / health.stats.total) * 100 : 0;
  const activePct = health.stats.total > 0 ? ((active?.activeCount ?? 0) / health.stats.total) * 100 : 0;

  const hasFavorites = favorites.some((k) => k in health.services);
  const favoriteKeys = (hasFavorites ? favorites : DEFAULT_FAVORITES).filter((k) => k in health.services);

  return (
    <div className="tw:p-6 tw:max-w-[1280px] tw:min-[1600px]:max-w-[1600px] tw:min-[1920px]:max-w-[1800px] tw:min-[2560px]:max-w-[2200px] tw:mx-auto" style={{ fontFamily: "var(--font-ui)" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="tw:flex tw:items-baseline tw:justify-between tw:mb-8">
        <div>
          <h1 style={{
            fontSize: "1.25rem", fontWeight: 600, margin: 0,
            color: "var(--sh-ink)", letterSpacing: "-0.01em",
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--sh-dim)", margin: "4px 0 0" }}>
            Floci v{health.version} — local AWS emulator
          </p>
        </div>
        <div className="tw:flex tw:items-center tw:gap-1.5">
          <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full"
                style={{ background: "var(--sh-ok)", boxShadow: "0 0 6px var(--sh-ok)" }} />
          <span style={{ fontSize: "0.6875rem", color: "var(--sh-ok)", fontFamily: "var(--font-mono)" }}>
            Connected
          </span>
        </div>
      </div>

      {/* ── Stat strip ───────────────────────────────────────── */}
      <div className="tw:grid tw:grid-cols-2 tw:lg:grid-cols-4 tw:gap-3 tw:mb-8">
        <StatCard
          label="Services"
          value={health.stats.total}
          variant="info"
          subtext="emulated by Floci"
          icon={Squares2X2Icon}
        />
        <StatCard
          label="Running"
          value={health.stats.running}
          variant="success"
          subtext={health.stats.available > 0 ? `${health.stats.available} inactive` : "all active"}
          icon={SignalIcon}
          progress={runningPct}
        />
        <StatCard
          label="Active"
          value={active?.activeCount ?? "—"}
          variant="warning"
          subtext={activeServices.slice(0, 3).map((s) => s.toUpperCase()).join(", ") || "no resources yet"}
          icon={FireIcon}
          progress={activePct}
        />
        <StatCard
          label="Resources"
          value={totalResources ?? "—"}
          variant="default"
          subtext="across all services"
          icon={CubeIcon}
        />
      </div>

      {/* ── Favorites ──────────────────────────────────────────── */}
      <div className="tw:mb-8">
        <SectionHead
          title="Favorites"
          action={
            !hasFavorites ? (
              <span style={{ fontSize: "0.6875rem", color: "var(--sh-faint)" }}>
                Suggested — star a service below to pin your own
              </span>
            ) : undefined
          }
        />
        {favoriteKeys.length === 0 ? (
          <div style={{
            background: "var(--sh-surface)",
            border: "1px dashed var(--sh-line)",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "0.75rem", color: "var(--sh-faint)", margin: 0 }}>
              No favorites yet. Click the <StarIcon className="tw:w-3 tw:h-3 tw:inline tw:align-[-2px]" /> on any service below to pin it here.
            </p>
          </div>
        ) : (
          <div className="tw:grid tw:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] tw:gap-2">
            {favoriteKeys.map((key) => (
              <ServiceCard
                key={key}
                serviceKey={key}
                status={health.services[key]}
                isActive={activeSet.has(key)}
                resourceCount={resourceCounts?.[key]}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Activity feed ─────────────────────────────────────── */}
      <div className="tw:mb-8">
        <SectionHead
          title="Activity"
          action={
            entries.length > 0 ? (
              <button
                onClick={clearActivity}
                className="tw:text-[0.6875rem] tw:cursor-pointer tw:bg-transparent tw:border-0 tw:transition-colors tw:duration-100"
                style={{ color: "var(--sh-faint)", fontFamily: "var(--font-ui)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-dim)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; }}
              >
                Clear
              </button>
            ) : undefined
          }
        />
        {entries.length === 0 ? (
          <div style={{
            background: "var(--sh-surface)",
            border: "1px dashed var(--sh-line)",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "0.75rem", color: "var(--sh-faint)", margin: 0 }}>
              No recent activity. Creating or deleting resources will show up here.
            </p>
          </div>
        ) : (
          <div style={{
            background: "var(--sh-surface)",
            border: "1px solid var(--sh-line)",
            borderRadius: "6px",
            overflow: "hidden",
          }}>
            {entries.slice(0, 8).map((entry, idx) => {
              const style = ACTIVITY_STYLE[entry.action] ?? ACTIVITY_STYLE.navigate;
              const ActionIcon = style.icon;
              return (
                <div
                  key={entry.id}
                  className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2"
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--sh-line-sub)" : "none",
                    borderLeft: `2px solid ${style.color}`,
                  }}
                >
                  <ActionIcon className="tw:w-3.5 tw:h-3.5 tw:flex-shrink-0" style={{ color: style.color }} />
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 600, fontFamily: "var(--font-mono)",
                    color: "var(--sh-accent)", minWidth: "32px",
                  }}>
                    {SERVICE_ICONS[entry.service] ?? entry.service.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="tw:flex-1 tw:truncate" style={{ fontSize: "0.75rem", color: "var(--sh-dim)" }}>
                    {entry.description}
                  </span>
                  {entry.resource && (
                    <span className="tw:truncate tw:hidden tw:sm:block"
                          style={{ fontSize: "0.6875rem", color: "var(--sh-faint)", fontFamily: "var(--font-mono)", maxWidth: "140px" }}>
                      {entry.resource}
                    </span>
                  )}
                  <span style={{ fontSize: "0.625rem", color: "var(--sh-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Resource breakdown ───────────────────────────────── */}
      {nonZeroCounts.length > 0 && (
        <div className="tw:mb-8">
          <SectionHead title="Resource Counts" />
          <div className="tw:grid tw:grid-cols-2 tw:sm:grid-cols-3 tw:lg:grid-cols-5 tw:gap-2">
            {nonZeroCounts.map(([service, count]) => (
              <StatCard
                key={service}
                label={service.toUpperCase()}
                value={count}
                variant="info"
                size="sm"
                progress={maxCount ? (count / maxCount) * 100 : 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Services catalogue ───────────────────────────────── */}
      <div>
        <SectionHead
          title={`Services · ${health.stats.running}/${health.stats.total} running`}
          action={
            <button
              onClick={() => allCategoriesExpanded ? serviceGridRef.current?.collapseAll() : serviceGridRef.current?.expandAll()}
              title={allCategoriesExpanded ? "Collapse all" : "Expand all"}
              aria-label={allCategoriesExpanded ? "Collapse all categories" : "Expand all categories"}
              className="tw:flex tw:items-center tw:justify-center tw:w-6 tw:h-6 tw:rounded tw:cursor-pointer tw:bg-transparent tw:border-0"
              style={{ color: "var(--sh-faint)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sh-hover)"; e.currentTarget.style.color = "var(--sh-dim)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sh-faint)"; }}
            >
              {allCategoriesExpanded ? <ChevronDoubleUpIcon className="tw:w-3.5 tw:h-3.5" /> : <ChevronDoubleDownIcon className="tw:w-3.5 tw:h-3.5" />}
            </button>
          }
        />
        <ServiceGrid
          ref={serviceGridRef}
          services={health.services}
          activeServices={activeServices}
          resourceCounts={resourceCounts}
          onAllExpandedChange={setAllCategoriesExpanded}
        />
      </div>

    </div>
  );
}
