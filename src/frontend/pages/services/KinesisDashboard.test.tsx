// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createWrapper } from "../../../test/helpers";
import { KinesisDashboard } from "./KinesisDashboard";

vi.mock("../../hooks/useKinesis", () => ({
  useKinesisStreams: () => ({
    data: {
      streams: [{ StreamName: "my-stream", StreamStatus: "ACTIVE", OpenShardCount: 1 }],
      total: 1,
    },
    isLoading: false,
  }),
  useCreateKinesisStream: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteKinesisStream: () => ({ mutateAsync: vi.fn(), isPending: false, variables: null }),
  useKinesisShards: () => ({ data: { shards: [], total: 0 } }),
  usePutKinesisRecord: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Regression coverage for a bug where the "Stream Details" tab was
// permanently locked to whichever tab `selectedStream` implied, so clicking
// it manually (with no stream selected yet) silently did nothing.
describe("KinesisDashboard tabs", () => {
  it("switches to the Stream Details tab when clicked with no stream selected", async () => {
    const user = userEvent.setup();
    render(<KinesisDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText("Kinesis Streams")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Stream Details" }));

    expect(screen.getByText("Select a stream to view its shards.")).toBeTruthy();
  });

  it("jumps to the Stream Details tab when a stream name is clicked", async () => {
    const user = userEvent.setup();
    render(<KinesisDashboard />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: "my-stream" }));

    expect(screen.getByText("Shards in my-stream")).toBeTruthy();
  });
});
