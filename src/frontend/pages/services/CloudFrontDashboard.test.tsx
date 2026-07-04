// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { createWrapper } from "../../../test/helpers";
import { CloudFrontDashboard } from "./CloudFrontDashboard";

function pageWrapper() {
  const Wrapper = createWrapper();
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <Wrapper>{children}</Wrapper>
    </MemoryRouter>
  );
}

vi.mock("../../hooks/useCloudFront", () => ({
  useCloudFrontDistributions: () => ({
    data: {
      distributions: [{ Id: "DIST123", DomainName: "d123.cloudfront.net", Status: "Deployed", Enabled: true }],
      total: 1,
    },
    isLoading: false,
  }),
  useCloudFrontInvalidations: () => ({ data: { invalidations: [], total: 0 } }),
  useCreateCloudFrontInvalidation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCloudFrontCachePolicies: () => ({
    data: { cachePolicies: [{ CachePolicy: { Id: "cp-1", CachePolicyConfig: { Name: "Managed-Cache" } }, Type: "managed" }], total: 1 },
  }),
  useCloudFrontFunctions: () => ({
    data: { functions: [{ Name: "my-func", Stage: "LIVE" }], total: 1 },
  }),
}));

// Regression coverage for a bug where the Tabs component had no onChange
// handler at all, so clicking "Cache Policies" or "Functions" did nothing —
// activeTabId was permanently locked to whichever of the first two tabs
// `selectedDist` implied.
describe("CloudFrontDashboard tabs", () => {
  it("switches to the Cache Policies tab when clicked", async () => {
    const user = userEvent.setup();
    render(<CloudFrontDashboard />, { wrapper: pageWrapper() });

    expect(screen.getByText("CloudFront Distributions")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Cache Policies" }));

    expect(screen.getByText("Managed-Cache")).toBeTruthy();
  });

  it("switches to the Functions tab when clicked", async () => {
    const user = userEvent.setup();
    render(<CloudFrontDashboard />, { wrapper: pageWrapper() });

    await user.click(screen.getByRole("tab", { name: "Functions" }));

    expect(screen.getByText("CloudFront Functions")).toBeTruthy();
    expect(screen.getByText("my-func")).toBeTruthy();
  });

  it("switches to Invalidations tab when a distribution ID is clicked", async () => {
    const user = userEvent.setup();
    render(<CloudFrontDashboard />, { wrapper: pageWrapper() });

    await user.click(screen.getByRole("button", { name: "DIST123" }));

    expect(screen.getByText("Invalidations for DIST123")).toBeTruthy();
  });
});
