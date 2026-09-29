import axios, { type AxiosAdapter, type AxiosRequestConfig, isAxiosError } from 'axios';

import { ApiError } from './api-error';
import type * as HttpLogger from './http-logger';
import type { AuthTokens, TokenStorage } from '../storage/token-storage';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Don't attach the bearer token / don't try to refresh on 401 (login, refresh...). */
    skipAuth?: boolean;
    /** Internal: set once a request has been retried after a token refresh. */
    _retried?: boolean;
  }
}

export type RequestConfig = Pick<
  AxiosRequestConfig,
  'params' | 'headers' | 'signal' | 'skipAuth' | 'timeout'
>;

export interface HttpClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T>;
  post<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<T>;
  put<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<T>;
  patch<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T>;
}

type Options = {
  baseURL: string;
  tokenStorage: TokenStorage;
  enableLogs: boolean;
  getLanguage: () => string;
  /** Calls the refresh endpoint. Must use `skipAuth: true`. */
  refreshTokens: (refreshToken: string) => Promise<AuthTokens>;
  /** Refresh token rejected -> user must sign in again. */
  onSessionExpired: () => void;
  /** Tests only: swap the transport. */
  adapter?: AxiosAdapter;
};

export function createHttpClient(options: Options): HttpClient {
  const { tokenStorage } = options;

  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: 15_000,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    adapter: options.adapter,
  });

  // Registered first so it logs the final request (after auth headers) and the raw response.
  // The `require` sits behind __DEV__ so the logger is not even shipped in release bundles.
  if (__DEV__ && options.enableLogs) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { attachHttpLogger } = require('./http-logger') as typeof HttpLogger;
    attachHttpLogger(instance);
  }

  instance.interceptors.request.use(async (config) => {
    config.headers.set('Accept-Language', options.getLanguage());
    if (!config.skipAuth) {
      const tokens = await tokenStorage.get();
      if (tokens) config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
    return config;
  });

  // Single-flight refresh: N parallel 401s trigger exactly one refresh call.
  let refreshing: Promise<string | null> | null = null;
  const refreshAccessToken = () => {
    refreshing ??= (async () => {
      try {
        const tokens = await tokenStorage.get();
        if (!tokens) return null;
        const next = await options.refreshTokens(tokens.refreshToken);
        await tokenStorage.save(next);
        return next.accessToken;
      } catch (error) {
        const apiError = ApiError.from(error);
        // Offline/timeouts shouldn't log the user out; a rejected refresh token should.
        if (apiError.kind === 'network' || apiError.kind === 'timeout') throw apiError;
        await tokenStorage.clear();
        options.onSessionExpired();
        return null;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  };

  instance.interceptors.response.use(undefined, async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && error.config) {
      const config = error.config;
      if (!config.skipAuth && !config._retried) {
        config._retried = true;
        const accessToken = await refreshAccessToken();
        if (accessToken) {
          config.headers.set('Authorization', `Bearer ${accessToken}`);
          return instance.request(config);
        }
      }
    }
    throw ApiError.from(error);
  });

  return {
    get: (url, config) => instance.get(url, config).then((r) => r.data),
    post: (url, body, config) => instance.post(url, body, config).then((r) => r.data),
    put: (url, body, config) => instance.put(url, body, config).then((r) => r.data),
    patch: (url, body, config) => instance.patch(url, body, config).then((r) => r.data),
    delete: (url, config) => instance.delete(url, config).then((r) => r.data),
  };
}
