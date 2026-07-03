// ─────────────────────────────────────────────────────────────────────────
// Drop-in replacement UI kit for @cloudscape-design/components.
//
// Every component here matches the prop API of the corresponding Cloudscape
// component (same event shapes — `{ detail: {...} }` — same prop names) so
// existing page/dashboard code can switch its import source from
// "@cloudscape-design/components" to "../components/ui" (or the relevant
// relative path) without touching call sites. Styling uses the shared
// design tokens from styles/dashboard.css (--sh-*) and Tailwind's `tw:`
// prefix, matching AppLayoutShell / DashboardHome.
// ─────────────────────────────────────────────────────────────────────────

export { Box } from "./Layout";
export { SpaceBetween } from "./Layout";
export { Header } from "./Layout";
export { Container } from "./Layout";
export { ContentLayout } from "./Layout";
export { ColumnLayout } from "./Layout";
export { BreadcrumbGroup } from "./Layout";

export { Button } from "./Button";

export {
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  Checkbox,
  Toggle,
  FileUpload,
} from "./Form";
export type { SelectProps, ToggleProps } from "./Form";

export { Modal } from "./Modal";

export { Table, TextFilter } from "./Table";

export { Tabs } from "./Tabs";
export type { TabsProps } from "./Tabs";

export {
  Alert,
  Flashbar,
  Skeleton,
  Spinner,
  StatusIndicator,
  Badge,
  Link,
  Icon,
} from "./Feedback";
export type { FlashbarProps } from "./Feedback";
