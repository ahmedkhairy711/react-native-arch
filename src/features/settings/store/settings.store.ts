import type { MMKV } from 'react-native-mmkv';
import { useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { useDependencies } from '@/core/di/DependenciesProvider';
import type { Language } from '@/core/i18n/i18n';
import { toZustandStorage } from '@/core/storage/app-storage';
import type { ThemeMode } from '@/core/theme/ThemeProvider';

export type SettingsState = {
  themeMode: ThemeMode;
  /** null = follow the device language. */
  language: Language | null;
};

type SettingsActions = {
  setThemeMode(mode: ThemeMode): void;
  setLanguage(language: Language): void;
};

export type SettingsStore = ReturnType<typeof createSettingsStore>;

/** User preferences, persisted to encrypted MMKV (synchronous -> restored before first render). */
export function createSettingsStore(storage: MMKV) {
  return createStore<SettingsState & SettingsActions>()(
    persist(
      (set) => ({
        themeMode: 'system',
        language: null,
        setThemeMode: (themeMode) => set({ themeMode }),
        setLanguage: (language) => set({ language }),
      }),
      {
        name: 'settings',
        version: 1,
        storage: createJSONStorage(() => toZustandStorage(storage)),
        partialize: ({ themeMode, language }) => ({ themeMode, language }),
      },
    ),
  );
}

export function useSettingsStore<T>(selector: (state: SettingsState & SettingsActions) => T): T {
  return useStore(useDependencies().settingsStore, selector);
}
