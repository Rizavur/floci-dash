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
  DeleteEnvironmentCommand,
  ListConfigurationProfilesCommand,
  CreateConfigurationProfileCommand,
  DeleteConfigurationProfileCommand,
  ListHostedConfigurationVersionsCommand,
  CreateHostedConfigurationVersionCommand,
  GetHostedConfigurationVersionCommand,
  StartDeploymentCommand,
  GetDeploymentCommand,
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

router.delete("/applications/:appId/environments/:envId", async (c: Context) => {
  const appId = c.req.param("appId");
  const envId = c.req.param("envId");
  const client = getClient();
  await client.send(new DeleteEnvironmentCommand({ ApplicationId: appId, EnvironmentId: envId }));
  return c.json({ deleted: true });
});

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

router.delete("/applications/:appId/configuration-profiles/:profileId", async (c: Context) => {
  const appId = c.req.param("appId");
  const profileId = c.req.param("profileId");
  const client = getClient();
  await client.send(
    new DeleteConfigurationProfileCommand({ ApplicationId: appId, ConfigurationProfileId: profileId })
  );
  return c.json({ deleted: true });
});

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

router.post("/applications/:appId/configuration-profiles/:profileId/versions", async (c: Context) => {
  const appId = c.req.param("appId");
  const profileId = c.req.param("profileId");
  const body = await c.req.json<{ content: string; contentType?: string; description?: string }>();
  if (!body.content) return c.json({ error: "content is required" }, 400);

  const client = getClient();
  const result = await client.send(
    new CreateHostedConfigurationVersionCommand({
      ApplicationId: appId,
      ConfigurationProfileId: profileId,
      Content: body.content,
      ContentType: body.contentType || "application/json",
      Description: body.description,
    })
  );
  return c.json(
    {
      version: {
        applicationId: result.ApplicationId,
        configurationProfileId: result.ConfigurationProfileId,
        versionNumber: result.VersionNumber,
        contentType: result.ContentType,
        description: result.Description,
      },
    },
    201
  );
});

router.get("/applications/:appId/configuration-profiles/:profileId/versions/:versionNumber", async (c: Context) => {
  const appId = c.req.param("appId");
  const profileId = c.req.param("profileId");
  const versionNumber = Number(c.req.param("versionNumber"));

  const client = getClient();
  const result = await client.send(
    new GetHostedConfigurationVersionCommand({
      ApplicationId: appId,
      ConfigurationProfileId: profileId,
      VersionNumber: versionNumber,
    })
  );
  return c.json({
    version: {
      applicationId: result.ApplicationId,
      configurationProfileId: result.ConfigurationProfileId,
      versionNumber: result.VersionNumber,
      contentType: result.ContentType,
      description: result.Description,
      content: result.Content ? Buffer.from(result.Content).toString("utf-8") : "",
    },
  });
});

// ── Deployments ───────────────────────────────────────────
// No custom deployment strategy management here — floci only supports
// looking up a strategy by ID (including the 3 AWS-predefined ones), not
// listing custom ones after creation, so the UI only offers the built-ins.

router.post("/applications/:appId/environments/:envId/deployments", async (c: Context) => {
  const appId = c.req.param("appId");
  const envId = c.req.param("envId");
  const body = await c.req.json<{
    configurationProfileId: string;
    configurationVersion: string;
    deploymentStrategyId: string;
    description?: string;
  }>();
  if (!body.configurationProfileId || !body.configurationVersion || !body.deploymentStrategyId) {
    return c.json(
      { error: "configurationProfileId, configurationVersion, and deploymentStrategyId are required" },
      400
    );
  }

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
  return c.json({ deployment: result }, 201);
});

router.get("/applications/:appId/environments/:envId/deployments/:deploymentNumber", async (c: Context) => {
  const appId = c.req.param("appId");
  const envId = c.req.param("envId");
  const deploymentNumber = Number(c.req.param("deploymentNumber"));

  const client = getClient();
  const result = await client.send(
    new GetDeploymentCommand({
      ApplicationId: appId,
      EnvironmentId: envId,
      DeploymentNumber: deploymentNumber,
    })
  );
  return c.json({ deployment: result });
});

export default router;
