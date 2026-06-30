// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
      services: { s3: "running", ec2: "running" },
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

  it("renders quick access buttons", () => {
    render(<DashboardHome />, { wrapper: createWrapper() });
    // Quick access buttons show the service label (e.g. "S3", "Lambda", "RDS")
    expect(screen.getAllByText("Lambda").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("RDS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("KMS").length).toBeGreaterThanOrEqual(1);
  });

  it("does not show resource counts section when all counts are zero", () => {
    mockResourceCounts.mockReturnValue({ data: {} });
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.queryByText("Resource Counts")).toBeNull();
  });

  it("navigates to S3 when S3 quick-access button is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardHome />, { wrapper: createWrapper() });
    // The quick-access section renders native <button> elements labelled by text content.
    // ServiceCard uses role="button" on a div with aria-label="Open S3", so
    // getByRole("button", { name: "S3" }) uniquely targets the quick-access button.
    const btn = screen.getByRole("button", { name: "S3" });
    await user.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/services/s3");
  });

  it("shows Activity section after navigation via quick-access button", async () => {
    const user = userEvent.setup();
    render(<DashboardHome />, { wrapper: createWrapper() });
    // trackNav adds an activity entry before calling navigate
    await user.click(screen.getByRole("button", { name: "S3" }));
    // After clicking, addActivity fires and the "Activity" section appears
    expect(screen.getByText("Activity")).toBeTruthy();
    expect(screen.getByText(/Opened S3/i)).toBeTruthy();
  });

  it("shows only services with non-zero counts in resource counts", () => {
    mockResourceCounts.mockReturnValue({ data: { s3: 2, lambda: 0, sqs: 5 } });
    render(<DashboardHome />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/S3/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/SQS/i).length).toBeGreaterThanOrEqual(1);
    // lambda has 0 count, should not appear in counts section
    expect(screen.queryByText("LAMBDA")).toBeNull();
  });
});
