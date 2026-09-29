import type { SecureStorage } from './secure-storage';

export type AuthTokens = { accessToken: string; refreshToken: string };

const KEY = 'auth_tokens';

/**
 * Tokens live in secure storage; an in-memory copy avoids a Keychain read on every request.
 */
export class TokenStorage {
  private cache: AuthTokens | null | undefined;

  constructor(private readonly secureStorage: SecureStorage) {}

  async get(): Promise<AuthTokens | null> {
    if (this.cache !== undefined) return this.cache;
    const raw = await this.secureStorage.get(KEY);
    this.cache = raw ? (JSON.parse(raw) as AuthTokens) : null;
    return this.cache;
  }

  async save(tokens: AuthTokens): Promise<void> {
    this.cache = tokens;
    await this.secureStorage.set(KEY, JSON.stringify(tokens));
  }

  async clear(): Promise<void> {
    this.cache = null;
    await this.secureStorage.remove(KEY);
  }
}
