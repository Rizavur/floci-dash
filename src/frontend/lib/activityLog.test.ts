import { describe, it, expect } from "vitest";
import { describeApiMutation } from "./activityLog";

describe("describeApiMutation", () => {
  it("describes a top-level create (POST /aws/{service}/{collection})", () => {
    const result = describeApiMutation("/aws/s3/buckets", "POST");
    expect(result).toEqual({
      service: "s3",
      action: "create",
      description: "Created S3 bucket",
    });
  });

  it("describes a top-level delete (DELETE /aws/{service}/{collection}/{id})", () => {
    const result = describeApiMutation("/aws/s3/buckets/my-bucket", "DELETE");
    expect(result).toEqual({
      service: "s3",
      action: "delete",
      resource: "my-bucket",
      description: 'Deleted S3 bucket "my-bucket"',
    });
  });

  it("describes a top-level update (PUT /aws/{service}/{collection}/{id})", () => {
    const result = describeApiMutation("/aws/secretsmanager/secrets/my-secret", "PUT");
    expect(result?.description).toBe('Updated Secrets Manager secret "my-secret"');
    expect(result?.action).toBe("update");
  });

  it("describes a top-level update (PATCH)", () => {
    const result = describeApiMutation("/aws/lambda/functions/my-fn", "PATCH");
    expect(result?.action).toBe("update");
    expect(result?.resource).toBe("my-fn");
  });

  it("singularizes plural nouns ending in 'ies'", () => {
    const result = describeApiMutation("/aws/iam/policies", "POST");
    expect(result?.description).toBe("Created IAM policy");
  });

  it("does not singularize words ending in double s", () => {
    const result = describeApiMutation("/aws/ec2/access", "POST");
    expect(result?.description).toBe("Created EC2 access");
  });

  it("replaces hyphens with spaces in resource nouns", () => {
    const result = describeApiMutation("/aws/ec2/key-pairs", "POST");
    expect(result?.description).toBe("Created EC2 key pair");
  });

  it("decodes URI-encoded resource ids", () => {
    const result = describeApiMutation("/aws/logs/log-groups/%2Fmy%2Fgroup", "DELETE");
    expect(result?.resource).toBe("/my/group");
  });

  it("falls back to the raw service key when no friendly label exists", () => {
    const result = describeApiMutation("/aws/madeupservice/widgets", "POST");
    expect(result?.description).toBe("Created madeupservice widget");
  });

  it("returns null for GET requests", () => {
    expect(describeApiMutation("/aws/s3/buckets", "GET")).toBeNull();
  });

  it("returns null for non-AWS paths", () => {
    expect(describeApiMutation("/system/health", "POST")).toBeNull();
  });

  it("returns null for nested config/sub-resource routes (ambiguous)", () => {
    expect(describeApiMutation("/aws/s3/buckets/my-bucket/tags", "DELETE")).toBeNull();
    expect(describeApiMutation("/aws/s3/buckets/my-bucket/versioning", "PUT")).toBeNull();
  });

  it("returns null for bespoke RPC-style action routes nested two deep", () => {
    expect(describeApiMutation("/aws/ec2/key-pairs/import", "POST")).toBeNull();
  });

  it("returns null for paths with too few segments", () => {
    expect(describeApiMutation("/aws/s3", "POST")).toBeNull();
  });

  it("strips query strings before parsing", () => {
    const result = describeApiMutation("/aws/s3/buckets?region=us-east-1", "POST");
    expect(result?.description).toBe("Created S3 bucket");
  });
});
