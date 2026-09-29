import { initI18n } from '@/core/i18n/i18n';

// Single source of truth: tests read the real development flavor from app.config.ts.
jest.mock('expo-constants', () => {
  const appConfig = jest.requireActual('../app.config').default({ config: {} });
  return { __esModule: true, default: { expoConfig: appConfig } };
});

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 0,
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => void store.set(key, value)),
  };
});

// MMKV swaps itself for an in-memory mock under Jest; only the Nitro native bridge needs stubbing.
jest.mock('react-native-nitro-modules', () => ({ NitroModules: { createHybridObject: jest.fn() } }));

jest.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) => Uint8Array.from({ length: n }, (_, i) => i),
}));

jest.mock('expo-screen-capture', () => ({ usePreventScreenCapture: jest.fn() }));

jest.mock('react-native-keyboard-controller', () =>
  jest.requireActual('react-native-keyboard-controller/jest'),
);

jest.mock('jail-monkey', () => ({ isJailBroken: () => false, hookDetected: () => false }));

jest.mock('react-native-ssl-public-key-pinning', () => ({
  isSslPinningAvailable: () => false,
  initializeSslPinning: jest.fn(),
  addSslPinningErrorListener: jest.fn(),
}));

// FlashList measures native layout; FlatList has the same API and renders synchronously in tests.
jest.mock('@shopify/flash-list', () => ({
  ...jest.requireActual('@shopify/flash-list'),
  FlashList: jest.requireActual('react-native').FlatList,
}));

initI18n('en');
