// Regression tests for Bug 2: S3 route ordering.
//
// When s3Routes is registered before s3ObjectRoutes in the combined aws router,
// the wildcard "GET /buckets/:name/objects/*" catch-all intercepts requests
// intended for the more specific "/*/tags", "/*/attributes", and "/*/head" routes.
//
// These tests exercise the combined router (index.ts) to verify routing order.
// Before the fix the specific routes return 500; after the fix they return the
// correct response from the right handler.

import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Hoist mocks before any imports ───────────────────────────────────────────

const mockSend = vi.hoisted(() => vi.fn());

const createCmd = vi.hoisted(() => {
  return function (name: string) {
    return vi.fn(function (this: any, args?: any) {
      return { __cmdName: name, ...args };
    });
  };
});

// Mock the entire @aws-sdk/client-s3 used by both s3.ts and s3-objects.ts
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
  // s3-config.ts commands (stub — not exercised here)
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

// Stub all other service SDK clients so index.ts can load without errors
vi.mock("@aws-sdk/client-dynamodb",            () => ({ DynamoDBClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/lib-dynamodb",               () => ({ DynamoDBDocumentClient: { from: vi.fn(() => ({ send: vi.fn() })) }, ScanCommand: vi.fn(), QueryCommand: vi.fn(), GetCommand: vi.fn(), PutCommand: vi.fn(), DeleteCommand: vi.fn(), UpdateCommand: vi.fn(), BatchGetCommand: vi.fn(), BatchWriteCommand: vi.fn(), TransactWriteCommand: vi.fn(), TransactGetCommand: vi.fn() }));
vi.mock("@aws-sdk/client-rds",                 () => ({ RDSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-ec2",                 () => ({ EC2Client: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-sqs",                 () => ({ SQSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-sns",                 () => ({ SNSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-eventbridge",         () => ({ EventBridgeClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cloudwatch-logs",     () => ({ CloudWatchLogsClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-lambda",              () => ({ LambdaClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cloudwatch",          () => ({ CloudWatchClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-iam",                 () => ({ IAMClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-secrets-manager",     () => ({ SecretsManagerClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cloudformation",      () => ({ CloudFormationClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-kms",                 () => ({ KMSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-ecs",                 () => ({ ECSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-ssm",                 () => ({ SSMClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-route-53",            () => ({ Route53Client: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-api-gateway",         () => ({ APIGatewayClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-sts",                 () => ({ STSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-appsync",             () => ({ AppSyncClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-scheduler",           () => ({ SchedulerClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-ecr",                 () => ({ ECRClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-elastic-load-balancing-v2", () => ({ ElasticLoadBalancingV2Client: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-sesv2",               () => ({ SESv2Client: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-eks",                 () => ({ EKSClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-auto-scaling",        () => ({ AutoScalingClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cloudfront",          () => ({ CloudFrontClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-kinesis",             () => ({ KinesisClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-neptune",             () => ({ NeptuneClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-pipes",               () => ({ PipesClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({ CognitoIdentityProviderClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-apigatewayv2",        () => ({ ApiGatewayV2Client: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-acm",                 () => ({ ACMClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cloudtrail",          () => ({ CloudTrailClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-config-service",      () => ({ ConfigServiceClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-appconfig",           () => ({ AppConfigClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-appconfigdata",       () => ({ AppConfigDataClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-servicediscovery",    () => ({ ServiceDiscoveryClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-athena",              () => ({ AthenaClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-glue",                () => ({ GlueClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-firehose",            () => ({ FirehoseClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-sfn",                 () => ({ SFNClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-opensearch",          () => ({ OpenSearchClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-kafka",               () => ({ KafkaClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-bedrock-runtime",     () => ({ BedrockRuntimeClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-textract",            () => ({ TextractClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-transcribe",          () => ({ TranscribeClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cost-explorer",       () => ({ CostExplorerClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-pricing",             () => ({ PricingClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-resource-groups-tagging-api", () => ({ ResourceGroupsTaggingAPIClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-codebuild",           () => ({ CodeBuildClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-codedeploy",          () => ({ CodeDeployClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-backup",              () => ({ BackupClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-transfer",            () => ({ TransferClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-cost-and-usage-report-service", () => ({ CostandUsageReportServiceClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-bcm-data-exports",    () => ({ BCMDataExportsClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-wafv2",               () => ({ WAFV2Client: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-elasticache",         () => ({ ElastiCacheClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-batch",               () => ({ BatchClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-docdb",               () => ({ DocDBClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-emr",                 () => ({ EMRClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-rds-data",            () => ({ RDSDataClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-ssm-messages",        () => ({ SSMMessagesClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("@aws-sdk/client-memory-db",           () => ({ MemoryDBClient: vi.fn(() => ({ send: vi.fn() })) }));
vi.mock("../../clients/aws", () => ({
  getAwsConfig: () => ({ endpoint: "http://localhost:4566", region: "us-east-1", credentials: { accessKeyId: "test", secretAccessKey: "test" } }),
  create: vi.fn(() => ({ send: vi.fn() })),
}));
vi.mock("../../clients/floci", () => ({ flociFetch: vi.fn() }));

import awsRouter from "./index";

beforeEach(() => {
  mockSend.mockReset();
});

async function get(path: string) {
  return awsRouter.request(path, { method: "GET" });
}

// ─── S3 routing order regression tests (Bug 2) ────────────────────────────────

describe("S3 route ordering — Bug 2 regression", () => {
  // Before fix: s3Routes registers "GET /buckets/:name/objects/*" first.
  // That wildcard intercepts /objects/my-file.txt/tags, calling GetObjectCommand
  // with Key="my-file.txt/tags" -> NoSuchKey -> 500.
  //
  // After fix: s3ObjectRoutes is registered first so the tagging route matches
  // and calls GetObjectTaggingCommand -> 200 with tags body.

  it("GET /s3/buckets/:name/objects/*/tags hits tagging handler, not object catch-all", async () => {
    mockSend.mockResolvedValueOnce({ TagSet: [{ Key: "env", Value: "prod" }] });
    const res = await get("/s3/buckets/my-bucket/objects/my-file.txt/tags");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tags).toBeDefined();
    expect(body.total).toBe(1);
    // The tagging handler must have fired, not the object content handler
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectTaggingCommand");
  });

  it("GET /s3/buckets/:name/objects/*/attributes hits attributes handler, not catch-all", async () => {
    mockSend.mockResolvedValueOnce({ ETag: '"abc"', ObjectSize: 512 });
    const res = await get("/s3/buckets/my-bucket/objects/my-file.txt/attributes");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.etag).toBeDefined();
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectAttributesCommand");
  });

  it("GET /s3/buckets/:name/objects/*/head hits head-object handler, not catch-all", async () => {
    mockSend.mockResolvedValueOnce({
      ContentLength: 100,
      ContentType: "text/plain",
      LastModified: new Date("2025-01-01"),
      ETag: '"abc"',
      Metadata: {},
    });
    const res = await get("/s3/buckets/my-bucket/objects/my-file.txt/head");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.contentType).toBe("text/plain");
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("HeadObjectCommand");
  });

  it("GET /s3/buckets/:name/objects/* still works for plain object content requests", async () => {
    mockSend.mockResolvedValueOnce({
      ContentType: "text/plain",
      ContentLength: 5,
      Body: { transformToString: async () => "hello" },
    });
    const res = await get("/s3/buckets/my-bucket/objects/my-file.txt");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.contentType).toBe("text/plain");
    expect(mockSend.mock.calls[0][0].__cmdName).toBe("GetObjectCommand");
  });
});
