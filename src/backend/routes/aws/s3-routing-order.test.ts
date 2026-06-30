// Regression tests for Bug 2: S3 route ordering.
//
// When s3Routes is registered before s3ObjectRoutes, the wildcard
// "GET /buckets/:name/objects/*" catch-all intercepts requests intended for
// the more specific routes "/*/tags", "/*/attributes", and "/*/head".
//
// These tests mount only the three S3 routers in a minimal Hono app,
// mirroring exactly how index.ts registers them, and verify that each
// specific route is reached by the correct handler.
// This avoids the need to stub every other AWS SDK client in the project.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";

// ─── Hoist mocks before any imports ───────────────────────────────────────────

const mockSend = vi.hoisted(() => vi.fn());

const createCmd = vi.hoisted(() => {
  return function (name: string) {
    return vi.fn(function (this: any, args?: any) {
      return { __cmdName: name, ...args };
    });
  };
});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function () { return { send: mockSend }; }),
  // s3.ts commands
  ListBucketsCommand:      createCmd("ListBucketsCommand"),
  CreateBucketCommand:     createCmd("CreateBucketCommand"),
  DeleteBucketCommand:     createCmd("DeleteBucketCommand"),
  ListObjectsV2Command:    createCmd("ListObjectsV2Command"),
  GetObjectCommand:        createCmd("GetObjectCommand"),
  PutObjectCommand:        createCmd("PutObjectCommand"),
  DeleteObjectCommand:     createCmd("DeleteObjectCommand"),
  DeleteObjectsCommand:    createCmd("DeleteObjectsCommand"),
  // s3-objects.ts commands
  GetObjectTaggingCommand:    createCmd("GetObjectTaggingCommand"),
  PutObjectTaggingCommand:    createCmd("PutObjectTaggingCommand"),
  DeleteObjectTaggingCommand: createCmd("DeleteObjectTaggingCommand"),
  GetObjectAttributesCommand: createCmd("GetObjectAttributesCommand"),
  HeadBucketCommand:          createCmd("HeadBucketCommand"),
  HeadObjectCommand:          createCmd("HeadObjectCommand"),
  ObjectAttributes: {
    CHECKSUM: "Checksum", ETAG: "ETag", OBJECT_PARTS: "ObjectParts",
    STORAGE_CLASS: "StorageClass", OBJECT_SIZE: "ObjectSize",
  },
  // s3-config.ts commands (not exercised here, but needed for import)
  GetBucketVersioningCommand:        createCmd("GetBucketVersioningCommand"),
  PutBucketVersioningCommand:        createCmd("PutBucketVersioningCommand"),
  GetBucketTaggingCommand:           createCmd("GetBucketTaggingCommand"),
  PutBucketTaggingCommand:           createCmd("PutBucketTaggingCommand"),
  DeleteBucketTaggingCommand:        createCmd("DeleteBucketTaggingCommand"),
  GetBucketPolicyCommand:            createCmd("GetBucketPolicyCommand"),
  PutBucketPolicyCommand:            createCmd("PutBucketPolicyCommand"),
  DeleteBucketPolicyCommand:         createCmd("DeleteBucketPolicyCommand"),
  GetBucketCorsCommand:              createCmd("GetBucketCorsCommand"),
  PutBucketCorsCommand:              createCmd("PutBucketCorsCommand"),
  DeleteBucketCorsCommand:           createCmd("DeleteBucketCorsCommand"),
  GetBucketLifecycleConfigurationCommand: createCmd("GetBucketLifecycleConfigurationCommand"),
  PutBucketLifecycleConfigurationCommand: createCmd("PutBucketLifecycleConfigurationCommand"),
  DeleteBucketLifecycleCommand:      createCmd("DeleteBucketLifecycleCommand"),
  GetBucketAclCommand:               createCmd("GetBucketAclCommand"),
  PutBucketAclCommand:               createCmd("PutBucketAclCommand"),
  GetBucketEncryptionCommand:        createCmd("GetBucketEncryptionCommand"),
  PutBucketEncryptionCommand:        createCmd("PutBucketEncryptionCommand"),
  DeleteBucketEncryptionCommand:     createCmd("DeleteBucketEncryptionCommand"),
  GetBucketNotificationConfigurationCommand: createCmd("GetBucketNotificationConfigurationCommand"),
  PutBucketNotificationConfigurationCommand: createCmd("PutBucketNotificationConfigurationCommand"),
  GetBucketWebsiteCommand:           createCmd("GetBucketWebsiteCommand"),
  PutBucketWebsiteCommand:           createCmd("PutBucketWebsiteCommand"),
  DeleteBucketWebsiteCommand:        createCmd("DeleteBucketWebsiteCommand"),
  GetPublicAccessBlockCommand:       createCmd("GetPublicAccessBlockCommand"),
  PutPublicAccessBlockCommand:       createCmd("PutPublicAccessBlockCommand"),
  DeletePublicAccessBlockCommand:    createCmd("DeletePublicAccessBlockCommand"),
  GetBucketLoggingCommand:           createCmd("GetBucketLoggingCommand"),
  PutBucketLoggingCommand:           createCmd("PutBucketLoggingCommand"),
  GetObjectLockConfigurationCommand: createCmd("GetObjectLockConfigurationCommand"),
  PutObjectLockConfigurationCommand: createCmd("PutObjectLockConfigurationCommand"),
  GetBucketReplicationCommand:       createCmd("GetBucketReplicationCommand"),
}));

vi.mock("../../clients/aws", () => ({
  getAwsConfig: () => ({
    endpoint: "http://localhost:4566",
    region: "us-east-1",
    credentials: { accessKeyId: "test", secretAccessKey: "test" },
  }),
}));

// Import only the three S3 routers — no index.ts, no other service clients
import s3Routes from "./s3";
import s3ConfigRoutes from "./s3-config";
import s3ObjectRoutes from "./s3-objects";

// Build a minimal app that mirrors index.ts registration order for S3
function buildS3App() {
  const app = new Hono();
  // Correct order: specific routes first, catch-all last
  app.route("/s3", s3ObjectRoutes);
  app.route("/s3", s3ConfigRoutes);
  app.route("/s3", s3Routes);
  return app;
}

// Build an app with the WRONG order (what caused the bug) to prove tests catch it
function buildS3AppWrongOrder() {
  const app = new Hono();
  app.route("/s3", s3Routes);       // catch-all registered first — the bug
  app.route("/s3", s3ConfigRoutes);
  app.route("/s3", s3ObjectRoutes);
  return app;
}

beforeEach(() => {
  mockSend.mockReset();
});

async function get(app: Hono, path: string) {
  return app.request(path, { method: "GET" });
}

// ─── Correct order: specific routes match before catch-all ────────────────────

describe("S3 route ordering — correct order (s3ObjectRoutes first)", () => {
  const app = buildS3App();

  it("GET /s3/buckets/:name/objects/*/tags hits GetObjectTaggingCommand", async () => {
    mockSend.mockResolvedValueOnce({ TagSet: [{ Key: "env", Value: "prod" }] });
    const res = await get(app, "/s3/buckets/my-bucket/objects/my-file.txt/tags");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tags).toBeDefined();
    expect(body.total).toBe(1);
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectTaggingCommand");
  });

  it("GET /s3/buckets/:name/objects/*/attributes hits GetObjectAttributesCommand", async () => {
    mockSend.mockResolvedValueOnce({ ETag: '"abc"', ObjectSize: 512 });
    const res = await get(app, "/s3/buckets/my-bucket/objects/my-file.txt/attributes");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.etag).toBeDefined();
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectAttributesCommand");
  });

  it("GET /s3/buckets/:name/objects/*/head hits HeadObjectCommand", async () => {
    mockSend.mockResolvedValueOnce({
      ContentLength: 100, ContentType: "text/plain",
      LastModified: new Date("2025-01-01"), ETag: '"abc"', Metadata: {},
    });
    const res = await get(app, "/s3/buckets/my-bucket/objects/my-file.txt/head");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.contentType).toBe("text/plain");
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("HeadObjectCommand");
  });

  it("GET /s3/buckets/:name/objects/* still serves plain object content", async () => {
    mockSend.mockResolvedValueOnce({
      ContentType: "text/plain", ContentLength: 5,
      Body: { transformToString: async () => "hello" },
    });
    const res = await get(app, "/s3/buckets/my-bucket/objects/my-file.txt");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.contentType).toBe("text/plain");
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectCommand");
  });
});

// ─── Wrong order: demonstrates the bug the fix solves ────────────────────────

describe("S3 route ordering — wrong order proves tests catch the regression", () => {
  const buggyApp = buildS3AppWrongOrder();

  it("GET /s3/buckets/:name/objects/*/tags is wrongly intercepted by the catch-all", async () => {
    // With the wrong order the catch-all fires first and calls GetObjectCommand
    // with Key='my-file.txt/tags', which would throw NoSuchKey in production.
    // Here we make it succeed to observe which command was dispatched.
    mockSend.mockResolvedValueOnce({
      ContentType: "text/plain", ContentLength: 0,
      Body: { transformToString: async () => "" },
    });
    const res = await get(buggyApp, "/s3/buckets/my-bucket/objects/my-file.txt/tags");
    // The wrong handler fires and returns object content shape — not the tags shape
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectCommand");
    // Key passed to GetObjectCommand includes the "/tags" suffix — the bug
    expect(mockSend.mock.calls[0][0].Key).toBe("my-file.txt/tags");
  });
});
