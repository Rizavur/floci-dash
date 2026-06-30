import type { Context } from "hono";

/**
 * Common AWS SDK error names that map to HTTP 404.
 * Services use different names for the same concept.
 */
const NOT_FOUND_ERRORS = new Set([
  "NoSuchKey",
  "NoSuchBucket",
  "ResourceNotFoundException",
  "NotFoundException",
  "EntityNotFoundException",
  "StackNotFoundException",
  "FunctionNotFoundException",
  "QueueDoesNotExist",
  "TopicArnInvalid",
  "NoSuchEntityException",
]);

/**
 * Common AWS SDK error names that map to HTTP 409 Conflict.
 */
const CONFLICT_ERRORS = new Set([
  "BucketAlreadyExists",
  "BucketAlreadyOwnedByYou",
  "ResourceAlreadyExistsException",
  "EntityAlreadyExistsException",
  "AlreadyExistsException",
]);

/**
 * Common AWS SDK error names that map to HTTP 400 Bad Request.
 */
const VALIDATION_ERRORS = new Set([
  "ValidationException",
  "ValidationError",
  "InvalidParameterException",
  "InvalidParameterValueException",
  "MalformedQueryString",
  "InvalidQueryParameter",
]);

/**
 * Map a caught AWS SDK error to a structured JSON response.
 *
 * - Returns a typed 404 / 409 / 400 response for known AWS error names.
 * - Re-throws unknown errors so Hono's onError handler can return 500.
 *
 * For use inside individual route try/catch blocks.
 */
export function handleAwsError(err: unknown, c: Context): Response {
  const res = tryMapAwsError(err, c);
  if (res) return res as Response;
  throw err;
}

/**
 * Router-level error handler for Hono's onError().
 *
 * Always returns a response (never throws).  Unknown errors fall through
 * to a structured 500 so the raw exception is not leaked to the client.
 *
 * Usage in index.ts:
 *   router.onError((err, c) => awsRouterError(err, c));
 */
export function awsRouterError(err: Error, c: Context): Response {
  const res = tryMapAwsError(err, c);
  if (res) return res as Response;
  console.error("Unhandled AWS route error:", err);
  return c.json({ error: (err as any).message || "Internal server error" }, 500) as Response;
}

function tryMapAwsError(err: unknown, c: Context) {
  const e = err as any;
  const name: string = e?.name || "";
  const httpStatus: number | undefined = e?.$metadata?.httpStatusCode;

  if (NOT_FOUND_ERRORS.has(name) || httpStatus === 404) {
    return c.json({ error: e.message || "Resource not found" }, 404);
  }
  if (CONFLICT_ERRORS.has(name) || httpStatus === 409) {
    return c.json({ error: e.message || "Resource already exists" }, 409);
  }
  if (VALIDATION_ERRORS.has(name) || httpStatus === 400) {
    return c.json({ error: e.message || "Invalid request" }, 400);
  }
  return null;
}
