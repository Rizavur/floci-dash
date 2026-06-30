import { useNavigate } from "react-router-dom";
import { Box, BreadcrumbGroup, Button, Container, Header, SpaceBetween, StatusIndicator } from "@cloudscape-design/components";
import { useHealth, useActiveServices } from "../hooks/useSystem";
import { useResourceCounts } from "../hooks/useResourceCounts";
import { useActivityFeed } from "../hooks/useActivityFeed";
import ServiceGrid from "../components/ServiceGrid";
import StatCard from "../components/StatCard";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function serviceIcon(service: string) {
  const icons: Record<string, string> = {
    s3: "☰", dynamodb: "▤", ec2: "◈", lambda: "λ", rds: "🗄",
    sqs: "☰", sns: "☰", kms: "🔑", cloudwatch: "📊",
  };
  return icons[service] || "•";
}

const QUICK_ACTIONS = [
  { label: "S3",        path: "/services/s3",        primary: true  },
  { label: "DynamoDB",  path: "/services/dynamodb",  primary: false },
  { label: "EC2",       path: "/services/ec2",        primary: false },
  { label: "Lambda",    path: "/services/lambda",     primary: false },
  { label: "RDS",       path: "/services/rds",        primary: false },
  { label: "SQS",       path: "/services/sqs",        primary: false },
  { label: "SNS",       path: "/services/sns",        primary: false },
  { label: "KMS",       path: "/services/kms",        primary: false },
  { label: "IAM",       path: "/services/iam",        primary: false },
] as const;

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

  return (
    <div className="fd-p-responsive fd-container-responsive">
      {isLoading ? (
        <Box padding={{ top: "l" }}>
          <DashboardSkeleton />
        </Box>
      ) : isError ? (
        <EmptyState
          title={(error as Error)?.message || "Failed to connect to Floci"}
          icon="⚠️"
          description="Make sure Floci is running and accessible."
        />
      ) : health ? (
        <SpaceBetween size="xl">
          <BreadcrumbGroup
            items={[{ text: "Dashboard", href: "/#/" }]}
            onFollow={(e) => { e.preventDefault(); navigate(e.detail.href.replace("/#", "") || "/"); }}
          />

          <Header
            variant="h1"
            description="Local AWS emulator — manage services, buckets, tables, and more"
            actions={
              <StatusIndicator type="success">
                Connected — v{health.version}
              </StatusIndicator>
            }
          >
            Floci Dash
          </Header>

          {/* ── Stat cards — responsive 1→2→4 column grid ─────────────── */}
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
            <StatCard
              label="Available Services"
              value={health.stats.total}
              variant="info"
              subtext="Total services Floci offers"
            />
            <StatCard
              label="Active"
              value={active?.activeCount ?? "—"}
              variant="success"
              subtext={
                active?.activeServices?.length
                  ? active.activeServices.join(", ")
                  : "Services with resources"
              }
            />
            <StatCard
              label="Running"
              value={health.stats.running}
              variant="warning"
              subtext={
                health.stats.available === 0
                  ? "All running"
                  : `${health.stats.available} inactive`
              }
            />
            <StatCard
              label="Resources"
              value={
                resourceCounts
                  ? Object.values(resourceCounts).reduce((a, b) => a + b, 0)
                  : "—"
              }
              variant="info"
              subtext="Total resources across all services"
            />
          </div>

          {/* ── Per-service resource counts ────────────────────────────── */}
          {resourceCounts && Object.keys(resourceCounts).length > 0 && (
            <Container header={<Header variant="h3">Resource Counts</Header>}>
              <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 md:tw-grid-cols-5 tw-gap-3">
                {Object.entries(resourceCounts)
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([service, count]) => (
                    <StatCard
                      key={service}
                      label={service.toUpperCase()}
                      value={count}
                      variant="info"
                      size="sm"
                    />
                  ))}
              </div>
            </Container>
          )}

          {/* ── Quick actions ──────────────────────────────────────────── */}
          <Container header={<Header variant="h3">Quick actions</Header>}>
            <div className="tw-flex tw-flex-wrap tw-gap-2">
              {QUICK_ACTIONS.map(({ label, path, primary }) => (
                <Button
                  key={label}
                  variant={primary ? "primary" : "normal"}
                  onClick={() => trackNav(path, label.toLowerCase())}
                >
                  Open {label}
                </Button>
              ))}
            </div>
          </Container>

          {/* ── Recent activity feed ───────────────────────────────────── */}
          {entries.length > 0 && (
            <Container
              header={
                <Header
                  variant="h3"
                  actions={
                    <Button variant="inline-link" onClick={() => clearActivity()}>
                      Clear
                    </Button>
                  }
                >
                  Recent Activity
                </Header>
              }
            >
              <div className="tw-flex tw-flex-col tw-gap-1">
                {entries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="tw-flex tw-justify-between tw-items-center tw-gap-2 tw-py-1"
                  >
                    <div className="tw-flex tw-items-center tw-gap-2 tw-min-w-0">
                      <span className="fd-text-muted-subtle tw-text-xs tw-shrink-0">
                        {serviceIcon(entry.service)}
                      </span>
                      <span className="tw-text-xs tw-truncate">{entry.description}</span>
                      {entry.resource && (
                        <span className="fd-text-muted tw-text-xs tw-truncate tw-hidden sm:tw-block">
                          — {entry.resource}
                        </span>
                      )}
                    </div>
                    <span className="fd-text-muted tw-text-xs tw-shrink-0">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </Container>
          )}

          {/* ── Services grid ──────────────────────────────────────────── */}
          <Container
            header={
              <Header
                variant="h2"
                description={`${health.stats.running} of ${health.stats.total} services enabled`}
              >
                Services
              </Header>
            }
          >
            <ServiceGrid services={health.services} />
          </Container>
        </SpaceBetween>
      ) : null}
    </div>
  );
}
