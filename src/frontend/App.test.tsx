// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// shouldShellThrow controls whether the AppLayoutShell mock throws.
// Using a mutable flag avoids mockImplementationOnce consumption during
// React Testing Library's internal cleanup renders.
let shouldShellThrow = false;

// Stub every child so App's route wiring renders without pulling in heavy
// Cloudscape pages or network calls. App.tsx itself (the Routes/Route tree) is
// what we're covering here.
vi.mock("./components/AppLayoutShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    if (shouldShellThrow) throw new Error("Shell crash!");
    return <div>{children}</div>;
  },
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

let consoleErrorSpy: ReturnType<typeof vi.spyOn> | null = null;

beforeEach(() => {
  shouldShellThrow = false;
});

afterEach(() => {
  consoleErrorSpy?.mockRestore();
  consoleErrorSpy = null;
});

describe("App", () => {
  it("mounts and renders the home route by default", () => {
    render(<App />);
    expect(screen.getByText("home-page")).toBeTruthy();
  });

  it("shows ErrorBoundary fallback when AppLayoutShell crashes — not a blank page (HIGH-01)", () => {
    // Make AppLayoutShell throw during render to simulate a crash in nav,
    // health-check hooks, or Cloudscape SideNavigation.
    shouldShellThrow = true;
    // Suppress React's error-boundary console output; restored in afterEach
    // so it's guaranteed to run even if the assertion below fails.
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // After the fix (outer ErrorBoundary wrapping AppLayoutShell), render must
    // NOT throw — it catches the error and shows the fallback UI instead.
    render(<App />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });
});
