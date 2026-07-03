import { useState, type ReactNode } from "react";

export namespace TabsProps {
  export interface Tab {
    id: string;
    label: ReactNode;
    content?: ReactNode;
    disabled?: boolean;
  }
}

interface TabsComponentProps {
  tabs: TabsProps.Tab[];
  activeTabId?: string;
  onChange?: (e: { detail: { activeTabId: string } }) => void;
}

export function Tabs({ tabs, activeTabId, onChange }: TabsComponentProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  const active = activeTabId ?? internalActive;
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  const select = (id: string) => {
    setInternalActive(id);
    onChange?.({ detail: { activeTabId: id } });
  };

  return (
    <div>
      <div role="tablist" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--sh-line)", overflowX: "auto" }}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => select(tab.id)}
              style={{
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: "var(--font-ui)",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--sh-accent)" : "2px solid transparent",
                color: isActive ? "var(--sh-accent)" : "var(--sh-dim)",
                cursor: tab.disabled ? "default" : "pointer",
                opacity: tab.disabled ? 0.5 : 1,
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" style={{ paddingTop: 16 }}>{activeTab?.content}</div>
    </div>
  );
}
