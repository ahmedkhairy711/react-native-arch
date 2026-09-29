import { reloadAppAsync } from 'expo';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import { logger } from '../logger/logger';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const RTL_LANGUAGES: readonly Language[] = ['ar'];

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

export function isSupportedLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

export function getDeviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isSupportedLanguage(code) ? code : 'en';
}

export function initI18n(language: Language) {
  if (i18n.isInitialized) return i18n;
  void i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    initAsync: false, // resources are bundled -> init synchronously, no loading state
    interpolation: { escapeValue: false }, // React already escapes
    returnNull: false,
  });
  return i18n;
}

/**
 * RN needs an app reload to flip layout direction.
 * Returns true when the native direction was changed and a reload is required.
 */
export function syncLayoutDirection(language: Language): boolean {
  const shouldBeRTL = RTL_LANGUAGES.includes(language);
  if (I18nManager.isRTL === shouldBeRTL) return false;
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);
  return true;
}

export async function changeLanguage(language: Language) {
  await i18n.changeLanguage(language);
  if (syncLayoutDirection(language)) {
    try {
      await reloadAppAsync('Layout direction changed');
    } catch (error) {
      logger.warn('Reload failed; direction applies on next launch', error);
    }
  }
}

export { i18n };
