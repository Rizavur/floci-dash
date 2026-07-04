import type { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { Skeleton } from "./Feedback";

// ── TextFilter ──────────────────────────────────────────────────────────
interface TextFilterProps {
  filteringText: string;
  filteringPlaceholder?: string;
  onChange: (e: { detail: { filteringText: string } }) => void;
  countText?: string;
}

export function TextFilter({ filteringText, filteringPlaceholder, onChange, countText }: TextFilterProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
        <MagnifyingGlassIcon className="tw:w-3.5 tw:h-3.5" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--sh-faint)" }} />
        <input
          type="search"
          value={filteringText}
          placeholder={filteringPlaceholder}
          onChange={(e) => onChange({ detail: { filteringText: e.target.value } })}
          style={{
            width: "100%", fontSize: 12.5, padding: "6px 10px 6px 30px", borderRadius: 5,
            border: "1px solid var(--sh-line)", background: "var(--sh-elevated)", color: "var(--sh-ink)", outline: "none",
          }}
        />
      </div>
      {countText && <span style={{ fontSize: 11.5, color: "var(--sh-faint)", whiteSpace: "nowrap" }}>{countText}</span>}
    </div>
  );
}

// ── Table ───────────────────────────────────────────────────────────────
interface ColumnDefinition {
  id: string;
  header: ReactNode;
  cell: (item: any) => ReactNode;
  isRowHeader?: boolean;
  width?: number;
  sortingField?: string;
  /** Render this column's cells in the monospace font with tabular digits — use for dates, sizes, counts, and other numeric/aligned values. */
  mono?: boolean;
}

// Deterministic (non-random) varied widths so skeleton bars look like real
// text instead of a uniform block, without shifting on every re-render.
const SKELETON_WIDTHS = ["70%", "45%", "60%", "35%"];

interface TableProps {
  header?: ReactNode;
  filter?: ReactNode;
  columnDefinitions: ColumnDefinition[];
  items: any[];
  loading?: boolean;
  loadingText?: string;
  empty?: ReactNode;
  trackBy?: string | ((item: any) => any);
  variant?: string;
  resizableColumns?: boolean;
  selectionType?: "single" | "multi";
  selectedItems?: any[];
  onSelectionChange?: (e: { detail: { selectedItems: any[] } }) => void;
  onRowClick?: (e: { detail: { item: any } }) => void;
}

export function Table({
  header, filter, columnDefinitions, items, loading, loadingText, empty, trackBy,
  selectionType, selectedItems, onSelectionChange, onRowClick,
}: TableProps) {
  const isSelectable = !!selectionType;
  const selected = selectedItems ?? [];
  const keyOf = (item: any) => (typeof trackBy === "function" ? trackBy(item) : trackBy ? item[trackBy] : item);
  const isChecked = (item: any) => selected.some((s) => keyOf(s) === keyOf(item));

  const toggleOne = (item: any) => {
    if (!onSelectionChange) return;
    if (selectionType === "single") {
      onSelectionChange({ detail: { selectedItems: isChecked(item) ? [] : [item] } });
      return;
    }
    const next = isChecked(item) ? selected.filter((s) => keyOf(s) !== keyOf(item)) : [...selected, item];
    onSelectionChange({ detail: { selectedItems: next } });
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange({ detail: { selectedItems: selected.length === items.length ? [] : [...items] } });
  };
  return (
    <div style={{ background: "var(--sh-surface)", border: "1px solid var(--sh-line)", borderRadius: 8, overflow: "hidden" }}>
      {(header || filter) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--sh-line)" }}>
          {header}
          {filter}
        </div>
      )}

      {loading ? (
        <div style={{ overflowX: "auto", overflowY: "hidden" }}>
          <span className="tw:sr-only">{loadingText || "Loading…"}</span>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--font-ui)" }}>
            <thead>
              <tr>
                {isSelectable && (
                  <th style={{ width: 36, padding: "8px 12px", borderBottom: "1px solid var(--sh-line)", background: "var(--sh-elevated)" }} />
                )}
                {columnDefinitions.map((col) => (
                  <th
                    key={col.id}
                    style={{
                      textAlign: "left", padding: "8px 16px", fontSize: 11, fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--sh-faint)",
                      borderBottom: "1px solid var(--sh-line)", width: col.width, whiteSpace: "nowrap",
                      background: "var(--sh-elevated)",
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={rowIdx} style={{ borderBottom: rowIdx === 5 ? "none" : "1px solid var(--sh-line-sub)" }}>
                  {isSelectable && <td style={{ padding: "9px 12px" }} />}
                  {columnDefinitions.map((col, colIdx) => (
                    <td key={col.id} style={{ padding: "9px 16px" }}>
                      <Skeleton height="14px" width={SKELETON_WIDTHS[(rowIdx + colIdx) % SKELETON_WIDTHS.length]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: "32px 16px" }}>{empty}</div>
      ) : (
        <div style={{ overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--font-ui)" }}>
            <thead>
              <tr>
                {isSelectable && (
                  <th style={{ width: 36, padding: "8px 12px", borderBottom: "1px solid var(--sh-line)", background: "var(--sh-elevated)" }}>
                    {selectionType === "multi" && (
                      <input type="checkbox" checked={items.length > 0 && selected.length === items.length} onChange={toggleAll} style={{ accentColor: "var(--sh-accent)" }} />
                    )}
                  </th>
                )}
                {columnDefinitions.map((col) => (
                  <th
                    key={col.id}
                    style={{
                      textAlign: "left", padding: "8px 16px", fontSize: 11, fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--sh-faint)",
                      borderBottom: "1px solid var(--sh-line)", width: col.width, whiteSpace: "nowrap",
                      background: "var(--sh-elevated)",
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, rowIdx) => (
                <tr
                  key={trackBy ? keyOf(item) : rowIdx}
                  onClick={onRowClick ? () => onRowClick({ detail: { item } }) : undefined}
                  style={{ borderBottom: rowIdx === items.length - 1 ? "none" : "1px solid var(--sh-line-sub)", cursor: onRowClick ? "pointer" : undefined }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sh-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {isSelectable && (
                    <td style={{ padding: "9px 12px" }}>
                      <input
                        type={selectionType === "single" ? "radio" : "checkbox"}
                        checked={isChecked(item)}
                        onChange={() => toggleOne(item)}
                        style={{ accentColor: "var(--sh-accent)" }}
                      />
                    </td>
                  )}
                  {columnDefinitions.map((col) => (
                    <td
                      key={col.id}
                      style={{
                        padding: "9px 16px", color: col.isRowHeader ? "var(--sh-ink)" : "var(--sh-dim)",
                        fontWeight: col.isRowHeader ? 500 : 400, verticalAlign: "middle",
                        fontFamily: col.mono ? "var(--font-mono)" : undefined,
                        fontVariantNumeric: col.mono ? "tabular-nums" : undefined,
                      }}
                    >
                      {col.cell(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
