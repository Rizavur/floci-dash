// Auto-split from ServicePage.tsx. Shared import preamble is intentional;
// unused imports are tree-shaken at build (noUnusedLocals is off).
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
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
  useCreateAppConfigApplication,
  useDeleteAppConfigApplication,
  useAppConfigEnvironments,
  useCreateAppConfigEnvironment,
  useAppConfigProfiles,
  useCreateAppConfigProfile,
  useAppConfigVersion,
  useAppConfigVersions,
  useCreateAppConfigVersion,
  useStartAppConfigDeployment,
  APPCONFIG_BUILTIN_STRATEGIES,
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

// ── Active config fetcher — sits on the environments tab ──
function ActiveConfigPanel({ appId, envId, profileId }: { appId: string; envId: string; profileId: string }) {
  const startSession = useStartConfigurationSession();
  const getLatest = useGetLatestConfiguration();
  const [content, setContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [error, setError] = useState("");

  async function fetch() {
    setError(""); setContent(null);
    try {
      const session = await startSession.mutateAsync({
        ApplicationIdentifier: appId,
        EnvironmentIdentifier: envId,
        ConfigurationProfileIdentifier: profileId,
      });
      const res = await getLatest.mutateAsync({ configurationToken: session.initialConfigurationToken });
      setContent(res.content ?? "(no content — nothing deployed yet)");
      setContentType(res.contentType ?? "");
      setVersionLabel(res.versionLabel ?? "");
    } catch (e: any) {
      setError(e.message || "Failed to fetch active configuration");
    }
  }

  const loading = startSession.isPending || getLatest.isPending;

  return (
    <SpaceBetween size="s">
      {error && <Alert type="error">{error}</Alert>}
      <Button variant="primary" loading={loading} onClick={fetch}>
        Fetch Active Config
      </Button>
      {content != null && (
        <SpaceBetween size="xs">
          <Box color="text-body-secondary" fontSize="body-s">
            {versionLabel ? `Version: ${versionLabel}` : ""}{contentType ? `  ·  ${contentType}` : ""}
          </Box>
          <Textarea value={content} readOnly rows={12} />
        </SpaceBetween>
      )}
    </SpaceBetween>
  );
}
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

// ── AppConfig sub-component: profile versions + create/view version modals ────
function AppConfigProfileVersions({ appId, profileId }: { appId: string; profileId: string }) {
  const { data } = useAppConfigVersions(appId, profileId);
  const createVersion = useCreateAppConfigVersion();

  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState('{\n  "enabled": true\n}');
  const [contentType, setContentType] = useState("application/json");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState("");

  const [viewVersion, setViewVersion] = useState<number | null>(null);
  const { data: versionDetail, isLoading: versionLoading } = useAppConfigVersion(appId, profileId, viewVersion);

  function handleCreate() {
    setCreateError("");
    if (!content.trim()) { setCreateError("Content is required"); return; }
    createVersion.mutate(
      { appId, profileId, content, contentType, description },
      {
        onSuccess: () => { setShowCreate(false); setContent('{\n  "enabled": true\n}'); setDescription(""); },
        onError: (e: any) => setCreateError(e.message || "Failed to create version"),
      }
    );
  }

  return (
    <>
      <ResourceTable
        resourceName="Version"
        headerTitle="Hosted Configuration Versions"
        headerCounter={data?.total}
        items={(data?.versions || []).map((v: any) => ({
          id: String(v.VersionNumber),
          version: v.VersionNumber,
          contentType: v.ContentType || "-",
          description: v.Description || "-",
        }))}
        loading={false}
        emptyMessage="No configuration versions"
        onCreate={() => setShowCreate(true)}
        columns={[
          {
            id: "version", header: "Version", isRowHeader: true,
            cell: (i: any) => (
              <Button variant="link" onClick={() => setViewVersion(i.version)}>
                {i.version}
              </Button>
            ),
          },
          { id: "contentType", header: "Content Type", cell: (i: any) => i.contentType },
          { id: "description", header: "Description", cell: (i: any) => i.description },
        ]}
        filterEnabled={false}
      />

      {/* View version content */}
      <Modal
        visible={viewVersion != null}
        onDismiss={() => setViewVersion(null)}
        header={`Version ${viewVersion} — Content`}
        footer={<Button variant="link" onClick={() => setViewVersion(null)}>Close</Button>}
      >
        {versionLoading ? (
          <Spinner />
        ) : (
          <SpaceBetween size="s">
            <Box color="text-body-secondary" fontSize="body-s">
              {versionDetail?.contentType}
            </Box>
            <Textarea
              value={versionDetail?.content ?? ""}
              readOnly
              rows={16}
            />
          </SpaceBetween>
        )}
      </Modal>

      {/* Create version */}
      <Modal
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
        header="Create Hosted Configuration Version"
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" loading={createVersion.isPending} onClick={handleCreate}>
              Create version
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="m">
          {createError && <Alert type="error">{createError}</Alert>}
          <FormField label="Content Type">
            <Select
              selectedOption={{ label: contentType, value: contentType }}
              onChange={(e) => setContentType(e.detail.selectedOption.value!)}
              options={[
                { label: "application/json", value: "application/json" },
                { label: "application/x-yaml", value: "application/x-yaml" },
                { label: "text/plain", value: "text/plain" },
              ]}
            />
          </FormField>
          <FormField label="Description" constraintText="Optional">
            <Input value={description} onChange={(e) => setDescription(e.detail.value)} placeholder="Version description" />
          </FormField>
          <FormField label="Content" description="JSON, YAML, or plain text configuration">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.detail.value)}
              rows={12}
              placeholder='{"featureFlag": true}'
            />
          </FormField>
        </SpaceBetween>
      </Modal>
    </>
  );
}

export function AppConfigDashboard() {
  const { data, isLoading } = useAppConfigApplications();
  const createApp = useCreateAppConfigApplication();
  const deleteApp = useDeleteAppConfigApplication();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedApp = searchParams.get("app");
  const selectedProfile = searchParams.get("profile");
  const setSelectedApp = (id: string | null) => setSearchParams(id ? { app: id } : {});
  const setSelectedProfile = (id: string | null) =>
    setSearchParams(id && selectedApp ? { app: selectedApp, profile: id } : selectedApp ? { app: selectedApp } : {});
  const { data: envData } = useAppConfigEnvironments(selectedApp);
  const createEnv = useCreateAppConfigEnvironment();
  const { data: profileData } = useAppConfigProfiles(selectedApp);
  const createProfile = useCreateAppConfigProfile();
  const startDeployment = useStartAppConfigDeployment();

  // Active config viewer state
  const [activeEnvId, setActiveEnvId] = useState("");
  const [activeProfileId, setActiveProfileId] = useState("");

  // Deploy modal state
  const [deployEnvId, setDeployEnvId] = useState<string | null>(null);
  const [deployProfileId, setDeployProfileId] = useState("");
  const [deployVersion, setDeployVersion] = useState("");
  const [deployStrategyId, setDeployStrategyId] = useState("");
  const [deployError, setDeployError] = useState("");
  const [deploySuccess, setDeploySuccess] = useState("");
  // Versions for selected profile in deploy modal
  const { data: deployVersionsData } = useAppConfigVersions(selectedApp, deployProfileId || null);

  // Create app modal state
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [appName, setAppName] = useState("");
  const [appDesc, setAppDesc] = useState("");
  const [appError, setAppError] = useState("");

  // Create env modal state
  const [showCreateEnv, setShowCreateEnv] = useState(false);
  const [envName, setEnvName] = useState("");
  const [envDesc, setEnvDesc] = useState("");
  const [envError, setEnvError] = useState("");

  // Create profile modal state
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileType, setProfileType] = useState("AWS.AppConfig.FeatureFlags");
  const [profileDesc, setProfileDesc] = useState("");
  const [profileError, setProfileError] = useState("");

  function handleCreateApp() {
    setAppError("");
    if (!appName.trim()) { setAppError("Name is required"); return; }
    createApp.mutate(
      { name: appName, description: appDesc },
      {
        onSuccess: () => { setShowCreateApp(false); setAppName(""); setAppDesc(""); },
        onError: (e: any) => setAppError(e.message || "Failed to create application"),
      }
    );
  }

  function handleCreateEnv() {
    setEnvError("");
    if (!envName.trim()) { setEnvError("Name is required"); return; }
    createEnv.mutate(
      { appId: selectedApp!, name: envName, description: envDesc },
      {
        onSuccess: () => { setShowCreateEnv(false); setEnvName(""); setEnvDesc(""); },
        onError: (e: any) => setEnvError(e.message || "Failed to create environment"),
      }
    );
  }

  function handleCreateProfile() {
    setProfileError("");
    if (!profileName.trim()) { setProfileError("Name is required"); return; }
    createProfile.mutate(
      { appId: selectedApp!, name: profileName, type: profileType, description: profileDesc },
      {
        onSuccess: () => { setShowCreateProfile(false); setProfileName(""); setProfileDesc(""); },
        onError: (e: any) => setProfileError(e.message || "Failed to create profile"),
      }
    );
  }

  function handleDeploy() {
    setDeployError("");
    if (!deployProfileId) { setDeployError("Select a configuration profile"); return; }
    if (!deployVersion) { setDeployError("Select a configuration version"); return; }
    if (!deployStrategyId) { setDeployError("Select a deployment strategy"); return; }
    startDeployment.mutate(
      {
        appId: selectedApp!,
        envId: deployEnvId!,
        configurationProfileId: deployProfileId,
        configurationVersion: deployVersion,
        deploymentStrategyId: deployStrategyId,
      },
      {
        onSuccess: (res: any) => {
          const envName = envData?.environments.find((e: any) => e.Id === deployEnvId)?.Name ?? deployEnvId;
          const profName = profileData?.profiles.find((p: any) => p.Id === deployProfileId)?.Name ?? deployProfileId;
          setDeploySuccess(`Deployed ${profName} v${deployVersion} to ${envName} — deployment #${res.deploymentNumber} is ${res.state}.`);
          setDeployEnvId(null);
          setDeployProfileId("");
          setDeployVersion("");
          setDeployStrategyId("");
        },
        onError: (e: any) => setDeployError(e.message || "Failed to start deployment"),
      }
    );
  }

  // Profile detail (versions) view
  if (selectedApp && selectedProfile) {
    const profile = profileData?.profiles.find((p: any) => p.Id === selectedProfile);
    return (
      <>
        <Box margin={{ bottom: "s" }}>
          <SpaceBetween direction="horizontal" size="xs">
            <Button iconName="arrow-left" onClick={() => setSelectedProfile(null)}>
              Back to application
            </Button>
          </SpaceBetween>
        </Box>
        {profile && (
          <Box margin={{ bottom: "s" }}>
            <SpaceBetween direction="horizontal" size="xs">
              <Box fontWeight="bold">{profile.Name}</Box>
              <Box color="text-body-secondary">{profile.Type || "Profile"}</Box>
            </SpaceBetween>
          </Box>
        )}
        <AppConfigProfileVersions appId={selectedApp} profileId={selectedProfile} />
      </>
    );
  }

  // Application detail (environments + profiles tabs)
  if (selectedApp) {
    return (
      <>
        <Box margin={{ bottom: "s" }}>
          <Button iconName="arrow-left" onClick={() => setSelectedApp(null)}>
            Back to applications
          </Button>
        </Box>
        <Tabs
          tabs={[
            {
              id: "environments",
              label: "Environments",
              content: (
                <>
                  <ResourceTable
                    resourceName="Environment"
                    headerTitle="Environments"
                    headerCounter={envData?.total}
                    items={(envData?.environments || []).map((e: any) => ({
                      id: e.Id,
                      name: e.Name,
                      state: e.State || "-",
                      description: e.Description || "-",
                    }))}
                    loading={false}
                    emptyMessage="No environments"
                    onCreate={() => setShowCreateEnv(true)}
                    columns={[
                      { id: "name", header: "Name", cell: (i: any) => i.name, isRowHeader: true },
                      { id: "state", header: "State", cell: (i: any) => i.state },
                      { id: "description", header: "Description", cell: (i: any) => i.description },
                      {
                        id: "actions", header: "",
                        cell: (i: any) => (
                          <Button
                            variant="primary"
                            onClick={() => { setDeployEnvId(i.id); setDeployError(""); setDeploySuccess(""); }}
                          >
                            Deploy
                          </Button>
                        ),
                      },
                    ]}
                    filterEnabled
                    filterPlaceholder="Find environments"
                    filterFunction={(i: any, s: string) => i.name.toLowerCase().includes(s.toLowerCase())}
                  />
                  {deploySuccess && (
                    <Box margin={{ top: "s" }}>
                      <Alert type="success" dismissible onDismiss={() => setDeploySuccess("")}>
                        {deploySuccess}
                      </Alert>
                    </Box>
                  )}
                  <Box margin={{ top: "l" }}>
                    <Container header={<Header variant="h3">Active Configuration</Header>}>
                      <SpaceBetween size="m">
                        <SpaceBetween direction="horizontal" size="s">
                          <FormField label="Environment">
                            <Select
                              selectedOption={activeEnvId ? { label: envData?.environments.find((e: any) => e.Id === activeEnvId)?.Name ?? activeEnvId, value: activeEnvId } : null}
                              onChange={(e) => setActiveEnvId(e.detail.selectedOption.value!)}
                              options={(envData?.environments || []).map((e: any) => ({ label: e.Name, value: e.Id }))}
                              placeholder="Select environment"
                            />
                          </FormField>
                          <FormField label="Configuration Profile">
                            <Select
                              selectedOption={activeProfileId ? { label: profileData?.profiles.find((p: any) => p.Id === activeProfileId)?.Name ?? activeProfileId, value: activeProfileId } : null}
                              onChange={(e) => setActiveProfileId(e.detail.selectedOption.value!)}
                              options={(profileData?.profiles || []).map((p: any) => ({ label: p.Name, value: p.Id }))}
                              placeholder="Select profile"
                            />
                          </FormField>
                        </SpaceBetween>
                        {activeEnvId && activeProfileId && selectedApp && (
                          <ActiveConfigPanel appId={selectedApp} envId={activeEnvId} profileId={activeProfileId} />
                        )}
                      </SpaceBetween>
                    </Container>
                  </Box>
                  <Modal
                    visible={showCreateEnv}
                    onDismiss={() => setShowCreateEnv(false)}
                    header="Create Environment"
                    footer={
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => setShowCreateEnv(false)}>Cancel</Button>
                        <Button variant="primary" loading={createEnv.isPending} onClick={handleCreateEnv}>Create</Button>
                      </SpaceBetween>
                    }
                  >
                    <SpaceBetween size="m">
                      {envError && <Alert type="error">{envError}</Alert>}
                      <FormField label="Name">
                        <Input value={envName} onChange={(e) => setEnvName(e.detail.value)} placeholder="production" />
                      </FormField>
                      <FormField label="Description" constraintText="Optional">
                        <Input value={envDesc} onChange={(e) => setEnvDesc(e.detail.value)} placeholder="Production environment" />
                      </FormField>
                    </SpaceBetween>
                  </Modal>
                  <Modal
                    visible={deployEnvId != null}
                    onDismiss={() => setDeployEnvId(null)}
                    header="Start Deployment"
                    footer={
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => setDeployEnvId(null)}>Cancel</Button>
                        <Button variant="primary" loading={startDeployment.isPending} onClick={handleDeploy}>Deploy</Button>
                      </SpaceBetween>
                    }
                  >
                    <SpaceBetween size="m">
                      {deployError && <Alert type="error">{deployError}</Alert>}
                      <FormField label="Configuration Profile">
                        <Select
                          selectedOption={deployProfileId ? { label: profileData?.profiles.find((p: any) => p.Id === deployProfileId)?.Name ?? deployProfileId, value: deployProfileId } : null}
                          onChange={(e) => { setDeployProfileId(e.detail.selectedOption.value!); setDeployVersion(""); }}
                          options={(profileData?.profiles || []).map((p: any) => ({ label: p.Name, value: p.Id }))}
                          placeholder="Select a profile"
                        />
                      </FormField>
                      <FormField label="Configuration Version">
                        <Select
                          selectedOption={deployVersion ? { label: `Version ${deployVersion}`, value: deployVersion } : null}
                          onChange={(e) => setDeployVersion(e.detail.selectedOption.value!)}
                          options={(deployVersionsData?.versions || []).map((v: any) => ({ label: `Version ${v.VersionNumber}`, value: String(v.VersionNumber) }))}
                          placeholder={deployProfileId ? "Select a version" : "Select a profile first"}
                          disabled={!deployProfileId}
                        />
                      </FormField>
                      <FormField label="Deployment Strategy">
                        <Select
                          selectedOption={deployStrategyId ? { label: APPCONFIG_BUILTIN_STRATEGIES.find((s) => s.Id === deployStrategyId)?.Name ?? deployStrategyId, value: deployStrategyId } : null}
                          onChange={(e) => setDeployStrategyId(e.detail.selectedOption.value!)}
                          options={APPCONFIG_BUILTIN_STRATEGIES.map((s) => ({ label: s.Name, value: s.Id }))}
                          placeholder="Select a strategy"
                        />
                      </FormField>
                    </SpaceBetween>
                  </Modal>
                </>
              ),
            },
            {
              id: "profiles",
              label: "Configuration Profiles",
              content: (
                <>
                  <ResourceTable
                    resourceName="Profile"
                    headerTitle="Configuration Profiles"
                    headerCounter={profileData?.total}
                    items={(profileData?.profiles || []).map((p: any) => ({
                      id: p.Id,
                      name: p.Name,
                      type: p.Type || "-",
                      location: p.LocationUri || "-",
                    }))}
                    loading={false}
                    emptyMessage="No configuration profiles"
                    onCreate={() => setShowCreateProfile(true)}
                    columns={[
                      {
                        id: "name", header: "Name", isRowHeader: true,
                        cell: (i: any) => (
                          <Button variant="link" onClick={() => setSelectedProfile(i.id)}>
                            {i.name}
                          </Button>
                        ),
                      },
                      { id: "type", header: "Type", cell: (i: any) => i.type },
                      { id: "location", header: "Location", cell: (i: any) => i.location },
                    ]}
                    filterEnabled
                    filterPlaceholder="Find profiles"
                    filterFunction={(i: any, s: string) => i.name.toLowerCase().includes(s.toLowerCase())}
                  />
                  <Modal
                    visible={showCreateProfile}
                    onDismiss={() => setShowCreateProfile(false)}
                    header="Create Configuration Profile"
                    footer={
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => setShowCreateProfile(false)}>Cancel</Button>
                        <Button variant="primary" loading={createProfile.isPending} onClick={handleCreateProfile}>Create</Button>
                      </SpaceBetween>
                    }
                  >
                    <SpaceBetween size="m">
                      {profileError && <Alert type="error">{profileError}</Alert>}
                      <FormField label="Name">
                        <Input value={profileName} onChange={(e) => setProfileName(e.detail.value)} placeholder="my-feature-flags" />
                      </FormField>
                      <FormField label="Type">
                        <Select
                          selectedOption={{ label: profileType, value: profileType }}
                          onChange={(e) => setProfileType(e.detail.selectedOption.value!)}
                          options={[
                            { label: "AWS.AppConfig.FeatureFlags", value: "AWS.AppConfig.FeatureFlags" },
                            { label: "AWS.Freeform", value: "AWS.Freeform" },
                          ]}
                        />
                      </FormField>
                      <FormField label="Description" constraintText="Optional">
                        <Input value={profileDesc} onChange={(e) => setProfileDesc(e.detail.value)} placeholder="Feature toggle profile" />
                      </FormField>
                    </SpaceBetween>
                  </Modal>
                </>
              ),
            },
          ]}
        />
      </>
    );
  }

  // Top-level: applications list
  return (
    <>
      <ResourceTable
        resourceName="Application"
        headerTitle="AppConfig Applications"
        headerCounter={data?.total}
        items={(data?.applications || []).map((a: any) => ({
          id: a.Id,
          name: a.Name,
          description: a.Description || "-",
        }))}
        loading={isLoading}
        emptyMessage="No AppConfig applications"
        onCreate={() => setShowCreateApp(true)}
        columns={[
          {
            id: "name",
            header: "Name",
            cell: (i: any) => (
              <Button variant="link" onClick={() => setSelectedApp(i.id)}>
                {i.name}
              </Button>
            ),
            isRowHeader: true,
          },
          { id: "id", header: "Application ID", cell: (i: any) => i.id },
          { id: "description", header: "Description", cell: (i: any) => i.description },
          {
            id: "actions",
            header: "",
            cell: (i: any) => (
              <DeleteButton
                itemName={i.name}
                resourceType="application"
                loading={deleteApp.isPending && deleteApp.variables === i.id}
                onDelete={() => deleteApp.mutateAsync(i.id)}
              />
            ),
          },
        ]}
        filterEnabled
        filterPlaceholder="Find applications"
        filterFunction={(i: any, s: string) => i.name.toLowerCase().includes(s.toLowerCase())}
      />
      <Modal
        visible={showCreateApp}
        onDismiss={() => setShowCreateApp(false)}
        header="Create AppConfig Application"
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => setShowCreateApp(false)}>Cancel</Button>
            <Button variant="primary" loading={createApp.isPending} onClick={handleCreateApp}>Create</Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="m">
          {appError && <Alert type="error">{appError}</Alert>}
          <FormField label="Name">
            <Input value={appName} onChange={(e) => setAppName(e.detail.value)} placeholder="my-app" />
          </FormField>
          <FormField label="Description" constraintText="Optional">
            <Input value={appDesc} onChange={(e) => setAppDesc(e.detail.value)} placeholder="My application" />
          </FormField>
        </SpaceBetween>
      </Modal>
    </>
  );
}

// ────────────────────────────────────────────────────────
//  Cloud Map
// ────────────────────────────────────────────────────────

