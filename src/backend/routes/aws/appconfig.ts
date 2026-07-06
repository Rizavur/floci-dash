import { Hono } from "hono";
import type { Context } from "hono";
import { create } from "../../clients/aws";
import { AppConfigClient } from "@aws-sdk/client-appconfig";
import {
  ListApplicationsCommand,
  GetApplicationCommand,
  CreateApplicationCommand,
  DeleteApplicationCommand,
  ListEnvironmentsCommand,
  CreateEnvironmentCommand,
  ListConfigurationProfilesCommand,
  CreateConfigurationProfileCommand,
  ListHostedConfigurationVersionsCommand,
  GetHostedConfigurationVersionCommand,
  CreateHostedConfigurationVersionCommand,
  StartDeploymentCommand,
} from "@aws-sdk/client-appconfig";

const router = new Hono();
const getClient = () => create(AppConfigClient);

// ── Applications ─────────────────────────────────────────

router.get("/applications", async (c: Context) => {
  const client = getClient();
  const result = await client.send(new ListApplicationsCommand({}));
  const applications = result.Items || [];
  return c.json({ applications, total: applications.length });
});

router.get("/applications/:id", async (c: Context) => {
  const id = c.req.param("id");
  const client = getClient();
  const result = await client.send(new GetApplicationCommand({ ApplicationId: id }));
  return c.json({ application: result });
});

router.post("/applications", async (c: Context) => {
  const body = await c.req.json<{ name: string; description?: string }>();
  if (!body.name) return c.json({ error: "name is required" }, 400);

  const client = getClient();
  const result = await client.send(
    new CreateApplicationCommand({ Name: body.name, Description: body.description })
  );
  return c.json({ application: result }, 201);
});

router.delete("/applications/:id", async (c: Context) => {
  const id = c.req.param("id");
  const client = getClient();
  await client.send(new DeleteApplicationCommand({ ApplicationId: id }));
  return c.json({ deleted: true });
});

// ── Environments ─────────────────────────────────────────

router.get("/applications/:id/environments", async (c: Context) => {
  const id = c.req.param("id");
  const client = getClient();
  const result = await client.send(new ListEnvironmentsCommand({ ApplicationId: id }));
  const environments = result.Items || [];
  return c.json({ environments, total: environments.length });
});

router.post("/applications/:id/environments", async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ name: string; description?: string }>();
  if (!body.name) return c.json({ error: "name is required" }, 400);

  const client = getClient();
  const result = await client.send(
    new CreateEnvironmentCommand({
      ApplicationId: id,
      Name: body.name,
      Description: body.description,
    })
  );
  return c.json({ environment: result }, 201);
});

// ponytail: Floci has no DELETE for environments or profiles; omitted intentionally.

// ── Configuration Profiles ───────────────────────────────

router.get("/applications/:id/configuration-profiles", async (c: Context) => {
  const id = c.req.param("id");
  const client = getClient();
  const result = await client.send(new ListConfigurationProfilesCommand({ ApplicationId: id }));
  const profiles = result.Items || [];
  return c.json({ profiles, total: profiles.length });
});

router.post("/applications/:id/configuration-profiles", async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    name: string;
    locationUri?: string;
    type?: string;
    description?: string;
  }>();
  if (!body.name) return c.json({ error: "name is required" }, 400);

  const client = getClient();
  const result = await client.send(
    new CreateConfigurationProfileCommand({
      ApplicationId: id,
      Name: body.name,
      LocationUri: body.locationUri || "hosted",
      Type: body.type,
      Description: body.description,
    })
  );
  return c.json({ profile: result }, 201);
});

// ponytail: Floci has no DELETE for profiles; omitted intentionally.

// ── Hosted Configuration Versions ────────────────────────

router.get("/applications/:appId/configuration-profiles/:profileId/versions", async (c: Context) => {
  const appId = c.req.param("appId");
  const profileId = c.req.param("profileId");
  const client = getClient();
  const result = await client.send(
    new ListHostedConfigurationVersionsCommand({
      ApplicationId: appId,
      ConfigurationProfileId: profileId,
    })
  );
  const versions = result.Items || [];
  return c.json({ versions, total: versions.length });
});

router.get("/applications/:appId/configuration-profiles/:profileId/versions/:versionNumber", async (c: Context) => {
  const appId = c.req.param("appId");
  const profileId = c.req.param("profileId");
  const versionNumber = parseInt(c.req.param("versionNumber") ?? "", 10);
  const client = getClient();
  const result = await client.send(
    new GetHostedConfigurationVersionCommand({
      ApplicationId: appId,
      ConfigurationProfileId: profileId,
      VersionNumber: versionNumber,
    })
  );
  const content = result.Content ? Buffer.from(result.Content as any).toString("utf-8") : "";
  return c.json({ versionNumber: result.VersionNumber, contentType: result.ContentType, content, description: result.Description });
});

router.post("/applications/:appId/configuration-profiles/:profileId/versions", async (c: Context) => {
  const appId = c.req.param("appId");
  const profileId = c.req.param("profileId");
  const body = await c.req.json<{ content: string; contentType: string; description?: string }>();
  if (!body.content) return c.json({ error: "content is required" }, 400);
  if (!body.contentType) return c.json({ error: "contentType is required" }, 400);

  const client = getClient();
  const result = await client.send(
    new CreateHostedConfigurationVersionCommand({
      ApplicationId: appId,
      ConfigurationProfileId: profileId,
      Content: Buffer.from(body.content, "utf-8"),
      ContentType: body.contentType,
      Description: body.description,
    })
  );
  return c.json({ versionNumber: result.VersionNumber }, 201);
});

// ── Deployments ───────────────────────────────────────────
// ponytail: Floci has no ListDeployments endpoint; only StartDeployment and GetDeployment exist.

router.post("/applications/:appId/environments/:envId/deployments", async (c: Context) => {
  const appId = c.req.param("appId");
  const envId = c.req.param("envId");
  const body = await c.req.json<{
    configurationProfileId: string;
    configurationVersion: string;
    deploymentStrategyId: string;
    description?: string;
  }>();
  if (!body.configurationProfileId) return c.json({ error: "configurationProfileId is required" }, 400);
  if (!body.configurationVersion) return c.json({ error: "configurationVersion is required" }, 400);
  if (!body.deploymentStrategyId) return c.json({ error: "deploymentStrategyId is required" }, 400);

  const client = getClient();
  const result = await client.send(
    new StartDeploymentCommand({
      ApplicationId: appId,
      EnvironmentId: envId,
      ConfigurationProfileId: body.configurationProfileId,
      ConfigurationVersion: body.configurationVersion,
      DeploymentStrategyId: body.deploymentStrategyId,
      Description: body.description,
    })
  );
  return c.json({ deploymentNumber: result.DeploymentNumber, state: result.State }, 201);
});

export default router;
