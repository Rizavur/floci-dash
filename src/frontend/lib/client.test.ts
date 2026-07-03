import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockAddActivity = vi.fn();
vi.mock("../hooks/useActivityFeed", () => ({
  addActivity: (...args: any[]) => mockAddActivity(...args),
}));

import { api } from "./client";

describe("api", () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  function mockFetch(response: Response) {
    global.fetch = vi.fn().mockResolvedValue(response);
  }

  it("returns parsed JSON on success", async () => {
    mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const result = await api<{ ok: boolean }>("/test");
    expect(result).toEqual({ ok: true });
  });

  it("prefixes path with /api", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200, headers: { "content-type": "application/json" } }),
    );
    global.fetch = fetchMock;
    await api("/foo");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/foo",
      expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }),
    );
  });

  it("throws error with JSON message on failure", async () => {
    mockFetch(
      new Response(JSON.stringify({ message: "Bad request" }), { status: 400 }),
    );
    await expect(api("/fail")).rejects.toThrow("Bad request");
  });

  it("falls back to statusText when body is not JSON", async () => {
    mockFetch(new Response("plain text", { status: 500, statusText: "Internal Server Error" }));
    await expect(api("/fail")).rejects.toThrow("Internal Server Error");
  });

  it("falls back to status code when no message", async () => {
    mockFetch(new Response(JSON.stringify({}), { status: 502 }));
    await expect(api("/fail")).rejects.toThrow("API 502");
  });

  it("merges custom headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200, headers: { "content-type": "application/json" } }),
    );
    global.fetch = fetchMock;
    await api("/test", { headers: { "X-Custom": "yes" } });
    const call = fetchMock.mock.calls[0][1];
    expect(call.headers).toEqual({
      "Content-Type": "application/json",
      "X-Custom": "yes",
    });
  });

  it("passes through method and body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200, headers: { "content-type": "application/json" } }),
    );
    global.fetch = fetchMock;
    await api("/test", { method: "POST", body: '{"a":1}' });
    const call = fetchMock.mock.calls[0][1];
    expect(call.method).toBe("POST");
    expect(call.body).toBe('{"a":1}');
  });

  describe("activity logging", () => {
    beforeEach(() => {
      mockAddActivity.mockClear();
    });

    it("logs an activity entry for a recognized AWS mutation", async () => {
      mockFetch(new Response("{}", { status: 200 }));
      await api("/aws/s3/buckets", { method: "POST" });
      expect(mockAddActivity).toHaveBeenCalledWith(
        expect.objectContaining({ service: "s3", action: "create", description: "Created S3 bucket" }),
      );
    });

    it("does not log activity for GET requests", async () => {
      mockFetch(new Response("{}", { status: 200 }));
      await api("/aws/s3/buckets");
      expect(mockAddActivity).not.toHaveBeenCalled();
    });

    it("does not log activity for non-AWS paths", async () => {
      mockFetch(new Response("{}", { status: 200 }));
      await api("/system/health", { method: "POST" });
      expect(mockAddActivity).not.toHaveBeenCalled();
    });

    it("does not log activity when the request fails", async () => {
      mockFetch(new Response(JSON.stringify({ message: "nope" }), { status: 400 }));
      await expect(api("/aws/s3/buckets", { method: "POST" })).rejects.toThrow();
      expect(mockAddActivity).not.toHaveBeenCalled();
    });

    it("never lets a logging failure break the response", async () => {
      mockAddActivity.mockImplementation(() => { throw new Error("boom"); });
      mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const result = await api<{ ok: boolean }>("/aws/s3/buckets", { method: "POST" });
      expect(result).toEqual({ ok: true });
    });
  });
});
