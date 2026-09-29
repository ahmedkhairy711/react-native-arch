import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';

import { ApiError } from './api-error';
import { createHttpClient } from './http-client';
import { secureStorage } from '../storage/secure-storage';
import { TokenStorage } from '../storage/token-storage';

const ok = (config: InternalAxiosRequestConfig, data: unknown) =>
  Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config });

const unauthorized = (config: InternalAxiosRequestConfig) =>
  Promise.reject(
    new AxiosError('401', 'ERR_BAD_REQUEST', config, undefined, {
      data: {},
      status: 401,
      statusText: '',
      headers: {},
      config,
    }),
  );

function setup(adapter: AxiosAdapter, refreshTokens = jest.fn()) {
  const tokenStorage = new TokenStorage(secureStorage);
  const onSessionExpired = jest.fn();
  const http = createHttpClient({
    baseURL: 'https://api.test',
    tokenStorage,
    enableLogs: false,
    getLanguage: () => 'ar',
    refreshTokens,
    onSessionExpired,
    adapter,
  });
  return { http, tokenStorage, onSessionExpired, refreshTokens };
}

describe('createHttpClient', () => {
  it('attaches the bearer token and Accept-Language', async () => {
    const adapter = jest.fn((config: InternalAxiosRequestConfig) => ok(config, { ok: true }));
    const { http, tokenStorage } = setup(adapter);
    await tokenStorage.save({ accessToken: 'a1', refreshToken: 'r1' });

    await expect(http.get('/me')).resolves.toEqual({ ok: true });

    const headers = adapter.mock.calls[0]![0].headers;
    expect(headers.get('Authorization')).toBe('Bearer a1');
    expect(headers.get('Accept-Language')).toBe('ar');
  });

  it('refreshes once for parallel 401s and retries with the new token', async () => {
    const adapter = jest.fn((config: InternalAxiosRequestConfig) =>
      config.headers.get('Authorization') === 'Bearer new' ? ok(config, 'data') : unauthorized(config),
    );
    const refreshTokens = jest.fn(async () => ({ accessToken: 'new', refreshToken: 'r2' }));
    const { http, tokenStorage } = setup(adapter, refreshTokens);
    await tokenStorage.save({ accessToken: 'old', refreshToken: 'r1' });

    await expect(Promise.all([http.get('/a'), http.get('/b')])).resolves.toEqual(['data', 'data']);
    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens).toHaveBeenCalledWith('r1');
    await expect(tokenStorage.get()).resolves.toEqual({ accessToken: 'new', refreshToken: 'r2' });
  });

  it('expires the session when the refresh token is rejected', async () => {
    const adapter = jest.fn((config: InternalAxiosRequestConfig) => unauthorized(config));
    const refreshTokens = jest.fn(async () => {
      throw new ApiError('unauthorized', 'refresh rejected', 401);
    });
    const { http, tokenStorage, onSessionExpired } = setup(adapter, refreshTokens);
    await tokenStorage.save({ accessToken: 'old', refreshToken: 'r1' });

    await expect(http.get('/a')).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    await expect(tokenStorage.get()).resolves.toBeNull();
  });
});
