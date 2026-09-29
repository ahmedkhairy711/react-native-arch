import * as SecureStore from 'expo-secure-store';

/**
 * Keychain (iOS) / Keystore-backed EncryptedSharedPreferences (Android).
 * Use ONLY for small secrets: tokens, encryption keys. Everything else goes to AppStorage.
 */
export interface SecureStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  getSync(key: string): string | null;
  setSync(key: string, value: string): void;
}

const options: SecureStore.SecureStoreOptions = {
  // Not synced to iCloud, not restored to another device, unreadable before first unlock.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const secureStorage: SecureStorage = {
  get: (key) => SecureStore.getItemAsync(key, options),
  set: (key, value) => SecureStore.setItemAsync(key, value, options),
  remove: (key) => SecureStore.deleteItemAsync(key, options),
  getSync: (key) => SecureStore.getItem(key, options),
  setSync: (key, value) => SecureStore.setItem(key, value, options),
};
