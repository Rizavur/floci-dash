import { describe, it, expect, beforeEach, vi } from "vitest";

const mockSend = vi.hoisted(() => vi.fn());
const createCmd = vi.hoisted(() => {
  return function (name: string) {
    return vi.fn(function (this: any, args?: any) { return { __cmdName: name, ...args }; });
  };
});

vi.mock("@aws-sdk/client-appconfig", () => ({
  AppConfigClient: vi.fn(function () { return { send: mockSend }; }),
  ListApplicationsCommand: createCmd("ListApplicationsCommand"),
  GetApplicationCommand: createCmd("GetApplicationCommand"),
  CreateApplicationCommand: createCmd("CreateApplicationCommand"),
  DeleteApplicationCommand: createCmd("DeleteApplicationCommand"),
  ListEnvironmentsCommand: createCmd("ListEnvironmentsCommand"),
  CreateEnvironmentCommand: createCmd("CreateEnvironmentCommand"),
  ListConfigurationProfilesCommand: createCmd("ListConfigurationProfilesCommand"),
  CreateConfigurationProfileCommand: createCmd("CreateConfigurationProfileCommand"),
  ListHostedConfigurationVersionsCommand: createCmd("ListHostedConfigurationVersionsCommand"),
  GetHostedConfigurationVersionCommand: createCmd("GetHostedConfigurationVersionCommand"),
  CreateHostedConfigurationVersionCommand: createCmd("CreateHostedConfigurationVersionCommand"),
  StartDeploymentCommand: createCmd("StartDeploymentCommand"),
}));

vi.mock("../../clients/aws", () => ({ create: (Ctor: any, extra?: any) => new Ctor(extra) }));

import router from "./appconfig";

async function get(p: string) { return router.request(p, { method: "GET" }); }
async function post(p: string, b?: any) {
  return router.request(p, { method: "POST", body: b != null ? JSON.stringify(b) : undefined, headers: b != null ? { "content-type": "application/json" } : undefined });
}
async function del(p: string) { return router.request(p, { method: "DELETE" }); }

beforeEach(() => mockSend.mockReset());

describe("AppConfig Routes", () => {
  it("GET /applications — lists apps", async () => {
    mockSend.mockResolvedValueOnce({ Items: [{ Id: "app-1", Name: "myapp" }] });
    const res = await get("/applications");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(1);
  });

  it("GET /applications — empty list", async () => {
    mockSend.mockResolvedValueOnce({});
    const res = await get("/applications");
    const body = await res.json();
    expect(body.total).toBe(0);
  });

  it("GET /applications/:id — gets app", async () => {
    mockSend.mockResolvedValueOnce({ Id: "app-1", Name: "myapp" });
    const res = await get("/applications/app-1");
    expect(res.status).toBe(200);
  });

  it("POST /applications — creates app (201)", async () => {
    mockSend.mockResolvedValueOnce({ Id: "new" });
    const res = await post("/applications", { name: "myapp" });
    expect(res.status).toBe(201);
  });

  it("POST /applications — 400 if name missing", async () => {
    const res = await post("/applications", {});
    expect(res.status).toBe(400);
  });

  it("DELETE /applications/:id — deletes app", async () => {
    mockSend.mockResolvedValueOnce({});
    const res = await del("/applications/app-1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deleted).toBe(true);
  });

  it("GET /applications/:id/environments — lists environments", async () => {
    mockSend.mockResolvedValueOnce({ Items: [{ Id: "env-1", Name: "dev" }] });
    const res = await get("/applications/app-1/environments");
    const body = await res.json();
    expect(body.total).toBe(1);
  });

  it("POST /applications/:id/environments — creates env (201)", async () => {
    mockSend.mockResolvedValueOnce({ Id: "env-1" });
    const res = await post("/applications/app-1/environments", { name: "dev" });
    expect(res.status).toBe(201);
  });



  it("GET /applications/:id/configuration-profiles — lists profiles", async () => {
    mockSend.mockResolvedValueOnce({ Items: [{ Id: "prof-1", Name: "config" }] });
    const res = await get("/applications/app-1/configuration-profiles");
    const body = await res.json();
    expect(body.total).toBe(1);
  });

  it("POST /applications/:id/configuration-profiles — creates profile (201)", async () => {
    mockSend.mockResolvedValueOnce({ Id: "prof-1" });
    const res = await post("/applications/app-1/configuration-profiles", { name: "config" });
    expect(res.status).toBe(201);
  });



  it("GET /applications/:appId/configuration-profiles/:profileId/versions — lists versions", async () => {
    mockSend.mockResolvedValueOnce({ Items: [{ VersionNumber: 1 }] });
    const res = await get("/applications/app-1/configuration-profiles/prof-1/versions");
    const body = await res.json();
    expect(body.total).toBe(1);
  });

  it("GET .../versions/:versionNumber — returns version content", async () => {
    mockSend.mockResolvedValueOnce({
      VersionNumber: 1,
      ContentType: "application/json",
      Content: Buffer.from('{"enabled":true}'),
      Description: "v1",
    });
    const res = await get("/applications/app-1/configuration-profiles/prof-1/versions/1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe('{"enabled":true}');
    expect(body.contentType).toBe("application/json");
  });

  it("POST /applications/:appId/configuration-profiles/:profileId/versions — creates version (201)", async () => {
    mockSend.mockResolvedValueOnce({ VersionNumber: 1 });
    const res = await post("/applications/app-1/configuration-profiles/prof-1/versions", {
      content: '{"enabled":true}',
      contentType: "application/json",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.versionNumber).toBe(1);
  });

  it("POST .../versions — 400 if content missing", async () => {
    const res = await post("/applications/app-1/configuration-profiles/prof-1/versions", {
      contentType: "application/json",
    });
    expect(res.status).toBe(400);
  });

  it("POST .../versions — 400 if contentType missing", async () => {
    const res = await post("/applications/app-1/configuration-profiles/prof-1/versions", {
      content: '{"enabled":true}',
    });
    expect(res.status).toBe(400);
  });

  it("POST /applications/:appId/environments/:envId/deployments — starts deployment (201)", async () => {
    mockSend.mockResolvedValueOnce({ DeploymentNumber: 1, State: "COMPLETE" });
    const res = await post("/applications/app-1/environments/env-1/deployments", {
      configurationProfileId: "prof-1",
      configurationVersion: "1",
      deploymentStrategyId: "AppConfig.AllAtOnce",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.state).toBe("COMPLETE");
  });

  it("POST .../deployments — 400 if configurationProfileId missing", async () => {
    const res = await post("/applications/app-1/environments/env-1/deployments", {
      configurationVersion: "1",
      deploymentStrategyId: "AppConfig.AllAtOnce",
    });
    expect(res.status).toBe(400);
  });
});
