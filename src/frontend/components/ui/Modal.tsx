import { type ReactNode, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  size?: "small" | "medium" | "large" | "max";
  children?: ReactNode;
}

const SIZE_WIDTH: Record<string, number> = { small: 400, medium: 560, large: 760, max: 1200 };

export function Modal({ visible, onDismiss, header, footer, size = "medium", children }: ModalProps) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        // ponytail: backdropFilter has no IE/old-Safari fallback, unsupported browsers just get the plain scrim
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "relative", width: "100%", maxWidth: SIZE_WIDTH[size],
          maxHeight: "85vh", display: "flex", flexDirection: "column",
          background: "var(--sh-surface)", border: "1px solid var(--sh-line)",
          borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          fontFamily: "var(--font-ui)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--sh-line)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--sh-ink)" }}>{header}</div>
          <button
            onClick={onDismiss}
            aria-label="Close"
            style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--sh-faint)", padding: 4 }}
          >
            <XMarkIcon className="tw:w-4 tw:h-4" />
          </button>
        </div>
        <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && (
          // flow-root gives this div its own block-formatting context, so it
          // correctly wraps the floated (`Box float="right"`) button row
          // instead of collapsing to zero height around it — without this the
          // footer's padding/border doesn't actually contain the buttons,
          // throwing off their vertical position relative to the modal edge.
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--sh-line)", display: "flow-root" }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
