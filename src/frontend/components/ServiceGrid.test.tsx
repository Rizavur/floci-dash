// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

import ServiceGrid, { type ServiceGridHandle } from "./ServiceGrid";

beforeEach(() => {
  localStorage.clear();
});

describe("ServiceGrid", () => {
  it("groups services by category with running/total counts", () => {
    render(<ServiceGrid services={{ s3: "running", ec2: "running", lambda: "available" }} />);
    expect(screen.getByText("Storage")).toBeTruthy();
    expect(screen.getByText("Compute")).toBeTruthy();
    // Compute has ec2 (running) + lambda (available) => 1/2
    expect(screen.getByText("1/2")).toBeTruthy();
    // Storage has only s3 (running) => 1/1
    expect(screen.getByText("1/1")).toBeTruthy();
  });

  it("renders a service card for every service", () => {
    render(<ServiceGrid services={{ s3: "running", dynamodb: "running" }} />);
    expect(screen.getByText("S3")).toBeTruthy();
    expect(screen.getByText("DynamoDB")).toBeTruthy();
  });

  it("shows an active-count badge for categories with active services", () => {
    render(
      <ServiceGrid
        services={{ s3: "running", ec2: "running" }}
        activeServices={["s3"]}
        resourceCounts={{ s3: 4 }}
      />,
    );
    expect(screen.getByText("1 active")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("does not show an active-count badge when nothing is active", () => {
    render(<ServiceGrid services={{ s3: "running" }} />);
    expect(screen.queryByText(/active/)).toBeNull();
  });

  it("sorts services alphabetically by label within a category", () => {
    render(<ServiceGrid services={{ rds: "running", dynamodb: "running" }} />);
    const labels = screen.getAllByText(/DynamoDB|RDS/).map((el) => el.textContent);
    expect(labels.indexOf("DynamoDB")).toBeLessThan(labels.indexOf("RDS"));
  });

  it("groups unknown service keys under Other", () => {
    render(<ServiceGrid services={{ "totally-made-up-service": "running" }} />);
    expect(screen.getByText("Other")).toBeTruthy();
    expect(screen.getByText("totally-made-up-service")).toBeTruthy();
  });

  it("collapses and expands a single category when its header is clicked", async () => {
    const user = userEvent.setup();
    render(<ServiceGrid services={{ s3: "running" }} />);
    expect(screen.getByText("S3")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Storage/i }));
    expect(screen.queryByText("S3")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Storage/i }));
    expect(screen.getByText("S3")).toBeTruthy();
  });

  it("exposes expandAll/collapseAll via ref", async () => {
    const ref = createRef<ServiceGridHandle>();
    render(<ServiceGrid ref={ref} services={{ s3: "running", ec2: "running" }} />);
    expect(screen.getByText("S3")).toBeTruthy();
    act(() => ref.current!.collapseAll());
    expect(screen.getByText("Storage")).toBeTruthy();
    expect(screen.queryByText("S3")).toBeNull();
    expect(screen.queryByText("EC2")).toBeNull();
    act(() => ref.current!.expandAll());
    expect(screen.getByText("S3")).toBeTruthy();
  });
});
