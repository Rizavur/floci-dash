import { reportError } from "./globalErrorHandler";
import { describeApiMutation } from "./activityLog";
import { addActivity } from "../hooks/useActivityFeed";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const error = new Error(err.message || `API ${res.status}`);
    reportError(error, path);
    throw error;
  }
  // Best-effort activity logging for successful create/update/delete calls.
  // Never let this throw or delay the caller — it's purely for the dashboard's
  // Activity feed and must be safe in any environment (SSR, tests, etc.).
  try {
    const activity = describeApiMutation(path, init?.method || "GET");
    if (activity) addActivity(activity);
  } catch {
    // ignore — activity logging is non-critical
  }
  return res.json();
}
