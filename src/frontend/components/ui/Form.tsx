import { useRef, useState, useEffect, forwardRef, type ReactNode } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/16/solid";

const CONTROL_BASE: React.CSSProperties = {
  width: "100%",
  fontSize: 12.5,
  fontFamily: "var(--font-ui)",
  color: "var(--sh-ink)",
  background: "var(--sh-elevated)",
  border: "1px solid var(--sh-line)",
  borderRadius: 5,
  padding: "6px 10px",
  outline: "none",
};

function focusHandlers(e: React.FocusEvent<HTMLElement>, focused: boolean) {
  e.currentTarget.style.borderColor = focused ? "var(--sh-accent)" : "var(--sh-line)";
}

// ── Form ────────────────────────────────────────────────────────────────
export function Form({ children, actions }: { children?: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {children}
      {actions && <div>{actions}</div>}
    </div>
  );
}

// ── FormField ───────────────────────────────────────────────────────────
interface FormFieldProps {
  label?: ReactNode;
  description?: ReactNode;
  errorText?: ReactNode;
  constraintText?: ReactNode;
  /** Extra control rendered inline next to the label (e.g. a "Validate" button). */
  secondaryControl?: ReactNode;
  stretch?: boolean;
  children?: ReactNode;
}

export function FormField({ label, description, errorText, constraintText, secondaryControl, children }: FormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-ui)" }}>
      {(label || secondaryControl) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {label && <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--sh-ink)" }}>{label}</label>}
          {secondaryControl}
        </div>
      )}
      {description && <div style={{ fontSize: 11.5, color: "var(--sh-dim)" }}>{description}</div>}
      {children}
      {constraintText && <div style={{ fontSize: 11, color: "var(--sh-faint)" }}>{constraintText}</div>}
      {errorText && <div style={{ fontSize: 11.5, color: "var(--sh-fail)" }}>{errorText}</div>}
    </div>
  );
}

// ── Input ───────────────────────────────────────────────────────────────
interface ChangeDetail<T> { detail: T }

interface InputProps {
  value: string;
  onChange?: (e: ChangeDetail<{ value: string }>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  inputMode?: string;
  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { value, onChange, placeholder, type = "text", disabled, readOnly, id, inputMode, autoFocus, onFocus },
  ref,
) {
  return (
    <input
      ref={ref}
      id={id}
      type={type}
      inputMode={inputMode as any}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={onChange ? (e) => onChange({ detail: { value: e.target.value } }) : undefined}
      style={CONTROL_BASE}
      onFocus={(e) => { focusHandlers(e, true); onFocus?.(e); }}
      onBlur={(e) => focusHandlers(e, false)}
    />
  );
});

// ── Textarea ────────────────────────────────────────────────────────────
interface TextareaProps {
  value: string;
  onChange?: (e: ChangeDetail<{ value: string }>) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
}

export function Textarea({ value, onChange, placeholder, rows = 4, readOnly }: TextareaProps) {
  return (
    <textarea
      value={value}
      rows={rows}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={onChange ? (e) => onChange({ detail: { value: e.target.value } }) : undefined}
      style={{ ...CONTROL_BASE, resize: "vertical", fontFamily: "var(--font-mono)" }}
      onFocus={(e) => focusHandlers(e, true)}
      onBlur={(e) => focusHandlers(e, false)}
    />
  );
}

// ── Select ──────────────────────────────────────────────────────────────
export namespace SelectProps {
  export interface Option {
    label: string;
    value?: string;
    description?: string;
    disabled?: boolean;
  }
}

interface SelectComponentProps {
  selectedOption: SelectProps.Option | null;
  onChange?: (e: ChangeDetail<{ selectedOption: SelectProps.Option }>) => void;
  options: SelectProps.Option[];
  placeholder?: string;
  disabled?: boolean;
  /** Accepted for API compatibility; a native <select> always filters as-you-type. */
  filteringType?: string;
  ariaLabel?: string;
}

export function Select({ selectedOption, onChange, options, placeholder, disabled, ariaLabel }: SelectComponentProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDisabled = disabled || !onChange;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (opt: SelectProps.Option) => {
    onChange?.({ detail: { selectedOption: opt } });
    setOpen(false);
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          ...CONTROL_BASE, appearance: "none", paddingRight: 28, textAlign: "left",
          cursor: isDisabled ? "default" : "pointer", display: "flex", alignItems: "center",
          opacity: isDisabled ? 0.6 : 1, position: "relative",
        }}
        onFocus={(e) => focusHandlers(e, true)}
        onBlur={(e) => focusHandlers(e, false)}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selectedOption ? "var(--sh-ink)" : "var(--sh-faint)" }}>
          {selectedOption?.label ?? placeholder ?? "Choose an option"}
        </span>
      </button>
      <ChevronUpDownIcon
        className="tw:w-3.5 tw:h-3.5"
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--sh-faint)", pointerEvents: "none" }}
      />
      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute", zIndex: 50, top: "calc(100% + 4px)", left: 0, right: 0,
            maxHeight: 260, overflowY: "auto", margin: 0, padding: 4, listStyle: "none",
            background: "var(--sh-surface)", border: "1px solid var(--sh-line)", borderRadius: 6,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((opt) => (
            <li
              key={opt.value ?? opt.label}
              role="option"
              aria-selected={opt.value === selectedOption?.value}
              aria-disabled={opt.disabled}
              onClick={() => { if (!opt.disabled) choose(opt); }}
              style={{
                padding: "6px 10px", borderRadius: 4, fontSize: 12.5, cursor: opt.disabled ? "default" : "pointer",
                opacity: opt.disabled ? 0.5 : 1,
                color: opt.value === selectedOption?.value ? "var(--sh-accent)" : "var(--sh-ink)",
                background: opt.value === selectedOption?.value ? "var(--sh-accent-bg)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!opt.disabled) e.currentTarget.style.background = "var(--sh-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = opt.value === selectedOption?.value ? "var(--sh-accent-bg)" : "transparent"; }}
            >
              <div>{opt.label}</div>
              {opt.description && (
                <div style={{ fontSize: 11, color: "var(--sh-faint)" }}>{opt.description}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Checkbox ────────────────────────────────────────────────────────────
interface CheckboxProps {
  checked: boolean;
  onChange: (e: ChangeDetail<{ checked: boolean }>) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function Checkbox({ checked, onChange, disabled, children }: CheckboxProps) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--sh-ink)", cursor: disabled ? "default" : "pointer", fontFamily: "var(--font-ui)" }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange({ detail: { checked: e.target.checked } })}
        style={{ width: 14, height: 14, accentColor: "var(--sh-accent)" }}
      />
      {children}
    </label>
  );
}

// ── Toggle ──────────────────────────────────────────────────────────────
export namespace ToggleProps {
  export interface ChangeDetail { checked: boolean }
}

interface ToggleComponentProps {
  checked: boolean;
  onChange: (e: ChangeDetail<{ checked: boolean }>) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function Toggle({ checked, onChange, disabled, children }: ToggleComponentProps) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--sh-ink)", cursor: disabled ? "default" : "pointer", fontFamily: "var(--font-ui)" }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange({ detail: { checked: !checked } })}
        style={{
          width: 32, height: 18, borderRadius: 999, border: "none", flexShrink: 0,
          background: checked ? "var(--sh-accent)" : "var(--sh-line)",
          position: "relative", cursor: disabled ? "default" : "pointer",
          transition: "background 0.15s", padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute", top: 2, left: checked ? 16 : 2,
            width: 14, height: 14, borderRadius: "50%", background: "#fff",
            transition: "left 0.15s",
          }}
        />
      </button>
      {children}
    </label>
  );
}

// ── FileUpload ──────────────────────────────────────────────────────────
interface I18nStrings {
  uploadButtonText?: (multiple: boolean) => string;
  dropzoneText?: (multiple: boolean) => string;
  removeFileAriaLabel?: (fileIndex: number, fileName: string) => string;
  limitShowFewer?: string;
  limitShowMore?: string;
  errorIconAriaLabel?: string;
}

interface FileUploadProps {
  value: File[];
  onChange: (e: ChangeDetail<{ value: File[] }>) => void;
  multiple?: boolean;
  showFileSize?: boolean;
  showFileLastModified?: boolean;
  i18nStrings?: I18nStrings;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUpload({ value, onChange, multiple, showFileSize, showFileLastModified, i18nStrings }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadText = i18nStrings?.uploadButtonText?.(!!multiple) ?? (multiple ? "Choose files" : "Choose file");
  const dropText = i18nStrings?.dropzoneText?.(!!multiple) ?? "Drag and drop files here";

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    onChange({ detail: { value: multiple ? [...value, ...arr] : arr } });
  };

  const removeAt = (idx: number) => {
    onChange({ detail: { value: value.filter((_, i) => i !== idx) } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          border: "1px dashed var(--sh-line)", borderRadius: 8, padding: "20px 12px",
          textAlign: "center", background: "var(--sh-elevated)",
        }}
      >
        <ArrowUpTrayIcon className="tw:w-5 tw:h-5" style={{ color: "var(--sh-faint)", margin: "0 auto 6px" }} />
        <div style={{ fontSize: 12, color: "var(--sh-dim)", marginBottom: 8 }}>{dropText}</div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{ fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 5, border: "1px solid var(--sh-line)", background: "var(--sh-surface)", color: "var(--sh-ink)", cursor: "pointer" }}
        >
          {uploadText}
        </button>
        <input ref={inputRef} type="file" multiple={multiple} hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {value.length > 0 && (
        <ul style={{ display: "flex", flexDirection: "column", gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
          {value.map((file, idx) => (
            <li key={`${file.name}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--sh-ink)", padding: "4px 8px", background: "var(--sh-elevated)", borderRadius: 5 }}>
              <DocumentIcon className="tw:w-3.5 tw:h-3.5" style={{ color: "var(--sh-faint)", flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
              {showFileSize && <span style={{ color: "var(--sh-faint)", fontSize: 11 }}>{formatBytes(file.size)}</span>}
              {showFileLastModified && <span style={{ color: "var(--sh-faint)", fontSize: 11 }}>{new Date(file.lastModified).toLocaleDateString()}</span>}
              <button
                type="button"
                aria-label={i18nStrings?.removeFileAriaLabel?.(idx, file.name) ?? `Remove ${file.name}`}
                onClick={() => removeAt(idx)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--sh-faint)", flexShrink: 0 }}
              >
                <XMarkIcon className="tw:w-3.5 tw:h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
