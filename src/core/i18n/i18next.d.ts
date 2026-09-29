import 'i18next';

import type en from './locales/en.json';

// Type-safe keys: t('auth.signIn') autocompletes and typos fail the typecheck.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
    returnNull: false;
  }
}
