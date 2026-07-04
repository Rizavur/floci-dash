interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

export default function EmptyState({ title, description, actionText, onAction, icon }: EmptyStateProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center",
      padding: "64px 24px", gap: "12px",
      fontFamily: "var(--font-ui)",
    }}>
      {icon && (
        <span style={{ fontSize: 32, lineHeight: 1 }}>{icon}</span>
      )}
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--sh-ink)" }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 12, color: "var(--sh-dim)", margin: 0, maxWidth: "320px", lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: "8px", padding: "8px 16px",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            background: "var(--sh-accent)", color: "var(--sh-bg)",
            border: "none", borderRadius: "5px",
            fontFamily: "var(--font-ui)",
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
