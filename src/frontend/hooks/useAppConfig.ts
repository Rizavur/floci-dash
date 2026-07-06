import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/client";

export interface AppConfigApplication {
  Id: string;
  Name: string;
  Description?: string;
}

export interface AppConfigEnvironment {
  Id: string;
  Name: string;
  ApplicationId: string;
  Description?: string;
  State?: string;
}

export interface AppConfigConfigurationProfile {
  Id: string;
  Name: string;
  ApplicationId: string;
  Type?: string;
  LocationUri?: string;
}

// ── Applications ─────────────────────────────────────────

export function useAppConfigApplications() {
  return useQuery<{ applications: AppConfigApplication[]; total: number }>({
    queryKey: ["aws", "appconfig", "applications"],
    queryFn: () => api("/aws/appconfig/applications"),
    refetchInterval: 10000,
  });
}

export function useCreateAppConfigApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { name: string; description?: string }) =>
      api("/aws/appconfig/applications", { method: "POST", body: JSON.stringify(params) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aws", "appconfig", "applications"] }),
  });
}

export function useDeleteAppConfigApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aws", "appconfig", "applications"] }),
  });
}

// ── Environments ─────────────────────────────────────────

export function useAppConfigEnvironments(applicationId: string | null) {
  return useQuery<{ environments: AppConfigEnvironment[]; total: number }>({
    queryKey: ["aws", "appconfig", "environments", applicationId],
    queryFn: () => api(`/aws/appconfig/applications/${encodeURIComponent(applicationId!)}/environments`),
    enabled: !!applicationId,
  });
}

export function useCreateAppConfigEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, name, description }: { appId: string; name: string; description?: string }) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(appId)}/environments`, {
        method: "POST",
        body: JSON.stringify({ name, description }),
      }),
    onSuccess: (_d, { appId }) =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "environments", appId] }),
  });
}

// ponytail: Floci has no DELETE for environments; hook omitted.

// ── Configuration Profiles ───────────────────────────────

export interface AppConfigHostedConfigVersion {
  VersionNumber: number;
  Description?: string;
  ContentType?: string;
}

export function useAppConfigProfiles(applicationId: string | null) {
  return useQuery<{ profiles: AppConfigConfigurationProfile[]; total: number }>({
    queryKey: ["aws", "appconfig", "profiles", applicationId],
    queryFn: () => api(`/aws/appconfig/applications/${encodeURIComponent(applicationId!)}/configuration-profiles`),
    enabled: !!applicationId,
  });
}

export function useCreateAppConfigProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, name, type, description }: { appId: string; name: string; type?: string; description?: string }) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(appId)}/configuration-profiles`, {
        method: "POST",
        body: JSON.stringify({ name, type, description }),
      }),
    onSuccess: (_d, { appId }) =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "profiles", appId] }),
  });
}

// ponytail: Floci has no DELETE for profiles; hook omitted.

// ── Deployment Strategies ─────────────────────────────────
// ponytail: Floci has no ListDeploymentStrategies endpoint; these 3 are hardcoded in Floci's switch.
export const APPCONFIG_BUILTIN_STRATEGIES = [
  { Id: "AppConfig.AllAtOnce", Name: "AppConfig.AllAtOnce (Quick)" },
  { Id: "AppConfig.Linear50PercentEvery30Seconds", Name: "AppConfig.Linear50PercentEvery30Seconds (Testing)" },
  { Id: "AppConfig.Canary10Percent20Minutes", Name: "AppConfig.Canary10Percent20Minutes (Recommended)" },
];

// ── Deployments ───────────────────────────────────────────

// ponytail: Floci has no ListDeployments; hook omitted.

export function useStartAppConfigDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      appId: string; envId: string;
      configurationProfileId: string; configurationVersion: string;
      deploymentStrategyId: string; description?: string;
    }) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(params.appId)}/environments/${encodeURIComponent(params.envId)}/deployments`, {
        method: "POST",
        body: JSON.stringify({
          configurationProfileId: params.configurationProfileId,
          configurationVersion: params.configurationVersion,
          deploymentStrategyId: params.deploymentStrategyId,
          description: params.description,
        }),
      }),
    onSuccess: (_d, { appId, envId }) =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "deployments", appId, envId] }),
  });
}

// ── Hosted Configuration Versions ────────────────────────

export function useAppConfigVersion(appId: string | null, profileId: string | null, versionNumber: number | null) {
  return useQuery<{ versionNumber: number; contentType: string; content: string; description?: string }>({
    queryKey: ["aws", "appconfig", "version", appId, profileId, versionNumber],
    queryFn: () =>
      api(`/aws/appconfig/applications/${encodeURIComponent(appId!)}/configuration-profiles/${encodeURIComponent(profileId!)}/versions/${versionNumber}`),
    enabled: !!appId && !!profileId && versionNumber != null,
  });
}

export function useAppConfigVersions(appId: string | null, profileId: string | null) {
  return useQuery<{ versions: AppConfigHostedConfigVersion[]; total: number }>({
    queryKey: ["aws", "appconfig", "versions", appId, profileId],
    queryFn: () =>
      api(`/aws/appconfig/applications/${encodeURIComponent(appId!)}/configuration-profiles/${encodeURIComponent(profileId!)}/versions`),
    enabled: !!appId && !!profileId,
  });
}

export function useCreateAppConfigVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, profileId, content, contentType, description }: {
      appId: string; profileId: string; content: string; contentType: string; description?: string;
    }) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(appId)}/configuration-profiles/${encodeURIComponent(profileId)}/versions`, {
        method: "POST",
        body: JSON.stringify({ content, contentType, description }),
      }),
    onSuccess: (_d, { appId, profileId }) =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "versions", appId, profileId] }),
  });
}
