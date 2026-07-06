import { create } from "zustand";

const STORAGE_KEY = "fd-settings";

interface PersistedSettings {
  darkMode: boolean;
  refreshInterval: number;
  flociEndpoint?: string;
  parseJsonLogs: boolean;
}

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { parseJsonLogs: false, ...JSON.parse(raw) };
  } catch {}
  return { darkMode: true, refreshInterval: 5000, parseJsonLogs: false };
}

function saveSettings(settings: PersistedSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

interface SettingsState extends PersistedSettings {
  toggleDarkMode: () => void;
  setRefreshInterval: (ms: number) => void;
  setFlociEndpoint: (url: string) => void;
  setParseJsonLogs: (enabled: boolean) => void;
}

export const useSettings = create<SettingsState>((set, get) => {
  const initial = loadSettings();
  const persist = (patch: Partial<PersistedSettings>) => {
    const { darkMode, refreshInterval, flociEndpoint, parseJsonLogs } = get();
    saveSettings({ darkMode, refreshInterval, flociEndpoint, parseJsonLogs, ...patch });
  };
  return {
    darkMode: initial.darkMode,
    refreshInterval: initial.refreshInterval,
    flociEndpoint: initial.flociEndpoint,
    parseJsonLogs: initial.parseJsonLogs,
    toggleDarkMode: () =>
      set((s) => {
        persist({ darkMode: !s.darkMode });
        return { darkMode: !s.darkMode };
      }),
    setRefreshInterval: (ms) => {
      persist({ refreshInterval: ms });
      set({ refreshInterval: ms });
    },
    setFlociEndpoint: (url) => {
      persist({ flociEndpoint: url });
      set({ flociEndpoint: url });
    },
    setParseJsonLogs: (enabled) => {
      persist({ parseJsonLogs: enabled });
      set({ parseJsonLogs: enabled });
    },
  };
});
