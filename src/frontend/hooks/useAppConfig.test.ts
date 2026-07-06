// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/helpers";

const mockApi = vi.hoisted(() => vi.fn());
vi.mock("../lib/client", () => ({ api: (...args: any[]) => mockApi(...args) }));
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual: any = await importOriginal();
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
});

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
} from "./useAppConfig";

beforeEach(() => mockApi.mockReset());

describe("useAppConfig hooks", () => {
  it("useAppConfigApplications calls correct URL", async () => {
    mockApi.mockResolvedValueOnce({ applications: [], total: 0 });
    const { result } = renderHook(() => useAppConfigApplications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications");
  });

  it("useCreateAppConfigApplication calls POST", async () => {
    mockApi.mockResolvedValueOnce({ application: {} });
    const { result } = renderHook(() => useCreateAppConfigApplication(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ name: "myapp" });
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications", {
      method: "POST",
      body: JSON.stringify({ name: "myapp" }),
    });
  });

  it("useDeleteAppConfigApplication calls DELETE", async () => {
    mockApi.mockResolvedValueOnce({ deleted: true });
    const { result } = renderHook(() => useDeleteAppConfigApplication(), { wrapper: createWrapper() });
    await result.current.mutateAsync("app-1");
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications/app-1", { method: "DELETE" });
  });

  it("useAppConfigEnvironments calls correct URL", async () => {
    mockApi.mockResolvedValueOnce({ environments: [], total: 0 });
    const { result } = renderHook(() => useAppConfigEnvironments("app-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications/app-1/environments");
  });

  it("useAppConfigEnvironments disabled when null", () => {
    const { result } = renderHook(() => useAppConfigEnvironments(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("useAppConfigProfiles calls correct URL", async () => {
    mockApi.mockResolvedValueOnce({ profiles: [], total: 0 });
    const { result } = renderHook(() => useAppConfigProfiles("app-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications/app-1/configuration-profiles");
  });

  it("useAppConfigProfiles disabled when null", () => {
    const { result } = renderHook(() => useAppConfigProfiles(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("useCreateAppConfigEnvironment calls POST", async () => {
    mockApi.mockResolvedValueOnce({ environment: {} });
    const { result } = renderHook(() => useCreateAppConfigEnvironment(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ appId: "app-1", name: "dev" });
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications/app-1/environments", {
      method: "POST",
      body: JSON.stringify({ name: "dev", description: undefined }),
    });
  });

  it("useCreateAppConfigProfile calls POST", async () => {
    mockApi.mockResolvedValueOnce({ profile: {} });
    const { result } = renderHook(() => useCreateAppConfigProfile(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ appId: "app-1", name: "flags", type: "AWS.AppConfig.FeatureFlags" });
    expect(mockApi).toHaveBeenCalledWith("/aws/appconfig/applications/app-1/configuration-profiles", {
      method: "POST",
      body: JSON.stringify({ name: "flags", type: "AWS.AppConfig.FeatureFlags", description: undefined }),
    });
  });

  it("useAppConfigVersions calls correct URL", async () => {
    mockApi.mockResolvedValueOnce({ versions: [], total: 0 });
    const { result } = renderHook(() => useAppConfigVersions("app-1", "prof-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi).toHaveBeenCalledWith(
      "/aws/appconfig/applications/app-1/configuration-profiles/prof-1/versions"
    );
  });

  it("useAppConfigVersions disabled when either param is null", () => {
    const { result } = renderHook(() => useAppConfigVersions("app-1", null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("useAppConfigVersion calls correct URL", async () => {
    mockApi.mockResolvedValueOnce({ versionNumber: 1, contentType: "application/json", content: '{"enabled":true}' });
    const { result } = renderHook(() => useAppConfigVersion("app-1", "prof-1", 1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi).toHaveBeenCalledWith(
      "/aws/appconfig/applications/app-1/configuration-profiles/prof-1/versions/1"
    );
  });

  it("useAppConfigVersion disabled when versionNumber is null", () => {
    const { result } = renderHook(() => useAppConfigVersion("app-1", "prof-1", null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("useCreateAppConfigVersion calls POST", async () => {
    mockApi.mockResolvedValueOnce({ versionNumber: 1 });
    const { result } = renderHook(() => useCreateAppConfigVersion(), { wrapper: createWrapper() });
    await result.current.mutateAsync({
      appId: "app-1", profileId: "prof-1",
      content: '{"enabled":true}', contentType: "application/json",
    });
    expect(mockApi).toHaveBeenCalledWith(
      "/aws/appconfig/applications/app-1/configuration-profiles/prof-1/versions",
      {
        method: "POST",
        body: JSON.stringify({ content: '{"enabled":true}', contentType: "application/json", description: undefined }),
      }
    );
  });

  it("APPCONFIG_BUILTIN_STRATEGIES has 3 entries", () => {
    expect(APPCONFIG_BUILTIN_STRATEGIES).toHaveLength(3);
    expect(APPCONFIG_BUILTIN_STRATEGIES.map((s) => s.Id)).toContain("AppConfig.AllAtOnce");
  });

  it("useStartAppConfigDeployment calls POST", async () => {
    mockApi.mockResolvedValueOnce({ deploymentNumber: 1, state: "COMPLETE" });
    const { result } = renderHook(() => useStartAppConfigDeployment(), { wrapper: createWrapper() });
    await result.current.mutateAsync({
      appId: "app-1", envId: "env-1",
      configurationProfileId: "prof-1", configurationVersion: "1",
      deploymentStrategyId: "AppConfig.AllAtOnce",
    });
    expect(mockApi).toHaveBeenCalledWith(
      "/aws/appconfig/applications/app-1/environments/env-1/deployments",
      {
        method: "POST",
        body: JSON.stringify({
          configurationProfileId: "prof-1",
          configurationVersion: "1",
          deploymentStrategyId: "AppConfig.AllAtOnce",
          description: undefined,
        }),
      }
    );
  });
});
