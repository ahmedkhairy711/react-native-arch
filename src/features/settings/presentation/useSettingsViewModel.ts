import * as Application from 'expo-application';
import { useTranslation } from 'react-i18next';

import { env } from '@/core/config/env';
import { changeLanguage, type Language } from '@/core/i18n/i18n';
import type { ThemeMode } from '@/core/theme/ThemeProvider';
import { useSessionStore } from '@/features/auth/store/session.store';

import { useSettingsStore } from '../store/settings.store';

export function useSettingsViewModel() {
  const { i18n } = useTranslation();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const user = useSessionStore((s) => s.user);
  const signOut = useSessionStore((s) => s.signOut);

  return {
    user,
    themeMode,
    language: i18n.language as Language,
    version: `${Application.nativeApplicationVersion ?? '-'} (${Application.nativeBuildVersion ?? '-'})`,
    appEnv: env.appEnv,
    selectTheme: (mode: ThemeMode) => setThemeMode(mode),
    selectLanguage: (language: Language) => {
      setLanguage(language); // persisted synchronously before a possible RTL reload
      void changeLanguage(language);
    },
    signOut: () => void signOut(),
  };
}
