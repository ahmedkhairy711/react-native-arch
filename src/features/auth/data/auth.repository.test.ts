import { createMMKV } from 'react-native-mmkv';

import { ApiError } from '@/core/network/api-error';
import type { HttpClient } from '@/core/network/http-client';
import { secureStorage } from '@/core/storage/secure-storage';
import { TokenStorage } from '@/core/storage/token-storage';

import { AuthRepositoryImpl } from './auth.repository';

const userJson = {
  id: 1,
  username: 'emilys',
  email: 'emily@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://img',
};

const fakeHttp = (overrides: Partial<HttpClient> = {}): HttpClient => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  ...overrides,
});

function setup(http: HttpClient) {
  const tokenStorage = new TokenStorage(secureStorage);
  const repository = new AuthRepositoryImpl(http, tokenStorage, createMMKV({ id: 'test' }));
  return { repository, tokenStorage };
}

describe('AuthRepositoryImpl', () => {
  it('login stores tokens and maps the user entity', async () => {
    const http = fakeHttp({
      post: jest.fn().mockResolvedValue({ ...userJson, accessToken: 'a', refreshToken: 'r' }),
    });
    const { repository, tokenStorage } = setup(http);

    const user = await repository.login({ username: 'emilys', password: 'emilyspass' });

    expect(user).toEqual({
      id: 1,
      username: 'emilys',
      email: 'emily@x.com',
      fullName: 'Emily Johnson',
      avatarUrl: 'https://img',
    });
    await expect(tokenStorage.get()).resolves.toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('login rejects unexpected payloads with a parsing error', async () => {
    const { repository } = setup(fakeHttp({ post: jest.fn().mockResolvedValue({ nope: true }) }));
    await expect(repository.login({ username: 'u', password: 'p' })).rejects.toThrow();
  });

  it('restoreSession returns null without tokens', async () => {
    const { repository, tokenStorage } = setup(fakeHttp());
    await tokenStorage.clear();
    await expect(repository.restoreSession()).resolves.toBeNull();
  });

  it('restoreSession falls back to the cached user when offline', async () => {
    const post = jest.fn().mockResolvedValue({ ...userJson, accessToken: 'a', refreshToken: 'r' });
    const get = jest.fn().mockRejectedValue(new ApiError('network', 'offline'));
    const { repository } = setup(fakeHttp({ post, get }));
    await repository.login({ username: 'emilys', password: 'emilyspass' });

    await expect(repository.restoreSession()).resolves.toMatchObject({ username: 'emilys' });
  });

  it('restoreSession signs out when the session is rejected', async () => {
    const post = jest.fn().mockResolvedValue({ ...userJson, accessToken: 'a', refreshToken: 'r' });
    const get = jest.fn().mockRejectedValue(new ApiError('unauthorized', 'nope', 401));
    const { repository, tokenStorage } = setup(fakeHttp({ post, get }));
    await repository.login({ username: 'emilys', password: 'emilyspass' });

    await expect(repository.restoreSession()).resolves.toBeNull();
    await expect(tokenStorage.get()).resolves.toBeNull();
  });
});
