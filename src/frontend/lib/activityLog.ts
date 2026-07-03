// ─────────────────────────────────────────────────────────────────────────
// Turns a successful mutation request (method + path) into a human-readable
// activity feed entry, e.g. `POST /aws/s3/buckets` -> "Created S3 bucket".
//
// Only the two safest, highest-signal REST shapes are recognized:
//   POST   /aws/{service}/{collection}       -> "Created {service} {noun}"
//   DELETE /aws/{service}/{collection}/{id}  -> "Deleted {service} {noun} \"{id}\""
//   PUT/PATCH /aws/{service}/{collection}/{id} -> "Updated {service} {noun} \"{id}\""
//
// Nested/config sub-resource endpoints (tags, policy, lifecycle, etc.) and
// bespoke RPC-style action routes (invoke, batch-delete, import, ...) are
// deliberately skipped rather than risk a misleading description.
// ─────────────────────────────────────────────────────────────────────────
import { getServiceLabel } from "../types/services";

export interface MutationActivity {
  service: string;
  action: "create" | "delete" | "update";
  resource?: string;
  description: string;
}

function singularize(word: string): string {
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function humanizeNoun(word: string): string {
  return singularize(word).replace(/-/g, " ");
}

export function describeApiMutation(path: string, method: string): MutationActivity | null {
  const m = method.toUpperCase();
  if (m !== "POST" && m !== "DELETE" && m !== "PUT" && m !== "PATCH") return null;

  const cleanPath = path.split("?")[0];
  if (!cleanPath.startsWith("/aws/")) return null;

  const segments = cleanPath.split("/").filter(Boolean); // ["aws", service, ...rest]
  if (segments.length < 3) return null;

  const service = segments[1];
  const rest = segments.slice(2);
  const serviceLabel = getServiceLabel(service);

  if (m === "POST" && rest.length === 1) {
    const noun = humanizeNoun(rest[0]);
    return { service, action: "create", description: `Created ${serviceLabel} ${noun}` };
  }

  if (m !== "POST" && rest.length === 2) {
    const noun = humanizeNoun(rest[0]);
    const resource = decodeURIComponent(rest[1]);
    if (m === "DELETE") {
      return { service, action: "delete", resource, description: `Deleted ${serviceLabel} ${noun} "${resource}"` };
    }
    return { service, action: "update", resource, description: `Updated ${serviceLabel} ${noun} "${resource}"` };
  }

  return null;
}
