// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: vi.fn(() => ({ pathname: "/", hash: "" })),
}));

vi.mock("../hooks/useSystem", () => ({
  useHealth: vi.fn(() => ({
    data: {
      services: {
        s3: "running", dynamodb: "running", ec2: "running",
        lambda: "running", sqs: "running", sns: "running", kms: "running",
      },
      stats: { running: 7, total: 7 },
      version: "1.5.29",
    },
  })),
  useActiveServices: vi.fn(() => ({
    data: { activeServices: ["s3", "dynamodb"] },
  })),
}));

vi.mock("../stores/settings", () => ({
  useSettings: vi.fn(() => ({
    darkMode: false,
    toggleDarkMode: vi.fn(),
    refreshInterval: 5000,
    setRefreshInterval: vi.fn(),
  })),
}));

import AppLayoutShell from "./AppLayoutShell";
import { useHealth, useActiveServices } from "../hooks/useSystem";
import { useSettings } from "../stores/settings";
import { useLocation } from "react-router-dom";
import { useRecentlyVisited } from "../hooks/useRecentlyVisited";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  (useHealth as any).mockReturnValue({
    data: {
      services: {
        s3: "running", dynamodb: "running", ec2: "running",
        lambda: "running", sqs: "running", sns: "running", kms: "running",
      },
      stats: { running: 7, total: 7 },
      version: "1.5.29",
    },
  });
  (useActiveServices as any).mockReturnValue({
    data: { activeServices: ["s3", "dynamodb"] },
  });
  (useSettings as any).mockReturnValue({
    darkMode: false,
    toggleDarkMode: vi.fn(),
    refreshInterval: 5000,
    setRefreshInterval: vi.fn(),
  });
  (useLocation as any).mockReturnValue({ pathname: "/", hash: "" });
  document.body.classList.remove("awsui-dark-mode");
  // useRecentlyVisited is a real (unmocked) Zustand store — AppLayoutShell's
  // navigation effect writes to it on mount when the active service changes,
  // so without resetting it here, a service visited by one test (e.g. the
  // "/services/s3" pathname test below) leaks into every later test's
  // "Recent" sidebar section.
  useRecentlyVisited.getState().clearVisited();
});

// ── Rendering ──────────────────────────────────────────────────────────────

describe("AppLayoutShell — rendering", () => {
  it("renders Floci Dash in the sidebar header", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getAllByText("Floci Dash").length).toBeGreaterThan(0);
  });

  it("renders children content", () => {
    render(
      <AppLayoutShell><div data-testid="child">Hello World</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByTestId("child")).toBeTruthy();
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("renders Dashboard link in navigation", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("renders Settings link in navigation footer", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("Settings")).toBeTruthy();
  });
});

// ── Health status ──────────────────────────────────────────────────────────

describe("AppLayoutShell — health status", () => {
  it("shows running/total count pill when healthy", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    // Health pill shows "7/7"
    expect(screen.getByText("7/7")).toBeTruthy();
  });

  it("shows 0/0 when no health data", () => {
    (useHealth as any).mockReturnValue({ data: undefined });
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("0/0")).toBeTruthy();
  });

  it("shows partial count when not all services running", () => {
    (useHealth as any).mockReturnValue({
      data: {
        services: { s3: "running", dynamodb: "available" },
        stats: { running: 1, total: 2 },
        version: "1.5.29",
      },
    });
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText("1/2")).toBeTruthy();
  });
});

// ── Navigation items ───────────────────────────────────────────────────────

describe("AppLayoutShell — navigation items", () => {
  it("renders services reported by Floci", async () => {
    const user = userEvent.setup();
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    // Categories start collapsed by default (see AppLayoutShell.tsx) since
    // 67 real services would otherwise make the sidebar extremely long —
    // expand the ones containing our mocked services first.
    await user.click(screen.getByRole("button", { name: /Storage/i }));
    await user.click(screen.getByRole("button", { name: /Compute/i }));
    expect(screen.getAllByText("S3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EC2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lambda").length).toBeGreaterThan(0);
  });

  it("keeps categories collapsed by default so the sidebar isn't a huge list", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    // No service page is active (pathname "/"), so no category should have
    // auto-expanded — service names shouldn't appear until a category is clicked.
    expect(screen.queryByText("S3")).toBeNull();
    expect(screen.queryByText("EC2")).toBeNull();
  });

  it("auto-expands the category containing the currently active service", () => {
    (useLocation as any).mockReturnValue({ pathname: "/services/s3", hash: "" });
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    // Storage (S3's category) should already be open; Compute should not.
    expect(screen.getAllByText("S3").length).toBeGreaterThan(0);
    expect(screen.queryByText("EC2")).toBeNull();
  });

  it("renders search input with correct placeholder", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByPlaceholderText("Search services…")).toBeTruthy();
  });

  it("renders at least one category header in nav", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    // Services are grouped — at least one category exists
    // All category headers have uppercase text in the nav
    const navEl = document.querySelector("nav");
    expect(navEl).toBeTruthy();
    expect(navEl!.textContent).toBeTruthy();
  });

  it("expands every category when 'Expand all' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.queryByText("S3")).toBeNull();
    expect(screen.queryByText("EC2")).toBeNull();
    await user.click(screen.getByRole("button", { name: /expand all categories/i }));
    expect(screen.getAllByText("S3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EC2").length).toBeGreaterThan(0);
  });

  it("collapses every category when 'Collapse all' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    await user.click(screen.getByRole("button", { name: /expand all categories/i }));
    expect(screen.getAllByText("S3").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /collapse all categories/i }));
    expect(screen.queryByText("S3")).toBeNull();
    expect(screen.queryByText("EC2")).toBeNull();
  });
});

// ── Search ─────────────────────────────────────────────────────────────────

describe("AppLayoutShell — search", () => {
  it("renders search input", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByPlaceholderText("Search services…")).toBeTruthy();
  });

  it("filters services when searching", async () => {
    const user = userEvent.setup();
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    const input = screen.getByPlaceholderText("Search services…");
    await user.type(input, "S3");
    // S3 matches, DynamoDB should not appear in results
    const nav = document.querySelector("nav");
    const resultLabels = Array.from(nav!.querySelectorAll("[role='button']"))
      .map((el) => el.textContent?.trim());
    expect(resultLabels.some((t) => t?.includes("S3"))).toBe(true);
    expect(resultLabels.some((t) => t?.includes("DynamoDB"))).toBe(false);
  });

  it("shows 'No matches' text when nothing matches", async () => {
    const user = userEvent.setup();
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    const input = screen.getByPlaceholderText("Search services…");
    await user.type(input, "zzzzzzz");
    expect(screen.getByText(/no matches/i)).toBeTruthy();
  });
});

// ── Dark mode ──────────────────────────────────────────────────────────────

describe("AppLayoutShell — dark mode toggle", () => {
  it("renders dark mode toggle button", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(screen.getAllByLabelText("Toggle dark mode").length).toBeGreaterThan(0);
  });

  it("applies awsui-dark-mode class to body when darkMode is true", () => {
    (useSettings as any).mockReturnValue({
      darkMode: true,
      toggleDarkMode: vi.fn(),
      refreshInterval: 5000,
      setRefreshInterval: vi.fn(),
    });
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(document.body.classList.contains("awsui-dark-mode")).toBe(true);
  });

  it("does not apply dark mode class to body when darkMode is false", () => {
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    expect(document.body.classList.contains("awsui-dark-mode")).toBe(false);
  });

  it("calls toggleDarkMode when button clicked", async () => {
    const mockToggle = vi.fn();
    (useSettings as any).mockReturnValue({
      darkMode: false, toggleDarkMode: mockToggle,
      refreshInterval: 5000, setRefreshInterval: vi.fn(),
    });
    const user = userEvent.setup();
    render(
      <AppLayoutShell><div>Content</div></AppLayoutShell>,
      { wrapper: createWrapper() },
    );
    await user.click(screen.getAllByLabelText("Toggle dark mode")[0]);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
