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

export interface AppConfigHostedConfigurationVersionSummary {
  VersionNumber: number;
  Description?: string;
  ContentType?: string;
}

export interface AppConfigHostedConfigurationVersion {
  applicationId: string;
  configurationProfileId: string;
  versionNumber: number;
  contentType?: string;
  description?: string;
  content: string;
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

export function useCreateAppConfigEnvironment(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { name: string; description?: string }) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(applicationId)}/environments`, {
        method: "POST",
        body: JSON.stringify(params),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "environments", applicationId] }),
  });
}

export function useDeleteAppConfigEnvironment(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (environmentId: string) =>
      api(
        `/aws/appconfig/applications/${encodeURIComponent(applicationId)}/environments/${encodeURIComponent(environmentId)}`,
        { method: "DELETE" }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "environments", applicationId] }),
  });
}

// ── Configuration Profiles ───────────────────────────────

export function useAppConfigProfiles(applicationId: string | null) {
  return useQuery<{ profiles: AppConfigConfigurationProfile[]; total: number }>({
    queryKey: ["aws", "appconfig", "profiles", applicationId],
    queryFn: () => api(`/aws/appconfig/applications/${encodeURIComponent(applicationId!)}/configuration-profiles`),
    enabled: !!applicationId,
  });
}

export function useCreateAppConfigProfile(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { name: string; locationUri?: string; type?: string; description?: string }) =>
      api(`/aws/appconfig/applications/${encodeURIComponent(applicationId)}/configuration-profiles`, {
        method: "POST",
        body: JSON.stringify(params),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "profiles", applicationId] }),
  });
}

export function useDeleteAppConfigProfile(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) =>
      api(
        `/aws/appconfig/applications/${encodeURIComponent(applicationId)}/configuration-profiles/${encodeURIComponent(profileId)}`,
        { method: "DELETE" }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "profiles", applicationId] }),
  });
}

// ── Hosted Configuration Versions (the actual config value) ─

export function useAppConfigVersions(applicationId: string | null, profileId: string | null) {
  return useQuery<{ versions: AppConfigHostedConfigurationVersionSummary[]; total: number }>({
    queryKey: ["aws", "appconfig", "versions", applicationId, profileId],
    queryFn: () =>
      api(
        `/aws/appconfig/applications/${encodeURIComponent(applicationId!)}/configuration-profiles/${encodeURIComponent(profileId!)}/versions`
      ),
    enabled: !!applicationId && !!profileId,
  });
}

export function useAppConfigVersion(
  applicationId: string | null,
  profileId: string | null,
  versionNumber: number | null
) {
  return useQuery<{ version: AppConfigHostedConfigurationVersion }>({
    queryKey: ["aws", "appconfig", "version", applicationId, profileId, versionNumber],
    queryFn: () =>
      api(
        `/aws/appconfig/applications/${encodeURIComponent(applicationId!)}/configuration-profiles/${encodeURIComponent(profileId!)}/versions/${versionNumber}`
      ),
    enabled: !!applicationId && !!profileId && versionNumber != null,
  });
}

export function useCreateAppConfigVersion(applicationId: string, profileId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { content: string; contentType?: string; description?: string }) =>
      api(
        `/aws/appconfig/applications/${encodeURIComponent(applicationId)}/configuration-profiles/${encodeURIComponent(profileId)}/versions`,
        { method: "POST", body: JSON.stringify(params) }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aws", "appconfig", "versions", applicationId, profileId] }),
  });
}

// ── Deployments (activates a version for an environment) ────

export const APPCONFIG_DEPLOYMENT_STRATEGY_OPTIONS = [
  { label: "AllAtOnce (quick)", value: "AppConfig.AllAtOnce" },
  { label: "Linear50PercentEvery30Seconds (test/demo)", value: "AppConfig.Linear50PercentEvery30Seconds" },
  { label: "Canary10Percent20Minutes (AWS recommended)", value: "AppConfig.Canary10Percent20Minutes" },
];

export function useStartAppConfigDeployment(applicationId: string, environmentId: string) {
  return useMutation({
    mutationFn: (params: {
      configurationProfileId: string;
      configurationVersion: string;
      deploymentStrategyId: string;
      description?: string;
    }) =>
      api(
        `/aws/appconfig/applications/${encodeURIComponent(applicationId)}/environments/${encodeURIComponent(environmentId)}/deployments`,
        { method: "POST", body: JSON.stringify(params) }
      ),
  });
}
