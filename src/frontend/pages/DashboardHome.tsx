import { useNavigate } from "react-router-dom";
import { useHealth, useActiveServices } from "../hooks/useSystem";
import { useResourceCounts } from "../hooks/useResourceCounts";
import { useActivityFeed } from "../hooks/useActivityFeed";
import ServiceGrid from "../components/ServiceGrid";
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

const QUICK_ACTIONS = [
  { label: "S3",       path: "/services/s3",        primary: true  },
  { label: "DynamoDB", path: "/services/dynamodb",   primary: false },
  { label: "EC2",      path: "/services/ec2",        primary: false },
  { label: "Lambda",   path: "/services/lambda",     primary: false },
  { label: "RDS",      path: "/services/rds",        primary: false },
  { label: "SQS",      path: "/services/sqs",        primary: false },
  { label: "SNS",      path: "/services/sns",        primary: false },
  { label: "KMS",      path: "/services/kms",        primary: false },
  { label: "IAM",      path: "/services/iam",        primary: false },
] as const;

// ── Section heading ───────────────────────────────────────────────────────

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
      <h2 style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em",
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
  const navigate = useNavigate();
  const { data: health, isLoading, isError, error } = useHealth();
  const { data: active } = useActiveServices();
  const { data: resourceCounts } = useResourceCounts();
  const { entries, addActivity, clearActivity } = useActivityFeed();

  const trackNav = (path: string, service: string) => {
    addActivity({ action: "navigate", service, description: `Opened ${service.toUpperCase()}` });
    navigate(path);
  };

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

  const totalResources = resourceCounts
    ? Object.values(resourceCounts).reduce((a, b) => a + b, 0)
    : null;

  const nonZeroCounts = resourceCounts
    ? Object.entries(resourceCounts)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  return (
    <div className="tw:p-6 tw:max-w-[1280px] tw:mx-auto" style={{ fontFamily: "var(--font-ui)" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="tw:flex tw:items-baseline tw:justify-between tw:mb-8">
        <div>
          <h1 style={{
            fontSize: "20px", fontWeight: 600, margin: 0,
            color: "var(--sh-ink)", letterSpacing: "-0.01em",
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "12px", color: "var(--sh-dim)", margin: "4px 0 0" }}>
            Floci v{health.version} — local AWS emulator
          </p>
        </div>
        <div className="tw:flex tw:items-center tw:gap-1.5">
          <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full"
                style={{ background: "var(--sh-ok)", boxShadow: "0 0 6px var(--sh-ok)" }} />
          <span style={{ fontSize: "11px", color: "var(--sh-ok)", fontFamily: "var(--font-mono)" }}>
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
        />
        <StatCard
          label="Running"
          value={health.stats.running}
          variant="success"
          subtext={health.stats.available > 0 ? `${health.stats.available} inactive` : "all active"}
        />
        <StatCard
          label="Active"
          value={active?.activeCount ?? "—"}
          variant="warning"
          subtext={active?.activeServices?.slice(0, 3).join(", ") || "services with resources"}
        />
        <StatCard
          label="Resources"
          value={totalResources ?? "—"}
          variant="default"
          subtext="across all services"
        />
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
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="tw:mb-8">
        <SectionHead title="Quick Access" />
        <div className="tw:flex tw:flex-wrap tw:gap-2">
          {QUICK_ACTIONS.map(({ label, path, primary }) => (
            <button
              key={label}
              onClick={() => trackNav(path, label.toLowerCase())}
              className="tw:cursor-pointer tw:text-[12px] tw:font-medium tw:px-3 tw:py-1.5 tw:rounded-[5px] tw:border tw:transition-colors tw:duration-100"
              style={{
                background: primary ? "var(--sh-accent)" : "var(--sh-elevated)",
                color: primary ? "#0d1117" : "var(--sh-dim)",
                border: `1px solid ${primary ? "var(--sh-accent)" : "var(--sh-line)"}`,
                fontFamily: "var(--font-ui)",
              }}
              onMouseEnter={(e) => {
                if (!primary) {
                  e.currentTarget.style.color = "var(--sh-ink)";
                  e.currentTarget.style.borderColor = "var(--sh-dim)";
                }
              }}
              onMouseLeave={(e) => {
                if (!primary) {
                  e.currentTarget.style.color = "var(--sh-dim)";
                  e.currentTarget.style.borderColor = "var(--sh-line)";
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity feed ─────────────────────────────────────── */}
      {entries.length > 0 && (
        <div className="tw:mb-8">
          <SectionHead
            title="Activity"
            action={
              <button
                onClick={clearActivity}
                className="tw:text-[11px] tw:cursor-pointer tw:bg-transparent tw:border-0 tw:transition-colors tw:duration-100"
                style={{ color: "var(--sh-faint)", fontFamily: "var(--font-ui)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--sh-dim)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--sh-faint)"; }}
              >
                Clear
              </button>
            }
          />
          <div style={{
            background: "var(--sh-surface)",
            border: "1px solid var(--sh-line)",
            borderRadius: "6px",
            overflow: "hidden",
          }}>
            {entries.slice(0, 8).map((entry, idx) => (
              <div
                key={entry.id}
                className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2"
                style={{
                  borderTop: idx > 0 ? "1px solid var(--sh-line-sub)" : "none",
                }}
              >
                <span style={{
                  fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-mono)",
                  color: "var(--sh-accent)", minWidth: "32px",
                }}>
                  {SERVICE_ICONS[entry.service] ?? entry.service.slice(0, 3).toUpperCase()}
                </span>
                <span className="tw:flex-1 tw:truncate" style={{ fontSize: "12px", color: "var(--sh-dim)" }}>
                  {entry.description}
                </span>
                {entry.resource && (
                  <span className="tw:truncate tw:hidden tw:sm:block"
                        style={{ fontSize: "11px", color: "var(--sh-faint)", fontFamily: "var(--font-mono)", maxWidth: "140px" }}>
                    {entry.resource}
                  </span>
                )}
                <span style={{ fontSize: "10px", color: "var(--sh-faint)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  {formatTime(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Services catalogue ───────────────────────────────── */}
      <div>
        <SectionHead
          title={`Services · ${health.stats.running}/${health.stats.total} running`}
        />
        <ServiceGrid services={health.services} />
      </div>

    </div>
  );
}
