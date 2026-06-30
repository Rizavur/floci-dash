// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Use vi.fn() so individual tests can override the implementation.
const mockShell = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);

// Stub every child so App's route wiring renders without pulling in heavy
// Cloudscape pages or network calls. App.tsx itself (the Routes/Route tree) is
// what we're covering here.
vi.mock("./components/AppLayoutShell", () => ({
  default: (props: { children: React.ReactNode }) => mockShell(props),
}));
vi.mock("./components/Toast", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({
    showToast: () => {},
    toasts: [],
  }),
}));

// Factories are hoisted above imports, so each must be fully self-contained.
vi.mock("./pages/DashboardHome", () => ({ default: () => <div>home-page</div> }));
vi.mock("./pages/ServicePage", () => ({ default: () => <div>service-page</div> }));
vi.mock("./pages/S3Page", () => ({ default: () => <div>s3-page</div> }));
vi.mock("./pages/EC2Page", () => ({ default: () => <div>ec2-page</div> }));
vi.mock("./pages/SQSPage", () => ({ default: () => <div>sqs-page</div> }));
vi.mock("./pages/SNSPage", () => ({ default: () => <div>sns-page</div> }));
vi.mock("./pages/EventsPage", () => ({ default: () => <div>events-page</div> }));
vi.mock("./pages/LambdaPage", () => ({ default: () => <div>lambda-page</div> }));
vi.mock("./pages/CloudWatchPage", () => ({ default: () => <div>cw-page</div> }));
vi.mock("./pages/IAMPage", () => ({ default: () => <div>iam-page</div> }));
vi.mock("./pages/SecretsManagerPage", () => ({ default: () => <div>secrets-page</div> }));
vi.mock("./pages/CloudFormationPage", () => ({ default: () => <div>cfn-page</div> }));
vi.mock("./pages/KMSPage", () => ({ default: () => <div>kms-page</div> }));
vi.mock("./pages/Settings", () => ({ default: () => <div>settings-page</div> }));

import App from "./App";

beforeEach(() => {
  mockShell.mockImplementation(({ children }: { children: React.ReactNode }) => <div>{children}</div>);
});

describe("App", () => {
  it("mounts and renders the home route by default", () => {
    render(<App />);
    expect(screen.getByText("home-page")).toBeTruthy();
  });

  it("shows ErrorBoundary fallback when AppLayoutShell crashes — not a blank page (HIGH-01)", () => {
    // Make the shell throw during render to simulate a crash in navigation,
    // health-check hooks, or Cloudscape SideNavigation.
    mockShell.mockImplementationOnce(() => { throw new Error("Shell crash!"); });
    // Suppress React's error boundary console output in tests.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    // After the fix (outer ErrorBoundary wrapping AppLayoutShell), render must
    // NOT throw — it catches the error and shows the fallback UI instead.
    render(<App />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    consoleError.mockRestore();
  });
});
