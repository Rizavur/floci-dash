// Auto-split from ServicePage.tsx. Shared import preamble is intentional;
// unused imports are tree-shaken at build (noUnusedLocals is off).
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect, Fragment, type ReactNode } from "react";
import { useUrlSelection } from "../../hooks/useUrlSelection";
import { useQuery } from "@tanstack/react-query";
import {
  ContentLayout,
  Header,
  Box,
  BreadcrumbGroup,
  SpaceBetween,
  StatusIndicator,
  Modal,
  Form,
  FormField,
  Input,
  Select,
  Button,
  Alert,
  Tabs,
  Textarea,
  ColumnLayout,
  Container,
  Spinner,
  Checkbox,
  TextFilter,
  type SelectProps,
  type TabsProps,
} from "../../components/ui";
import { useHealth } from "../../hooks/useSystem";
import { getServiceLabel } from "../../types/services";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import {
  useDynamoDBTables,
  useDynamoDBCreateTable,
  useDynamoDBDeleteTable,
} from "../../hooks/useDynamoDB";
import {
  useLogGroups,
  useCreateLogGroup,
  useDeleteLogGroup,
  usePutRetentionPolicy,
  useDeleteRetentionPolicy,
  useLogStreams,
  useCreateLogStream,
  useDeleteLogStream,
  useLogEvents,
  usePutLogEvents,
  useFilterLogEvents,
  useSubscriptionFilters,
  usePutSubscriptionFilter,
  useDeleteSubscriptionFilter,
  useLogGroupTags,
  useTagLogGroup,
  useUntagLogGroup,
} from "../../hooks/useLogs";
import {
  useRDSDBInstances,
  useRDSCreateDBInstance,
  useRDSDeleteDBInstance,
  useRDSRebootDBInstance,
  useRDSDBInstance,
  useRDSDBClusters,
  useRDSCreateDBCluster,
  useRDSDeleteDBCluster,
  useRDSDBCluster,
  useRDSParameterGroups,
  useRDSCreateParameterGroup,
  useRDSDeleteParameterGroup,
  useRDSModifyParameterGroupParameters,
  useRDSClusterParameterGroups,
  useRDSCreateClusterParameterGroup,
  useRDSDeleteClusterParameterGroup,
  type ParameterListResponse,
} from "../../hooks/useRDS";
import { api } from "../../lib/client";
import { formatBytes } from "../../lib/utils";
import ResourceTable from "../../components/ResourceTable";
import DeleteButton from "../../components/DeleteButton";
import DynamoDBTableDetail from "../../components/DynamoDBTableDetail";
import {
  useECSClusters,
  useCreateECSCluster,
  useDeleteECSCluster,
  useECSServices,
  useECSTasks,
  useECSTaskDefinitions,
  useECSTaskDefinitionFamilies,
  useCreateECSService,
  useDeleteECSService,
  useStopECSTask,
  useRunECSTask,
} from "../../hooks/useECS";
import {
  useSSMParameters,
  useSSMParameter,
  usePutSSMParameter,
  useDeleteSSMParameter,
  useSSMParameterHistory,
} from "../../hooks/useSSM";
import {
  useRoute53HostedZones,
  useCreateRoute53HostedZone,
  useDeleteRoute53HostedZone,
  useRoute53RecordSets,
  useCreateRoute53RecordSet,
  useDeleteRoute53RecordSet,
} from "../../hooks/useRoute53";
import {
  useAPIGatewayApis,
  useAPIGatewayApi,
  useCreateAPIGatewayApi,
  useDeleteAPIGatewayApi,
  useAPIGatewayResources,
  useAPIGatewayDeployments,
} from "../../hooks/useAPIGateway";
import { useToast } from "../../components/Toast";
import {
  useReportDefinitions,
  useCreateReportDefinition,
  useModifyReportDefinition,
  useDeleteReportDefinition,
} from "../../hooks/useCUR";
import {
  useAppSyncApis,
  useAppSyncApi,
  useCreateAppSyncApi,
  useDeleteAppSyncApi,
  useAppSyncDataSources,
  useCreateAppSyncDataSource,
  useDeleteAppSyncDataSource,
  useAppSyncResolvers,
  useAppSyncFunctions,
  useCreateAppSyncFunction,
  useDeleteAppSyncFunction,
  useAppSyncApiKeys,
  useCreateAppSyncApiKey,
  useDeleteAppSyncApiKey,
  useAppSyncTypes,
} from "../../hooks/useAppSync";
import {
  useSchedulerGroups,
  useCreateSchedulerGroup,
  useDeleteSchedulerGroup,
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
} from "../../hooks/useScheduler";
import {
  useECRRepositories,
  useECRCreateRepository,
  useECRDeleteRepository,
  useECRImages,
  useECRRepositoryPolicy,
  useECRLifecyclePolicy,
} from "../../hooks/useECR";
import {
  useELBLoadBalancers,
  useELBCreateLoadBalancer,
  useELBDeleteLoadBalancer,
  useELBTargetGroups,
  useELBCreateTargetGroup,
  useELBDeleteTargetGroup,
  useELBListeners,
  useELBCreateListener,
  useELBDeleteListener,
} from "../../hooks/useELB";
import {
  useSESIdentities,
  useSESVerifyEmail,
  useSESVerifyDomain,
  useSESDeleteIdentity,
  useSESSendEmail,
  useSESVerifiedEmails,
} from "../../hooks/useSES";
import {
  useSTSCallerIdentity,
  useSTSAssumeRole,
  useSTSGetSessionToken,
} from "../../hooks/useSTS";
import {
  useEKSClusters,
  useEKSCreateCluster,
  useEKSDeleteCluster,
  useEKSNodegroups,
  useEKSCreateNodegroup,
  useEKSDeleteNodegroup,
} from "../../hooks/useEKS";
import {
  useAutoScalingGroups,
  useCreateAutoScalingGroup,
  useDeleteAutoScalingGroup,
  useLaunchConfigurations,
} from "../../hooks/useAutoScaling";
import {
  useCloudFrontDistributions,
  useCloudFrontInvalidations,
  useCreateCloudFrontInvalidation,
  useCloudFrontCachePolicies,
  useCloudFrontFunctions,
} from "../../hooks/useCloudFront";
import {
  useKinesisStreams,
  useCreateKinesisStream,
  useDeleteKinesisStream,
  useKinesisShards,
  usePutKinesisRecord,
} from "../../hooks/useKinesis";
import {
  useNeptuneClusters,
  useCreateNeptuneCluster,
  useDeleteNeptuneCluster,
  useNeptuneInstances,
  useCreateNeptuneInstance,
  useDeleteNeptuneInstance,
} from "../../hooks/useNeptune";
import {
  usePipes,
  useCreatePipe,
  useDeletePipe,
  useStartPipe,
  useStopPipe,
} from "../../hooks/usePipes";
import {
  useCognitoUserPools,
  useCreateCognitoUserPool,
  useDeleteCognitoUserPool,
  useCognitoUsers,
  useCreateCognitoUser,
  useDeleteCognitoUser,
  useCognitoGroups,
  useCreateCognitoGroup,
  useDeleteCognitoGroup,
  useCognitoUserPoolClients,
  useCreateCognitoUserPoolClient,
  useDeleteCognitoUserPoolClient,
} from "../../hooks/useCognito";
import {
  useApiGatewayV2Apis,
  useCreateApiGatewayV2Api,
  useDeleteApiGatewayV2Api,
  useApiGatewayV2Routes,
  useApiGatewayV2Integrations,
  useApiGatewayV2Stages,
  useApiGatewayV2Deployments,
  useCreateApiGatewayV2Deployment,
} from "../../hooks/useApiGatewayV2";
import {
  useACMCertificates,
  useRequestACMCertificate,
  useDeleteACMCertificate,
} from "../../hooks/useACM";
import {
  useCloudTrailTrails,
  useCreateCloudTrailTrail,
  useDeleteCloudTrailTrail,
  useStartCloudTrailLogging,
  useStopCloudTrailLogging,
} from "../../hooks/useCloudTrail";
import {
  useConfigRules,
  usePutConfigRule,
  useDeleteConfigRule,
  useConfigRecorders,
  useConformancePacks,
  useDeleteConformancePack,
} from "../../hooks/useConfigService";
import {
  useAppConfigApplications,
  useDeleteAppConfigApplication,
  useAppConfigEnvironments,
  useAppConfigProfiles,
} from "../../hooks/useAppConfig";
import {
  useCloudMapNamespaces,
  useCreateCloudMapNamespace,
  useDeleteCloudMapNamespace,
  useCloudMapServices,
  useDeleteCloudMapService,
  useCloudMapInstances,
} from "../../hooks/useCloudMap";
import {
  useAthenaWorkGroups,
  useCreateAthenaWorkGroup,
  useDeleteAthenaWorkGroup,
  useAthenaQueryExecutions,
} from "../../hooks/useAthena";
import {
  useGlueDatabases,
  useCreateGlueDatabase,
  useDeleteGlueDatabase,
  useGlueTables,
  useDeleteGlueTable,
} from "../../hooks/useGlue";
import {
  useFirehoseStreams,
  useCreateFirehoseStream,
  useDeleteFirehoseStream,
} from "../../hooks/useFirehose";
import {
  useStateMachines,
  useDeleteStateMachine,
  useStateMachineExecutions,
  useActivities,
} from "../../hooks/useStepFunctions";
import {
  useOpenSearchDomains,
  useDeleteOpenSearchDomain,
} from "../../hooks/useOpenSearch";
import {
  useMskClusters,
  useDeleteMskCluster,
} from "../../hooks/useMsk";
import {
  useTranscriptionJobs,
  useDeleteTranscriptionJob,
} from "../../hooks/useTranscribe";
import {
  useCostAndUsage,
  useDimensionValues,
  useCETags,
  useReservationCoverage,
  useReservationUtilization,
  useSavingsPlansCoverage,
  useSavingsPlansUtilization,
  useCostCategories,
} from "../../hooks/useCE";
import {
  usePricingServices,
  usePricingAttributeValues,
  usePricingProducts,
  usePricingPriceLists,
  usePricingPriceListFileUrl,
} from "../../hooks/usePricing";
import {
  useRGTResources,
  useRGTTagKeys,
  useRGTTagValues,
  useRGTTagResources,
  useRGTUntagResources,
} from "../../hooks/useRGT";
import {
  useCodeBuildProjects,
  useCreateCodeBuildProject,
  useCodeBuildProject,
  useDeleteCodeBuildProject,
  useStartCodeBuildBuild,
  useCodeBuildProjectBuilds,
  useCodeBuildBuilds,
  useCodeBuildBuild,
  useStopCodeBuildBuild,
  useCodeBuildSourceCredentials,
  useImportCodeBuildSourceCredentials,
  useDeleteCodeBuildSourceCredentials,
  useCodeBuildCuratedImages,
} from "../../hooks/useCodeBuild";
import {
  useCodeDeployApplications,
  useCreateCodeDeployApplication,
  useDeleteCodeDeployApplication,
  useCodeDeployDeploymentGroups,
  useCreateCodeDeployDeploymentGroup,
  useCodeDeployDeploymentConfigs,
  useCreateCodeDeployDeploymentConfig,
  useCodeDeployDeployments,
  useCreateCodeDeployDeployment,
} from "../../hooks/useCodeDeploy";
import {
  useBackupPlans,
  useCreateBackupPlan,
  useBackupPlan,
  useDeleteBackupPlan,
  useBackupVaults,
  useCreateBackupVault,
  useBackupVault,
  useDeleteBackupVault,
  useBackupSelections,
  useCreateBackupSelection,
  useDeleteBackupSelection,
  useBackupJobs,
  useStartBackupJob,
  useBackupJob,
  useStopBackupJob,
  useBackupTags,
} from "../../hooks/useBackup";
import {
  useTransferServers,
  useCreateTransferServer,
  useTransferServer,
  useDeleteTransferServer,
  useStartTransferServer,
  useStopTransferServer,
  useTransferUsers,
  useCreateTransferUser,
  useTransferUser,
  useDeleteTransferUser,
  useTransferTags,
} from "../../hooks/useTransfer";
import {
  useBCMExports,
  useCreateBCMExport,
  useDeleteBCMExport,
  useBCMExportExecutions,
  useBCMTables,
} from "../../hooks/useBCMDataExports";
import {
  useWebACLs,
  useCreateWebACL,
  useDeleteWebACL,
  useIPSets,
  useCreateIPSet,
  useDeleteIPSet,
  useRegexPatternSets,
  useCreateRegexPatternSet,
  useDeleteRegexPatternSet,
  useRuleGroups,
  useCreateRuleGroup,
  useDeleteRuleGroup,
} from "../../hooks/useWafV2";
import {
  useElastiCacheReplicationGroups,
  useElastiCacheCreateReplicationGroup,
  useElastiCacheDeleteReplicationGroup,
  useElastiCacheCacheClusters,
  useElastiCacheCreateCacheCluster,
  useElastiCacheDeleteCacheCluster,
  useElastiCacheUsers,
  useElastiCacheCreateUser,
  useElastiCacheDeleteUser,
} from "../../hooks/useElastiCache";
import {
  useBatchComputeEnvironments,
  useCreateBatchComputeEnvironment,
  useDeleteBatchComputeEnvironment,
  useBatchJobQueues,
  useCreateBatchJobQueue,
  useDeleteBatchJobQueue,
  useBatchJobDefinitions,
  useRegisterBatchJobDefinition,
  useDeregisterBatchJobDefinition,
  useSubmitBatchJob,
  useTerminateBatchJob,
} from "../../hooks/useBatch";
import {
  useDocDBClusters,
  useCreateDocDBCluster,
  useDeleteDocDBCluster,
  useDocDBInstances,
  useCreateDocDBInstance,
  useDeleteDocDBInstance,
} from "../../hooks/useDocDB";
import {
  useEMRClusters,
  useRunEMRJobFlow,
  useTerminateEMRJobFlows,
  useEMRSecurityConfigurations,
  useCreateEMRSecurityConfiguration,
  useDeleteEMRSecurityConfiguration,
} from "../../hooks/useEMR";
import {
  useExecuteRDSDataStatement,
  useBeginRDSDataTransaction,
  useCommitRDSDataTransaction,
  useRollbackRDSDataTransaction,
} from "../../hooks/useRDSData";
import { useEc2Messages, useAcknowledgeMessage } from "../../hooks/useEc2Messages";
import { useStartConfigurationSession, useGetLatestConfiguration } from "../../hooks/useAppConfigData";
import { useMemoryDBClusters, useCreateMemoryDBCluster, useDeleteMemoryDBCluster } from "../../hooks/useMemoryDB";

const KEY_TYPE_OPTIONS: SelectProps.Option[] = [
  { label: "String (S)", value: "S" },
  { label: "Number (N)", value: "N" },
  { label: "Binary (B)", value: "B" },
];

const ENGINE_OPTIONS: SelectProps.Option[] = [
  { label: "PostgreSQL", value: "postgres" },
  { label: "MySQL", value: "mysql" },
  { label: "MariaDB", value: "mariadb" },
];

const AURORA_ENGINE_OPTIONS: SelectProps.Option[] = [
  { label: "Aurora PostgreSQL", value: "aurora-postgresql" },
  { label: "Aurora MySQL", value: "aurora-mysql" },
];

const DB_CLASS_OPTIONS: SelectProps.Option[] = [
  { label: "db.t3.micro", value: "db.t3.micro" },
  { label: "db.t3.small", value: "db.t3.small" },
  { label: "db.t3.medium", value: "db.t3.medium" },
  { label: "db.r5.large", value: "db.r5.large" },
  { label: "db.r5.xlarge", value: "db.r5.xlarge" },
];

const PG_FAMILY_OPTIONS: SelectProps.Option[] = [
  { label: "postgres16", value: "postgres16" },
  { label: "postgres15", value: "postgres15" },
  { label: "mysql8", value: "mysql8" },
  { label: "mariadb11", value: "mariadb11" },
];

const CLUSTER_PG_FAMILY_OPTIONS: SelectProps.Option[] = [
  { label: "aurora-postgresql16", value: "aurora-postgresql16" },
  { label: "aurora-postgresql15", value: "aurora-postgresql15" },
  { label: "aurora-mysql8", value: "aurora-mysql8" },
];

export function CloudWatchLogsDashboard() {
  const [selectedTab, setSelectedTab] = useState("log-groups");
  const [selectedGroup, setSelectedGroup] = useUrlSelection("logGroup");

  if (selectedGroup) {
    return (
      <CloudWatchLogGroupDetail
        name={selectedGroup}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  const tabs: TabsProps.Tab[] = [
    {
      id: "log-groups",
      label: "Log Groups",
      content: <CloudWatchLogGroupList onSelect={(name) => setSelectedGroup(name)} />,
    },
  ];

  return (
    <Tabs
      activeTabId={selectedTab}
      onChange={({ detail }) => setSelectedTab(detail.activeTabId)}
      tabs={tabs}
    />
  );
}

// ─── Log Group List ────────────────────────────────────


function CloudWatchLogGroupList({ onSelect }: { onSelect: (name: string) => void }) {
  const { data, isLoading, isError, error } = useLogGroups();
  const createGroup = useCreateLogGroup();
  const deleteGroup = useDeleteLogGroup();

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");

  const items = (data?.logGroups || []).map((g) => ({
    logGroupName: g.logGroupName,
    retentionInDays: g.retentionInDays,
    creationTime: g.creationTime,
    storedBytes: g.storedBytes,
    arn: g.arn,
  }));

  function formatRetention(days?: number): string {
    if (!days) return "Never expire";
    if (days === 1) return "1 day";
    if (days === 7) return "7 days";
    if (days === 30) return "30 days";
    if (days === 365) return "1 year";
    return `${days} days`;
  }

  function handleCreate() {
    if (!groupName) return;
    createGroup.mutate(
      { logGroupName: groupName },
      {
        onSuccess: () => {
          setShowCreate(false);
          setGroupName("");
        },
      }
    );
  }

  return (
    <>
      {isError && (
        <StatusIndicator type="error">
          {(error as Error)?.message || "Failed to load log groups"}
        </StatusIndicator>
      )}

      <ResourceTable
        resourceName="Log Group"
        headerTitle="Log Groups"
        headerCounter={data?.total}
        items={items}
        columns={[
          {
            id: "name",
            header: "Log group name",
            cell: (item: any) => (
              <Button variant="link" onClick={() => onSelect(item.logGroupName)}>
                {item.logGroupName}
              </Button>
            ),
            isRowHeader: true,
          },
          {
            id: "retention",
            header: "Retention",
            cell: (item: any) => formatRetention(item.retentionInDays),
            mono: true,
          },
          {
            id: "size",
            header: "Stored bytes",
            cell: (item: any) => formatBytes(item.storedBytes ?? 0),
            mono: true,
          },
          {
            id: "actions",
            header: "",
            cell: (item: any) => (
              <DeleteButton
                itemName={item.logGroupName}
                resourceType="log group"
                loading={
                  deleteGroup.isPending && deleteGroup.variables === item.logGroupName
                }
                onDelete={() => deleteGroup.mutateAsync(item.logGroupName)}
              />
            ),
          },
        ]}
        loading={isLoading}
        emptyMessage="No log groups found. Create one to get started."
        filterEnabled
        filterPlaceholder="Find log groups by name"
        filterFunction={(item: any, searchText: string) =>
          item.logGroupName.toLowerCase().includes(searchText.toLowerCase())
        }
        onCreate={() => setShowCreate(true)}
      />

      <Modal
        visible={showCreate}
        onDismiss={() => {
          setShowCreate(false);
          setGroupName("");
        }}
        header="Create Log Group"
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setShowCreate(false);
                  setGroupName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={createGroup.isPending}
                disabled={!groupName}
                onClick={handleCreate}
              >
                Create log group
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          {createGroup.isError && (
            <Alert type="error" dismissible>
              {(createGroup.error as Error)?.message ||
                "Failed to create log group"}
            </Alert>
          )}
          <SpaceBetween size="m">
            <FormField
              label="Log group name"
              description="The name of the log group. Use alphanumeric characters, hyphens, underscores, and forward slashes."
            >
              <Input
                value={groupName}
                onChange={({ detail }) => setGroupName(detail.value)}
                placeholder="/aws/lambda/my-function"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}

// ─── Log Group Detail ──────────────────────────────────


function CloudWatchLogGroupDetail({
  name,
  onBack,
}: {
  name: string;
  onBack: () => void;
}) {
  const [selectedTab, setSelectedTab] = useState("streams");
  // Not a plain useUrlSelection: the log group name must stay in the URL
  // alongside the stream name so browser back steps stream → group → list
  // instead of dropping the group.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStream = searchParams.get("logStream");
  const setSelectedStream = (streamName: string | null) =>
    setSearchParams(streamName ? { logGroup: name, logStream: streamName } : { logGroup: name });

  if (selectedStream) {
    return (
      <CloudWatchLogStreamDetail
        logGroupName={name}
        logStreamName={selectedStream}
        onBack={() => setSelectedStream(null)}
      />
    );
  }

  const tabs: TabsProps.Tab[] = [
    {
      id: "search",
      label: "Search Log Events",
      content: (
        <CloudWatchLogGroupSearch
          logGroupName={name}
          onSelectStream={(s) => setSelectedStream(s)}
        />
      ),
    },
    {
      id: "streams",
      label: "Log Streams",
      content: (
        <CloudWatchLogStreamList
          logGroupName={name}
          onSelect={(s) => setSelectedStream(s)}
        />
      ),
    },
    {
      id: "retention",
      label: "Retention",
      content: <CloudWatchRetentionConfig logGroupName={name} />,
    },
    {
      id: "subscription-filters",
      label: "Subscription Filters",
      content: <CloudWatchSubscriptionFilterList logGroupName={name} />,
    },
    {
      id: "tags",
      label: "Tags",
      content: <CloudWatchLogGroupTags logGroupName={name} />,
    },
  ];

  return (
    <SpaceBetween size="l">
      <Button variant="link" iconName="arrow-left" onClick={onBack}>
        Back to Log Groups
      </Button>

      <Header
        variant="h2"
        description="Log group details — streams, retention, subscription filters, and tags"
      >
        {name}
      </Header>

      <Tabs
        activeTabId={selectedTab}
        onChange={({ detail }) => setSelectedTab(detail.activeTabId)}
        tabs={tabs}
      />
    </SpaceBetween>
  );
}

// ─── Log Group Search (FilterLogEvents across all streams) ────


function CloudWatchLogGroupSearch({
  logGroupName,
  onSelectStream,
}: {
  logGroupName: string;
  onSelectStream: (logStreamName: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(LOG_VIEW_LIMIT_OPTIONS[2]); // 500
  const ALL_STREAMS: SelectProps.Option = { label: "All streams", value: "" };
  const [streamScope, setStreamScope] = useState<SelectProps.Option>(ALL_STREAMS);
  const search = useFilterLogEvents(logGroupName);
  const { data: streamsData } = useLogStreams(logGroupName);

  const streamOptions: SelectProps.Option[] = [
    ALL_STREAMS,
    ...((streamsData?.logStreams || []).map((s) => ({
      label: s.logStreamName,
      value: s.logStreamName,
    }))),
  ];

  function runSearch() {
    search.mutate({
      filterPattern: query.trim() || undefined,
      limit: parseInt((limit.value || "500") as string),
      logStreamNames: streamScope.value ? [streamScope.value] : undefined,
    });
  }

  const events = ((search.data as any)?.events || []) as Array<{
    eventId?: string;
    timestamp?: number;
    message: string;
    logStreamName?: string;
  }>;

  return (
    <SpaceBetween size="m">
      <Box variant="p" color="text-body-secondary">
        Search log events across all streams in this log group. Enter plain text to match, or
        use CloudWatch filter pattern syntax (e.g. <code>?ERROR ?WARN</code>).
      </Box>

      {/* Native form submit gives us "press Enter to search" for free. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <SpaceBetween direction="horizontal" size="xs">
          <Input
            value={query}
            onChange={({ detail }) => setQuery(detail.value)}
            placeholder='Search messages, e.g. ERROR or "connection timed out"'
          />
          <Select
            selectedOption={streamScope}
            onChange={({ detail }) => setStreamScope(detail.selectedOption)}
            options={streamOptions}
            ariaLabel="Log stream scope"
          />
          <Select
            selectedOption={limit}
            onChange={({ detail }) => setLimit(detail.selectedOption)}
            options={LOG_VIEW_LIMIT_OPTIONS}
            ariaLabel="Result limit"
          />
          <Button type="submit" variant="primary" loading={search.isPending}>
            Search
          </Button>
        </SpaceBetween>
      </form>

      {search.isError && (
        <Alert type="error" dismissible>
          {(search.error as Error)?.message || "Failed to search log events"}
        </Alert>
      )}

      {search.isSuccess && events.length === 0 && (
        <Box textAlign="center" padding="xl" color="text-body-secondary">
          No matching log events found.
        </Box>
      )}

      {events.length > 0 && (
        <div
          style={{
            maxHeight: "600px",
            overflowY: "auto",
            backgroundColor: "var(--sh-surface)",
            border: "1px solid var(--sh-line)",
            borderRadius: "4px",
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
            fontSize: "0.75rem",
            lineHeight: "1.6",
          }}
        >
          {events.map((event, idx) => {
            const stream = event.logStreamName || null;
            return (
              <div
                key={event.eventId || idx}
                title={stream ? `Open stream: ${stream}` : undefined}
                onClick={() => stream && onSelectStream(stream)}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "2px 8px",
                  borderBottom: "1px solid var(--sh-line-sub)",
                  cursor: stream ? "pointer" : "default",
                }}
                onMouseEnter={(e) => {
                  if (stream) e.currentTarget.style.background = "var(--sh-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    color: "var(--sh-accent)",
                    minWidth: "140px",
                    flexShrink: 0,
                    userSelect: "none",
                  }}
                >
                  {event.timestamp ? new Date(event.timestamp).toISOString() : "—"}
                </span>
                <span
                  style={{
                    minWidth: "160px",
                    flexShrink: 0,
                    color: "var(--sh-dim)",
                    userSelect: "none",
                    textDecoration: stream ? "underline" : undefined,
                  }}
                >
                  {stream || "—"}
                </span>
                <span
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    color: "var(--sh-ink)",
                  }}
                >
                  {renderLogMessage(event.message || "")}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {events.length > 0 && (
        <Box textAlign="center" fontSize="body-s" color="text-body-secondary">
          {events.length} matching events
        </Box>
      )}
    </SpaceBetween>
  );
}

// ─── Log Stream List ───────────────────────────────────


function CloudWatchLogStreamList({
  logGroupName,
  onSelect,
}: {
  logGroupName: string;
  onSelect: (name: string) => void;
}) {
  const { data, isLoading, isError, error } = useLogStreams(logGroupName);
  const createStream = useCreateLogStream();
  const deleteStream = useDeleteLogStream();

  const [showCreate, setShowCreate] = useState(false);
  const [streamName, setStreamName] = useState("");

  const items = (data?.logStreams || []).map((s) => ({
    logStreamName: s.logStreamName,
    creationTime: s.creationTime,
    lastEventTimestamp: s.lastEventTimestamp,
    storedBytes: s.storedBytes,
    lastIngestionTime: s.lastIngestionTime,
  }));

  function formatTimestamp(ts?: number): string {
    if (!ts) return "—";
    return new Date(ts).toLocaleString();
  }

  function handleCreate() {
    if (!streamName) return;
    createStream.mutate(
      { logGroupName, logStreamName: streamName },
      {
        onSuccess: () => {
          setShowCreate(false);
          setStreamName("");
        },
      }
    );
  }

  return (
    <>
      {isError && (
        <StatusIndicator type="error">
          {(error as Error)?.message || "Failed to load log streams"}
        </StatusIndicator>
      )}

      <ResourceTable
        resourceName="Log Stream"
        headerTitle={`Log Streams for ${logGroupName}`}
        headerCounter={data?.total}
        items={items}
        columns={[
          {
            id: "name",
            header: "Log stream name",
            cell: (item: any) => (
              <Button variant="link" onClick={() => onSelect(item.logStreamName)}>
                {item.logStreamName}
              </Button>
            ),
            isRowHeader: true,
          },
          {
            id: "lastEvent",
            header: "Last event",
            cell: (item: any) => formatTimestamp(item.lastEventTimestamp),
            mono: true,
          },
          {
            id: "size",
            header: "Stored bytes",
            cell: (item: any) =>
              item.storedBytes ? `${(item.storedBytes / 1024).toFixed(1)} KB` : "0 B",
            mono: true,
          },
          {
            id: "actions",
            header: "",
            cell: (item: any) => (
              <DeleteButton
                itemName={item.logStreamName}
                resourceType="log stream"
                loading={
                  deleteStream.isPending &&
                  deleteStream.variables.logStreamName === item.logStreamName
                }
                onDelete={() =>
                  deleteStream.mutateAsync({
                    logGroupName,
                    logStreamName: item.logStreamName,
                  })
                }
              />
            ),
          },
        ]}
        loading={isLoading}
        emptyMessage="No log streams found"
        filterEnabled
        filterPlaceholder="Find streams by name"
        filterFunction={(item: any, searchText: string) =>
          item.logStreamName.toLowerCase().includes(searchText.toLowerCase())
        }
        onCreate={() => setShowCreate(true)}
      />

      <Modal
        visible={showCreate}
        onDismiss={() => {
          setShowCreate(false);
          setStreamName("");
        }}
        header="Create Log Stream"
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setShowCreate(false);
                  setStreamName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={createStream.isPending}
                disabled={!streamName}
                onClick={handleCreate}
              >
                Create log stream
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          {createStream.isError && (
            <Alert type="error" dismissible>
              {(createStream.error as Error)?.message ||
                "Failed to create log stream"}
            </Alert>
          )}
          <SpaceBetween size="m">
            <FormField
              label="Log stream name"
              description="The name of the log stream within this log group."
            >
              <Input
                value={streamName}
                onChange={({ detail }) => setStreamName(detail.value)}
                placeholder="my-stream"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}

// ─── Log Stream Detail (Live Log Viewer) ───────────────


function CloudWatchLogStreamDetail({
  logGroupName,
  logStreamName,
  onBack,
}: {
  logGroupName: string;
  logStreamName: string;
  onBack: () => void;
}) {
  const [limit, setLimit] = useState(LOG_VIEW_LIMIT_OPTIONS[2]); // 500 default
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterText, setFilterText] = useState("");
  const deleteLogStream = useDeleteLogStream();

  const { data, isLoading, isError, error, refetch } = useLogEvents(
    logGroupName,
    logStreamName,
    {
      limit: parseInt((limit.value || "500") as string),
      startFromHead: false,
    },
    autoRefresh
  );

  // Auto-refresh toggle
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && eventsContainerRef.current) {
      eventsContainerRef.current.scrollTop = eventsContainerRef.current.scrollHeight;
    }
  }, [data?.events, autoScroll]);

  const events = (data?.events || []).slice().reverse(); // newest first
  const filteredEvents = filterText.trim()
    ? events.filter((e: any) => (e.message || "").toLowerCase().includes(filterText.toLowerCase()))
    : events;

  return (
    <SpaceBetween size="l">
      <Button variant="link" iconName="arrow-left" onClick={onBack}>
        Back to Log Streams
      </Button>

      <Header
        variant="h2"
        description={`${logGroupName} > ${logStreamName}`}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Select
              selectedOption={limit}
              onChange={({ detail }) => setLimit(detail.selectedOption)}
              options={LOG_VIEW_LIMIT_OPTIONS}
              ariaLabel="Events limit"
            />
            <Button
              iconName="refresh"
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "primary" : "normal"}
              iconName={autoRefresh ? "undo" : "refresh"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button
              variant="normal"
              onClick={() => setAutoScroll(!autoScroll)}
            >
              {autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
            </Button>
            <DeleteButton
              itemName={logStreamName}
              resourceType="log stream"
              loading={
                deleteLogStream.isPending &&
                deleteLogStream.variables.logStreamName === logStreamName
              }
              onDelete={() =>
                deleteLogStream
                  .mutateAsync({ logGroupName, logStreamName })
                  .then(() => onBack())
              }
            />
          </SpaceBetween>
        }
      >
        Log Events
      </Header>

      {isError && (
        <Alert type="error" dismissible>
          {(error as Error)?.message || "Failed to load log events"}
        </Alert>
      )}

      {isLoading && events.length === 0 && (
        <StatusIndicator type="loading">Loading log events...</StatusIndicator>
      )}

      {events.length === 0 && !isLoading && !isError && (
        <Box textAlign="center" padding="xl" color="text-body-secondary">
          No log events found for this stream.
        </Box>
      )}

      {events.length > 0 && (
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder="Filter loaded events, e.g. ERROR or a request ID"
          onChange={({ detail }) => setFilterText(detail.filteringText)}
        />
      )}

      <div
        ref={eventsContainerRef}
        style={{
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "var(--sh-surface)",
          border: "1px solid var(--sh-line)",
          borderRadius: "4px",
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
          fontSize: "0.75rem",
          lineHeight: "1.6",
        }}
        onScroll={() => {
          if (!eventsContainerRef.current) return;
          const el = eventsContainerRef.current;
          const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 50;
          if (!atBottom) setAutoScroll(false);
        }}
      >
        {filteredEvents.length === 0 && filterText.trim() && (
          <Box textAlign="center" padding="l" color="text-body-secondary">
            No events match "{filterText}".
          </Box>
        )}
        {filteredEvents.map((event: any, idx: number) => (
          <div
            key={event.eventId || idx}
            style={{
              display: "flex",
              gap: "16px",
              padding: "2px 8px",
              borderBottom:
                "1px solid var(--sh-line-sub)",
            }}
          >
            <span
              style={{
                color: "var(--sh-accent)",
                minWidth: "140px",
                flexShrink: 0,
                userSelect: "none",
              }}
            >
              {event.timestamp
                ? new Date(event.timestamp).toISOString()
                : "—"}
            </span>
            <span
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                color: "var(--sh-ink)",
              }}
            >
              {renderLogMessage(event.message || "")}
            </span>
          </div>
        ))}
      </div>

      {isLoading && events.length > 0 && (
        <StatusIndicator type="loading">Refreshing events...</StatusIndicator>
      )}

      {data && (
        <Box textAlign="center" fontSize="body-s" color="text-body-secondary">
          {filterText.trim() ? `${filteredEvents.length} of ${events.length} events displayed` : `${events.length} events displayed`}
        </Box>
      )}
    </SpaceBetween>
  );
}

// ─── Retention Config ──────────────────────────────────


function CloudWatchRetentionConfig({ logGroupName }: { logGroupName: string }) {
  const { data, isLoading } = useLogGroups();
  const putRetention = usePutRetentionPolicy();
  const deleteRetention = useDeleteRetentionPolicy();
  const { showToast } = useToast();

  const logGroup = (data?.logGroups || []).find(
    (g) => g.logGroupName === logGroupName
  );

  const currentRetention = logGroup?.retentionInDays;
  const [selectedRetention, setSelectedRetention] = useState<SelectProps.Option>(
    currentRetention
      ? RETENTION_OPTIONS.find((o) => o.value === String(currentRetention)) ||
          { label: `${currentRetention} days`, value: String(currentRetention) }
      : RETENTION_OPTIONS[RETENTION_OPTIONS.length - 1] // Never expire
  );

  useEffect(() => {
    if (logGroup?.retentionInDays !== undefined) {
      const found = RETENTION_OPTIONS.find(
        (o) => o.value === String(logGroup.retentionInDays)
      );
      if (found) setSelectedRetention(found);
    }
  }, [logGroup?.retentionInDays]);

  if (isLoading) {
    return <StatusIndicator type="loading">Loading retention settings...</StatusIndicator>;
  }

  const selectedDays = parseInt((selectedRetention.value || "0") as string);
  // "Never expire" (0) sorts as infinite; shrinking from infinite, or to a smaller
  // finite value, is the only path that can delete log events immediately.
  const currentEffective = currentRetention ?? Infinity;
  const nextEffective = selectedDays === 0 ? Infinity : selectedDays;
  const isReducing = nextEffective < currentEffective;

  function handleSave() {
    const onSuccess = () => showToast("success", "Retention policy updated");
    const onError = (err: unknown) =>
      showToast("error", (err as Error)?.message || "Failed to update retention policy");
    if (selectedDays === 0) {
      deleteRetention.mutate(logGroupName, { onSuccess, onError });
    } else {
      putRetention.mutate(
        { logGroupName, retentionInDays: selectedDays },
        { onSuccess, onError }
      );
    }
  }

  return (
    <SpaceBetween size="m">
      <Box variant="p">
        <strong>Current retention:</strong>{" "}
        {currentRetention ? `${currentRetention} days` : "Never expire"}
      </Box>

      <FormField
        label="Retention period"
        description="Number of days to retain log events. Setting 'Never expire' removes the retention policy."
      >
        <Select
          selectedOption={selectedRetention}
          onChange={({ detail }) => setSelectedRetention(detail.selectedOption)}
          options={RETENTION_OPTIONS}
        />
      </FormField>

      {isReducing && (
        <Alert type="warning">
          Lowering retention deletes log events older than the new period immediately —
          this can't be undone.
        </Alert>
      )}

      {putRetention.isError && (
        <Alert type="error" dismissible>
          {(putRetention.error as Error)?.message ||
            "Failed to update retention policy"}
        </Alert>
      )}

      <SpaceBetween direction="horizontal" size="xs">
        <Button
          variant="primary"
          loading={putRetention.isPending || deleteRetention.isPending}
          disabled={!selectedRetention.value}
          onClick={handleSave}
        >
          Save retention
        </Button>
      </SpaceBetween>
    </SpaceBetween>
  );
}

// ─── Subscription Filters ──────────────────────────────


function CloudWatchSubscriptionFilterList({
  logGroupName,
}: {
  logGroupName: string;
}) {
  const { data, isLoading, isError, error } = useSubscriptionFilters(logGroupName);
  const putFilter = usePutSubscriptionFilter();
  const deleteFilter = useDeleteSubscriptionFilter();
  const { showToast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  // Non-null while editing an existing filter (PutSubscriptionFilter upserts by name,
  // so "edit" just resubmits with the same filterName instead of delete + recreate).
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [form, setForm] = useState({
    filterName: "",
    filterPattern: "",
    destinationArn: "",
    distribution: "",
  });

  const items = (data?.subscriptionFilters || []).map((f) => ({
    filterName: f.filterName,
    filterPattern: f.filterPattern,
    destinationArn: f.destinationArn,
    distribution: f.distribution,
    creationTime: f.creationTime,
    roleArn: f.roleArn,
  }));

  function resetForm() {
    setForm({ filterName: "", filterPattern: "", destinationArn: "", distribution: "" });
    setEditingFilter(null);
  }

  function openEdit(item: (typeof items)[number]) {
    setForm({
      filterName: item.filterName,
      filterPattern: item.filterPattern || "",
      destinationArn: item.destinationArn,
      distribution: item.distribution || "",
    });
    setEditingFilter(item.filterName);
    setShowCreate(true);
  }

  function handleCreate() {
    if (!form.filterName || !form.destinationArn) return;
    putFilter.mutate(
      {
        logGroupName,
        filterName: form.filterName,
        filterPattern: form.filterPattern || undefined,
        destinationArn: form.destinationArn,
        distribution: form.distribution || undefined,
      },
      {
        onSuccess: () => {
          showToast("success", editingFilter ? "Subscription filter updated" : "Subscription filter created");
          setShowCreate(false);
          resetForm();
        },
      }
    );
  }

  return (
    <>
      {isError && (
        <StatusIndicator type="error">
          {(error as Error)?.message || "Failed to load subscription filters"}
        </StatusIndicator>
      )}

      <ResourceTable
        resourceName="Subscription Filter"
        headerTitle="Subscription Filters"
        headerCounter={data?.total}
        items={items}
        columns={[
          {
            id: "name",
            header: "Filter name",
            cell: (item: any) => item.filterName,
            isRowHeader: true,
          },
          {
            id: "destination",
            header: "Destination ARN",
            cell: (item: any) => (
              <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                {item.destinationArn}
              </span>
            ),
          },
          {
            id: "pattern",
            header: "Pattern",
            cell: (item: any) => item.filterPattern || "(all events)",
          },
          {
            id: "distribution",
            header: "Distribution",
            cell: (item: any) => item.distribution || "ByLogStream",
          },
          {
            id: "actions",
            header: "",
            cell: (item: any) => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="icon"
                  iconName="edit"
                  ariaLabel={`Edit ${item.filterName}`}
                  onClick={() => openEdit(item)}
                />
                <DeleteButton
                  itemName={item.filterName}
                  resourceType="subscription filter"
                  loading={
                    deleteFilter.isPending &&
                    deleteFilter.variables.filterName === item.filterName
                  }
                  onDelete={() =>
                    deleteFilter.mutateAsync({
                      logGroupName,
                      filterName: item.filterName,
                    })
                  }
                />
              </SpaceBetween>
            ),
          },
        ]}
        loading={isLoading}
        emptyMessage="No subscription filters"
        filterEnabled
        filterPlaceholder="Find filters by name"
        filterFunction={(item: any, searchText: string) =>
          item.filterName.toLowerCase().includes(searchText.toLowerCase())
        }
        onCreate={() => setShowCreate(true)}
      />

      <Modal
        visible={showCreate}
        onDismiss={() => {
          setShowCreate(false);
          resetForm();
        }}
        header={editingFilter ? `Edit Subscription Filter — ${editingFilter}` : "Create Subscription Filter"}
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={putFilter.isPending}
                disabled={!form.filterName || !form.destinationArn}
                onClick={handleCreate}
              >
                {editingFilter ? "Save changes" : "Create filter"}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          {putFilter.isError && (
            <Alert type="error" dismissible>
              {(putFilter.error as Error)?.message ||
                "Failed to save subscription filter"}
            </Alert>
          )}
          <SpaceBetween size="m">
            <FormField
              label="Filter name"
              description={
                editingFilter
                  ? "Filter names can't be changed once created."
                  : "A name for this subscription filter."
              }
            >
              <Input
                value={form.filterName}
                disabled={!!editingFilter}
                onChange={({ detail }) =>
                  setForm((p) => ({ ...p, filterName: detail.value }))
                }
                placeholder="my-filter"
              />
            </FormField>
            <FormField
              label="Destination ARN"
              description="The ARN of the destination (Lambda, Kinesis, or Firehose)."
            >
              <Input
                value={form.destinationArn}
                onChange={({ detail }) =>
                  setForm((p) => ({ ...p, destinationArn: detail.value }))
                }
                placeholder="arn:aws:lambda:us-east-1:..."
              />
            </FormField>
            <FormField
              label="Filter pattern (optional)"
              description="A filter pattern for matching log events. Leave empty to match all events."
            >
              <Input
                value={form.filterPattern}
                onChange={({ detail }) =>
                  setForm((p) => ({ ...p, filterPattern: detail.value }))
                }
                placeholder='?ERROR ?WARN'
              />
            </FormField>
            <FormField
              label="Distribution (optional)"
              description="How to distribute events among destination shards, for Kinesis destinations."
            >
              <Select
                selectedOption={
                  DISTRIBUTION_OPTIONS.find((o) => o.value === form.distribution) ||
                  DISTRIBUTION_OPTIONS[0]
                }
                onChange={({ detail }) =>
                  setForm((p) => ({ ...p, distribution: detail.selectedOption.value || "" }))
                }
                options={DISTRIBUTION_OPTIONS}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}

// ─── Log Group Tags ────────────────────────────────────


function CloudWatchLogGroupTags({ logGroupName }: { logGroupName: string }) {
  const { data, isLoading, isError, error } = useLogGroupTags(logGroupName);
  const tagMutation = useTagLogGroup();
  const untagMutation = useUntagLogGroup();
  const { showToast } = useToast();

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const tags = data?.tags || {};
  const tagEntries = Object.entries(tags).map(([key, value]) => ({ key, value }));
  // Typing an existing key into the same form re-saves (upserts) that tag's value,
  // so "edit" is just prefilling the add-tag inputs instead of a separate form.
  const isEditing = newKey !== "" && Object.prototype.hasOwnProperty.call(tags, newKey);

  function handleAddTag() {
    if (!newKey) return;
    const updated = { ...tags, [newKey]: newValue };
    tagMutation.mutate(
      { logGroupName, tags: updated },
      {
        onSuccess: () => {
          showToast("success", isEditing ? "Tag updated" : "Tag added");
          setNewKey("");
          setNewValue("");
        },
        onError: (err) => showToast("error", (err as Error)?.message || "Failed to save tag"),
      }
    );
  }

  function handleRemoveTag(key: string) {
    untagMutation.mutate(
      { logGroupName, tags: [key] },
      {
        onSuccess: () => showToast("success", "Tag removed"),
        onError: (err) => showToast("error", (err as Error)?.message || "Failed to remove tag"),
      }
    );
  }

  if (isLoading) {
    return <StatusIndicator type="loading">Loading tags...</StatusIndicator>;
  }

  if (isError) {
    return (
      <StatusIndicator type="error">
        {(error as Error)?.message || "Failed to load tags"}
      </StatusIndicator>
    );
  }

  return (
    <SpaceBetween size="m">
      {tagEntries.length === 0 && (
        <Box color="text-body-secondary">No tags associated with this log group.</Box>
      )}

      {tagEntries.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "2px solid var(--sh-line)",
              }}
            >
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.6875rem" }}>Key</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.6875rem" }}>Value</th>
              <th style={{ padding: "8px 12px", width: "60px", fontSize: "0.6875rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {tagEntries.map(({ key, value }) => (
              <tr
                key={key}
                style={{
                  borderBottom:
                    "1px solid var(--sh-line)",
                }}
              >
                <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{key}</td>
                <td style={{ padding: "8px 12px" }}>{value}</td>
                <td style={{ padding: "8px 12px" }}>
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      variant="icon"
                      iconName="edit"
                      ariaLabel={`Edit tag ${key}`}
                      onClick={() => { setNewKey(key); setNewValue(value); }}
                    />
                    <Button
                      variant="icon"
                      iconName="remove"
                      ariaLabel={`Remove tag ${key}`}
                      loading={untagMutation.isPending}
                      onClick={() => handleRemoveTag(key)}
                    />
                  </SpaceBetween>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* alignItems="flex-end": Key/Value have labels above them, the buttons don't —
          bottom-align so buttons line up with the input boxes instead of floating
          above them at the row's vertical center. */}
      <SpaceBetween direction="horizontal" size="xs" alignItems="flex-end">
        <FormField label="Key">
          <Input
            value={newKey}
            onChange={({ detail }) => setNewKey(detail.value)}
            placeholder="tag-key"
          />
        </FormField>
        <FormField label="Value">
          <Input
            value={newValue}
            onChange={({ detail }) => setNewValue(detail.value)}
            placeholder="tag-value"
          />
        </FormField>
        <Button
          variant="primary"
          loading={tagMutation.isPending}
          disabled={!newKey}
          onClick={handleAddTag}
        >
          {isEditing ? "Save tag" : "Add tag"}
        </Button>
        {isEditing && (
          <Button variant="link" onClick={() => { setNewKey(""); setNewValue(""); }}>
            Cancel
          </Button>
        )}
      </SpaceBetween>
    </SpaceBetween>
  );
}

// ─── Cluster Parameter Group List ──────────────────────


const RETENTION_OPTIONS: SelectProps.Option[] = [
  { label: "1 day", value: "1" },
  { label: "3 days", value: "3" },
  { label: "5 days", value: "5" },
  { label: "7 days", value: "7" },
  { label: "14 days", value: "14" },
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "120 days", value: "120" },
  { label: "150 days", value: "150" },
  { label: "180 days", value: "180" },
  { label: "365 days", value: "365" },
  { label: "400 days", value: "400" },
  { label: "545 days", value: "545" },
  { label: "731 days", value: "731" },
  { label: "1827 days", value: "1827" },
  { label: "3653 days", value: "3653" },
  { label: "Never expire", value: "0" },
];

const LOG_VIEW_LIMIT_OPTIONS: SelectProps.Option[] = [
  { label: "50", value: "50" },
  { label: "100", value: "100" },
  { label: "500", value: "500" },
  { label: "1000", value: "1000" },
  { label: "10000", value: "10000" },
];

// ─── Log level highlighting ─────────────────────────────
// Shared between the live stream viewer and the cross-stream search view.

// Covers the level vocabularies of the log frameworks/formats actually seen
// in AWS logs: Log4j/Logback/Python logging (ERROR/WARN/INFO/DEBUG/TRACE/
// CRITICAL), java.util.logging (SEVERE/CONFIG/FINE/FINER/FINEST), syslog
// (EMERG/ALERT/CRIT/ERR/NOTICE), and generic pass/fail words apps print
// directly (SUCCESS/FAIL/FAILED/EXCEPTION/PANIC). Grouped by severity color.
const LOG_LEVEL_COLORS: Record<string, string> = {
  // Fatal / error — red
  EMERGENCY: "var(--sh-fail)", EMERG: "var(--sh-fail)", ALERT: "var(--sh-fail)",
  CRITICAL: "var(--sh-fail)", CRIT: "var(--sh-fail)", FATAL: "var(--sh-fail)",
  PANIC: "var(--sh-fail)", SEVERE: "var(--sh-fail)",
  ERROR: "var(--sh-fail)", ERR: "var(--sh-fail)", EXCEPTION: "var(--sh-fail)",
  FAILED: "var(--sh-fail)", FAIL: "var(--sh-fail)",
  // Warning — amber
  WARNING: "var(--sh-warn)", WARN: "var(--sh-warn)",
  // Informational — blue
  INFORMATION: "var(--sh-info)", INFO: "var(--sh-info)", NOTICE: "var(--sh-info)",
  // Success — green
  SUCCESS: "var(--sh-ok)", OK: "var(--sh-ok)",
  // Verbose / low-level — dim
  DEBUG: "var(--sh-dim)", TRACE: "var(--sh-dim)", VERBOSE: "var(--sh-dim)",
  CONFIG: "var(--sh-dim)", FINE: "var(--sh-dim)", FINER: "var(--sh-dim)", FINEST: "var(--sh-dim)",
};

const LOG_LEVEL_WORDS = Object.keys(LOG_LEVEL_COLORS).join("|");

const LOG_LEVEL_PATTERN = new RegExp(`\\b(?:${LOG_LEVEL_WORDS})\\b`, "g");

/** Renders a log message with level keywords (ERROR, WARNING, SUCCESS, ...)
 * colored by severity and bolded, so they stand out while scanning. */
export function highlightLogLevels(message: string) {
  const parts = message.split(LOG_LEVEL_PATTERN);
  const matches = message.match(LOG_LEVEL_PATTERN) ?? [];
  const result: ReactNode[] = [];
  parts.forEach((part, i) => {
    result.push(<Fragment key={`t${i}`}>{part}</Fragment>);
    if (matches[i]) {
      result.push(
        <span key={`m${i}`} style={{ color: LOG_LEVEL_COLORS[matches[i]], fontWeight: 700 }}>
          {matches[i]}
        </span>,
      );
    }
  });
  return result;
}

/** Renders a log message as structured `key=value` fields if it parses as a
 * JSON object, falling back to level-keyword highlighting for plain text. */
export function renderLogMessage(message: string) {
  try {
    const parsed = JSON.parse(message);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return (
        <span className="tw:inline-flex tw:flex-col">
          {Object.entries(parsed).map(([key, value]) => (
            <span key={key} className="tw:block">
              <span className="tw:text-[var(--sh-dim)]">{key}=</span>
              <span>{typeof value === "string" ? value : JSON.stringify(value)}</span>
            </span>
          ))}
        </span>
      );
    }
  } catch {
    // not JSON, fall through to plain text highlighting
  }
  return highlightLogLevels(message);
}

const DISTRIBUTION_OPTIONS: SelectProps.Option[] = [
  { label: "ByLogStream (default)", value: "" },
  { label: "Random", value: "Random" },
];
