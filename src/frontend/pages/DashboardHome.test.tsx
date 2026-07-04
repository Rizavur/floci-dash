// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createWrapper } from "../../test/helpers";
import React from "react";

const mockHealth = vi.fn();
const mockActive = vi.fn();
const mockResourceCounts = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../hooks/useSystem", () => ({
  useHealth: (...args: any[]) => mockHealth(...args),
  useActiveServices: (...args: any[]) => mockActive(...args),
}));

vi.mock("../hooks/useResourceCounts", () => ({
  useResourceCounts: (...args: any[]) => mockResourceCounts(...args),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

import DashboardHome from "./DashboardHome";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockHealth.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      version: "1.5.22",
      stats: { total: 50, running: 30, available: 20 },
      services: {
        s3: "running", ec2: "running", dynamodb: "running", lambda: "available",
        rds: "available", sqs: "running", sns: "available", kms: "available", iam: "available",
      },
    },
  });
  mockActive.mockReturnValue({
    data: { activeCount: 5, activeServices: ["s3", "ec2", "sqs"] },
  });
  mockResourceCounts.mockReturnValue({
    data: { s3: 2, dynamodb: 3, ec2: 1, lambda: 0, sqs: 5 },
  });
});

describe("DashboardHome", () => {
  it("shows loading skeleton while connecting", () => {
    mockHealth.mockReturnValue({ isLoading: true, isError: false, data: undefined, error: null });
    mockActive.mockReturnValue({ data: { activeCount: 0, activeServices: [] } });
    mockResourceCounts.mockReturnValue({ data: undefined });
    const { container } = render(<DashboardHome />, { wrapper: createWrapper() });
    // Skeleton renders divs
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
  });

  it("shows error state when connection fails", () => {
    mockHealth.mockReturnValue({
      isLoading: false, isError: true, data: undefined,
      error: new Error("Connection refused"),
    });
    mockActive.mockReturnValue({ data: { activeCount: 0, activeServices: [] } });
    mockResourceCounts.mockReturnValue({ data: undefined });
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.getByText("Connection refused")).toBeTruthy();
    // Error description mentions running Floci
    expect(screen.getByText(/Floci.*running/i)).toBeTruthy();
  });

  it("renders dashboard heading and version info", () => {
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText(/v1\.5\.22/)).toBeTruthy();
  });

  it("renders stat cards with health data", () => {
    render(<DashboardHome />, { wrapper: createWrapper() });
    // Total services and running count appear in stat cards
    expect(screen.getByText("50")).toBeTruthy();
    expect(screen.getByText("30")).toBeTruthy();
    // Total resources = 2 + 3 + 1 + 0 + 5 = 11
    expect(screen.getByText("11")).toBeTruthy();
  });

  it("shows resource counts section with non-zero services", () => {
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.getByText("Resource Counts")).toBeTruthy();
    // Service names appear uppercased in resource count cards
    expect(screen.getAllByText(/S3/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("DYNAMODB")).toBeTruthy();
    // SQS appears in both resource counts and quick actions
    expect(screen.getAllByText(/SQS/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders a favorites section with suggested defaults when nothing is starred", () => {
    render(<DashboardHome />, { wrapper: createWrapper() });
    const favoritesSection = screen.getByText("Favorites").closest("div")!.parentElement!;
    expect(within(favoritesSection).getByText("Lambda")).toBeTruthy();
    expect(within(favoritesSection).getByText("RDS")).toBeTruthy();
    expect(within(favoritesSection).getByText("KMS")).toBeTruthy();
    expect(screen.getByText(/Suggested/i)).toBeTruthy();
  });

  it("does not show resource counts section when all counts are zero", () => {
    mockResourceCounts.mockReturnValue({ data: {} });
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.queryByText("Resource Counts")).toBeNull();
  });

  it("navigates to S3 when the S3 favorite card is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardHome />, { wrapper: createWrapper() });
    // S3 renders both in Favorites and in the full catalogue below; scope to Favorites.
    const favoritesSection = screen.getByText("Favorites").closest("div")!.parentElement!;
    const card = within(favoritesSection).getByRole("button", { name: /^Open S3/ });
    await user.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/services/s3");
  });

  it("shows only services with non-zero counts in resource counts", () => {
    mockResourceCounts.mockReturnValue({ data: { s3: 2, lambda: 0, sqs: 5 } });
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/S3/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/SQS/i).length).toBeGreaterThanOrEqual(1);
    // lambda has 0 count, should not appear in counts section
    expect(screen.queryByText("LAMBDA")).toBeNull();
  });

  it("collapses and re-expands the service catalogue via the header buttons", async () => {
    const user = userEvent.setup();
    render(<DashboardHome />, { wrapper: createWrapper() });
    // S3 also renders in the Favorites section, so scope to the catalogue.
    const catalogue = screen.getByText(/Services ·/).closest("div")!.parentElement!;
    // All categories start expanded — service cards are visible.
    expect(within(catalogue).getAllByText("S3").length).toBeGreaterThan(0);
    await user.click(within(catalogue).getByRole("button", { name: /collapse all categories/i }));
    expect(within(catalogue).queryByText("S3")).toBeNull();
    await user.click(within(catalogue).getByRole("button", { name: /expand all categories/i }));
    expect(within(catalogue).getAllByText("S3").length).toBeGreaterThan(0);
  });
});
