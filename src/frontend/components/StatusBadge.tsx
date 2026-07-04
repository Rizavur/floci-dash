import { SignalIcon } from "@heroicons/react/16/solid";
import { StatusIndicator } from "./ui";

interface Props {
  status: "running" | "available" | "error" | "connected";
}

export default function StatusBadge({ status }: Props) {
  // "Running" is the status on almost every service page — spelling it out
  // next to every single title reads as noisy repetition. Same signal icon
  // already used for the "Running" stat on the Dashboard home page, so it
  // reads as "online" consistently across the app rather than introducing a
  // second visual for the same meaning.
  if (status === "running") {
    return (
      <SignalIcon
        className="tw:w-4 tw:h-4"
        style={{ color: "var(--sh-ok)" }}
        aria-label="Running"
        role="img"
      />
    );
  }
  const type = status === "available" ? "warning" : status === "error" ? "error" : "success";
  const label = status === "available" ? "Available" : status === "error" ? "Error" : "Connected";
  return <StatusIndicator type={type} variant="pill">{label}</StatusIndicator>;
}
