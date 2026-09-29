import { getRandomBytes } from 'expo-crypto';
import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

import type { SecureStorage } from './secure-storage';

const ENCRYPTION_KEY = 'app_storage_key';

/**
 * Fast, synchronous key-value storage (MMKV), AES-256 encrypted on disk.
 * The key is generated per install and kept in the Keychain/Keystore.
 */
export function createAppStorage(secureStorage: SecureStorage): MMKV {
  let key = secureStorage.getSync(ENCRYPTION_KEY);
  if (!key) {
    key = toHex(getRandomBytes(16)); // 32 chars -> AES-256 key
    secureStorage.setSync(ENCRYPTION_KEY, key);
  }
  return createMMKV({ id: 'app-storage', encryptionKey: key, encryptionType: 'AES-256' });
}

/** Adapter so Zustand `persist` can use MMKV (sync -> no hydration flash). */
export function toZustandStorage(storage: MMKV): StateStorage {
  return {
    getItem: (name) => storage.getString(name) ?? null,
    setItem: (name, value) => storage.set(name, value),
    removeItem: (name) => {
      storage.remove(name);
    },
  };
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
