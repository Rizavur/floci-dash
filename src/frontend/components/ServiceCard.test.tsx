// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

import ServiceCard from "./ServiceCard";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("ServiceCard", () => {
  it("renders the friendly service label", () => {
    render(<ServiceCard serviceKey="s3" status="running" />);
    expect(screen.getByText("S3")).toBeTruthy();
  });

  it("navigates to the service page when clicked", async () => {
    const user = userEvent.setup();
    render(<ServiceCard serviceKey="s3" status="running" />);
    await user.click(screen.getByRole("button", { name: /Open S3/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/services/s3");
  });

  it("navigates on Enter key press", async () => {
    const user = userEvent.setup();
    render(<ServiceCard serviceKey="ec2" status="running" />);
    const card = screen.getByRole("button", { name: /Open EC2/i });
    card.focus();
    await user.keyboard("{Enter}");
    expect(mockNavigate).toHaveBeenCalledWith("/services/ec2");
  });

  it("marks the accessible label as active when isActive is true", () => {
    render(<ServiceCard serviceKey="s3" status="running" isActive />);
    expect(screen.getByRole("button", { name: /Open S3 \(active\)/i })).toBeTruthy();
  });

  it("shows a resource count badge when active with resources", () => {
    render(<ServiceCard serviceKey="s3" status="running" isActive resourceCount={4} />);
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("does not show a resource count badge when not active", () => {
    render(<ServiceCard serviceKey="s3" status="running" resourceCount={4} />);
    expect(screen.queryByText("4")).toBeNull();
  });

  it("does not show a badge when active but resourceCount is 0 or undefined", () => {
    render(<ServiceCard serviceKey="s3" status="running" isActive resourceCount={0} />);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("toggles favorite state when the star button is clicked", async () => {
    const user = userEvent.setup();
    render(<ServiceCard serviceKey="s3" status="running" />);
    const starBtn = screen.getByRole("button", { name: "Star S3" });
    await user.click(starBtn);
    expect(screen.getByRole("button", { name: "Unstar S3" })).toBeTruthy();
    // Clicking the star must not trigger navigation.
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders unavailable services with the same accessible structure", () => {
    render(<ServiceCard serviceKey="glue" status="available" />);
    expect(screen.getByRole("button", { name: /Open Glue/i })).toBeTruthy();
  });
});
