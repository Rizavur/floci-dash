// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Card is a real <Link> now (not a div+onClick) so ctrl/cmd/middle-click and
// "Open in new tab" work — mock it as a plain <a href> like the real thing.
vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

import ServiceCard from "./ServiceCard";

beforeEach(() => {
  localStorage.clear();
});

describe("ServiceCard", () => {
  it("renders the friendly service label", () => {
    render(<ServiceCard serviceKey="s3" status="running" />);
    expect(screen.getByText("S3")).toBeTruthy();
  });

  it("renders a real link to the service page (so it can be opened in a new tab)", () => {
    render(<ServiceCard serviceKey="s3" status="running" />);
    const card = screen.getByRole("link", { name: /Open S3/i });
    expect(card.getAttribute("href")).toBe("/services/s3");
  });

  it("marks the accessible label as active when isActive is true", () => {
    render(<ServiceCard serviceKey="s3" status="running" isActive />);
    expect(screen.getByRole("link", { name: /Open S3 \(active\)/i })).toBeTruthy();
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
  });

  it("renders unavailable services with the same accessible structure", () => {
    render(<ServiceCard serviceKey="glue" status="available" />);
    expect(screen.getByRole("link", { name: /Open Glue/i })).toBeTruthy();
  });
});
