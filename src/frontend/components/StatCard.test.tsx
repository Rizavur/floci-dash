// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Squares2X2Icon } from "@heroicons/react/16/solid";
import StatCard from "./StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Services" value={67} />);
    expect(screen.getByText("Services")).toBeTruthy();
    expect(screen.getByText("67")).toBeTruthy();
  });

  it("renders subtext when provided", () => {
    render(<StatCard label="Running" value={67} subtext="all active" />);
    expect(screen.getByText("all active")).toBeTruthy();
  });

  it("does not render subtext when omitted", () => {
    const { container } = render(<StatCard label="Resources" value={8} />);
    // Only label + value spans should be present (no third text span).
    expect(container.querySelectorAll("span").length).toBeLessThanOrEqual(2);
  });

  it("renders an icon badge when an icon is provided", () => {
    const { container } = render(<StatCard label="Services" value={67} icon={Squares2X2Icon} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders no icon badge when omitted", () => {
    const { container } = render(<StatCard label="Services" value={67} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders a progress bar clamped between 0 and 100", () => {
    const { container, rerender } = render(<StatCard label="Running" value={5} progress={150} />);
    let bar = container.querySelector("div[style*='border-radius: 999px'] > div") as HTMLDivElement | null;
    expect(bar?.style.width).toBe("100%");

    rerender(<StatCard label="Running" value={5} progress={-20} />);
    bar = container.querySelector("div[style*='border-radius: 999px'] > div");
    expect(bar?.style.width).toBe("0%");
  });

  it("does not render a progress bar when omitted", () => {
    const { container } = render(<StatCard label="Resources" value={8} />);
    // The progress track (pill-shaped background bar) should not be present.
    expect(container.querySelector("div[style*='border-radius: 999px']")).toBeNull();
  });

  it("renders text values with isText using the UI font", () => {
    render(<StatCard label="Status" value="Connected" isText />);
    expect(screen.getByText("Connected")).toBeTruthy();
  });
});
