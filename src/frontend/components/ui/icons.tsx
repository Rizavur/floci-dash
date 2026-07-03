// ─────────────────────────────────────────────────────────────────────────
// Maps legacy Cloudscape `iconName="..."` / `<Icon name="...">` string keys
// onto Heroicons components, so existing call sites don't need to change.
// ─────────────────────────────────────────────────────────────────────────
import {
  PlusIcon,
  ArrowLeftIcon,
  XMarkIcon,
  UserIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  CommandLineIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/16/solid";
import { FolderIcon as FolderIcon24 } from "@heroicons/react/24/solid";

export type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

export const ICON_MAP: Record<string, IconComponent> = {
  "add-plus": PlusIcon,
  "arrow-left": ArrowLeftIcon,
  close: XMarkIcon,
  contact: UserIcon,
  copy: ClipboardDocumentIcon,
  download: ArrowDownTrayIcon,
  edit: PencilIcon,
  external: ArrowTopRightOnSquareIcon,
  folder: FolderIcon24 as unknown as IconComponent,
  "folder-open": FolderOpenIcon,
  play: PlayIcon,
  refresh: ArrowPathIcon,
  remove: TrashIcon,
  undo: ArrowUturnLeftIcon,
  redo: ArrowPathIcon,
  globe: GlobeAltIcon,
  "status-pending": ClockIcon,
  "status-positive": CheckCircleIcon,
  "status-warning": ExclamationTriangleIcon,
  "status-negative": XCircleIcon,
  "status-stopped": XCircleIcon,
  "status-info": InformationCircleIcon,
  script: CommandLineIcon,
  keyboard: CommandLineIcon,
  search: MagnifyingGlassIcon,
};

export function resolveIcon(name?: string): IconComponent | null {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}
