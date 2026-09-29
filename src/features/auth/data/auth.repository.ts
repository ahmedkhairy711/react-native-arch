import type { MMKV } from 'react-native-mmkv';

import { ApiError } from '@/core/network/api-error';
import type { HttpClient } from '@/core/network/http-client';
import type { AuthTokens, TokenStorage } from '@/core/storage/token-storage';

import { loginResponseDto, toTokens, toUser, tokensDto, userDto } from './auth.dto';
import type { Credentials, User } from '../domain/user';

export interface AuthRepository {
  login(credentials: Credentials): Promise<User>;
  logout(): Promise<void>;
  /** Returns the signed-in user, or null when there is no valid session. */
  restoreSession(): Promise<User | null>;
  refreshTokens(refreshToken: string): Promise<AuthTokens>;
}

const USER_KEY = 'auth.user';
const TOKEN_TTL_MINUTES = 30;

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorage,
    private readonly storage: MMKV,
  ) {}

  async login({ username, password }: Credentials): Promise<User> {
    const json = await this.http.post(
      '/auth/login',
      { username, password, expiresInMins: TOKEN_TTL_MINUTES },
      { skipAuth: true },
    );
    const dto = loginResponseDto.parse(json);
    await this.tokenStorage.save(toTokens(dto));
    const user = toUser(dto);
    this.cacheUser(user);
    return user;
  }

  async logout(): Promise<void> {
    this.storage.remove(USER_KEY);
    await this.tokenStorage.clear();
  }

  async restoreSession(): Promise<User | null> {
    if (!(await this.tokenStorage.get())) return null;
    try {
      const user = toUser(userDto.parse(await this.http.get('/auth/me')));
      this.cacheUser(user);
      return user;
    } catch (error) {
      const { kind } = ApiError.from(error);
      // Offline at launch: keep the user signed in with the cached profile.
      if (kind === 'network' || kind === 'timeout' || kind === 'server') return this.cachedUser();
      await this.logout();
      return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const json = await this.http.post(
      '/auth/refresh',
      { refreshToken, expiresInMins: TOKEN_TTL_MINUTES },
      { skipAuth: true },
    );
    return toTokens(tokensDto.parse(json));
  }

  private cacheUser(user: User) {
    this.storage.set(USER_KEY, JSON.stringify(user));
  }

  private cachedUser(): User | null {
    const raw = this.storage.getString(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
