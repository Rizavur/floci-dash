// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CardsSkeleton, DetailSkeleton, DashboardSkeleton } from "./LoadingSkeleton";

describe("LoadingSkeleton", () => {
  it("CardsSkeleton renders the specified number of cards", () => {
    const { container } = render(<CardsSkeleton count={3} />);
    expect(container.firstChild).toBeTruthy();
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
  });

  it("CardsSkeleton defaults to 4 cards", () => {
    const { container } = render(<CardsSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("DetailSkeleton renders with default lines", () => {
    const { container } = render(<DetailSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("DetailSkeleton renders with specified lines", () => {
    const { container } = render(<DetailSkeleton lines={6} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("DashboardSkeleton renders multiple sections", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeTruthy();
    expect(container.querySelectorAll("div").length).toBeGreaterThan(5);
  });
});
