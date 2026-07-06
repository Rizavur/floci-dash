// Auto-split from ServicePage.tsx. Shared import preamble is intentional;
// unused imports are tree-shaken at build (noUnusedLocals is off).
import { useParams, useNavigate } from "react-router-dom";
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
  useDeleteAppConfigEnvironment,
  useAppConfigProfiles,
  useCreateAppConfigProfile,
  useDeleteAppConfigProfile,
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

const APPCONFIG_PROFILE_TYPE_OPTIONS: SelectProps.Option[] = [
  { label: "Freeform configuration", value: "AWS.Freeform" },
  { label: "Feature flags", value: "AWS.AppConfig.FeatureFlags" },
];

export function AppConfigDashboard() {
  const { data, isLoading } = useAppConfigApplications();
  const createApp = useCreateAppConfigApplication();
  const deleteApp = useDeleteAppConfigApplication();
  const [selectedApp, setSelectedApp] = useUrlSelection("app");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (selectedApp) {
    return <AppConfigApplicationDetail applicationId={selectedApp} onBack={() => setSelectedApp(null)} />;
  }

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
        onCreate={() => setShowCreate(true)}
      />

      <Modal
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
        header="Create application"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={createApp.isPending}
                disabled={!name.trim()}
                onClick={() =>
                  createApp.mutate(
                    { name: name.trim(), description: description.trim() || undefined },
                    {
                      onSuccess: () => {
                        setShowCreate(false);
                        setName("");
                        setDescription("");
                      },
                    }
                  )
                }
              >
                Create
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          {createApp.isError && (
            <Alert type="error" dismissible>
              {(createApp.error as Error)?.message || "Failed to create application"}
            </Alert>
          )}
          <FormField label="Application name">
            <Input value={name} onChange={({ detail }) => setName(detail.value)} placeholder="my-app" />
          </FormField>
          <FormField label="Description (optional)">
            <Input value={description} onChange={({ detail }) => setDescription(detail.value)} />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}

function AppConfigApplicationDetail({
  applicationId,
  onBack,
}: {
  applicationId: string;
  onBack: () => void;
}) {
  const { data: envData } = useAppConfigEnvironments(applicationId);
  const { data: profileData } = useAppConfigProfiles(applicationId);
  const createEnv = useCreateAppConfigEnvironment(applicationId);
  const deleteEnv = useDeleteAppConfigEnvironment(applicationId);
  const createProfile = useCreateAppConfigProfile(applicationId);
  const deleteProfile = useDeleteAppConfigProfile(applicationId);

  const [showCreateEnv, setShowCreateEnv] = useState(false);
  const [envName, setEnvName] = useState("");
  const [envDescription, setEnvDescription] = useState("");

  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileType, setProfileType] = useState<SelectProps.Option>(APPCONFIG_PROFILE_TYPE_OPTIONS[0]);
  const [profileDescription, setProfileDescription] = useState("");

  return (
    <>
      <Box margin={{ bottom: "s" }}>
        <Button iconName="arrow-left" onClick={onBack}>
          Back to applications
        </Button>
      </Box>
      <Tabs
        tabs={[
          {
            id: "environments",
            label: "Environments",
            content: (
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
                columns={[
                  { id: "name", header: "Name", cell: (i: any) => i.name, isRowHeader: true },
                  { id: "state", header: "State", cell: (i: any) => i.state },
                  { id: "description", header: "Description", cell: (i: any) => i.description },
                  {
                    id: "actions",
                    header: "",
                    cell: (i: any) => (
                      <DeleteButton
                        itemName={i.name}
                        resourceType="environment"
                        loading={deleteEnv.isPending && deleteEnv.variables === i.id}
                        onDelete={() => deleteEnv.mutateAsync(i.id)}
                      />
                    ),
                  },
                ]}
                filterEnabled
                filterPlaceholder="Find environments"
                filterFunction={(i: any, s: string) => i.name.toLowerCase().includes(s.toLowerCase())}
                onCreate={() => setShowCreateEnv(true)}
              />
            ),
          },
          {
            id: "profiles",
            label: "Configuration Profiles",
            content: (
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
                columns={[
                  { id: "name", header: "Name", cell: (i: any) => i.name, isRowHeader: true },
                  { id: "type", header: "Type", cell: (i: any) => i.type },
                  { id: "location", header: "Location", cell: (i: any) => i.location },
                  {
                    id: "actions",
                    header: "",
                    cell: (i: any) => (
                      <DeleteButton
                        itemName={i.name}
                        resourceType="configuration profile"
                        loading={deleteProfile.isPending && deleteProfile.variables === i.id}
                        onDelete={() => deleteProfile.mutateAsync(i.id)}
                      />
                    ),
                  },
                ]}
                filterEnabled
                filterPlaceholder="Find profiles"
                filterFunction={(i: any, s: string) => i.name.toLowerCase().includes(s.toLowerCase())}
                onCreate={() => setShowCreateProfile(true)}
              />
            ),
          },
        ]}
      />

      <Modal
        visible={showCreateEnv}
        onDismiss={() => setShowCreateEnv(false)}
        header="Create environment"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowCreateEnv(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={createEnv.isPending}
                disabled={!envName.trim()}
                onClick={() =>
                  createEnv.mutate(
                    { name: envName.trim(), description: envDescription.trim() || undefined },
                    {
                      onSuccess: () => {
                        setShowCreateEnv(false);
                        setEnvName("");
                        setEnvDescription("");
                      },
                    }
                  )
                }
              >
                Create
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          {createEnv.isError && (
            <Alert type="error" dismissible>
              {(createEnv.error as Error)?.message || "Failed to create environment"}
            </Alert>
          )}
          <FormField label="Environment name">
            <Input value={envName} onChange={({ detail }) => setEnvName(detail.value)} placeholder="production" />
          </FormField>
          <FormField label="Description (optional)">
            <Input value={envDescription} onChange={({ detail }) => setEnvDescription(detail.value)} />
          </FormField>
        </Form>
      </Modal>

      <Modal
        visible={showCreateProfile}
        onDismiss={() => setShowCreateProfile(false)}
        header="Create configuration profile"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowCreateProfile(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={createProfile.isPending}
                disabled={!profileName.trim()}
                onClick={() =>
                  createProfile.mutate(
                    {
                      name: profileName.trim(),
                      type: profileType.value,
                      description: profileDescription.trim() || undefined,
                    },
                    {
                      onSuccess: () => {
                        setShowCreateProfile(false);
                        setProfileName("");
                        setProfileDescription("");
                      },
                    }
                  )
                }
              >
                Create
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          {createProfile.isError && (
            <Alert type="error" dismissible>
              {(createProfile.error as Error)?.message || "Failed to create configuration profile"}
            </Alert>
          )}
          <FormField label="Profile name">
            <Input value={profileName} onChange={({ detail }) => setProfileName(detail.value)} placeholder="app-config" />
          </FormField>
          <FormField label="Type">
            <Select
              selectedOption={profileType}
              onChange={({ detail }) => setProfileType(detail.selectedOption)}
              options={APPCONFIG_PROFILE_TYPE_OPTIONS}
            />
          </FormField>
          <FormField label="Description (optional)">
            <Input value={profileDescription} onChange={({ detail }) => setProfileDescription(detail.value)} />
          </FormField>
        </Form>
      </Modal>
    </>
  );
}

// ────────────────────────────────────────────────────────
//  Cloud Map
// ────────────────────────────────────────────────────────

