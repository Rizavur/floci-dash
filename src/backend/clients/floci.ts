import { getFlociEndpoint } from "./config";

export async function flociFetch(path: string, init?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${getFlociEndpoint()}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (err: any) {
    // Network-level failure (Floci unreachable, DNS error, etc.)
    throw new Error(`Floci unreachable: ${err.message || "fetch failed"}`);
  }
  if (!res.ok) throw new Error(`Floci ${res.status}: ${res.statusText}`);
  return res.json();
}
