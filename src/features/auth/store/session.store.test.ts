import { QueryClient } from '@tanstack/react-query';

import { createSessionStore } from './session.store';
import type { AuthRepository } from '../data/auth.repository';

const user = { id: 1, username: 'emilys', email: 'e@x.com', fullName: 'Emily J', avatarUrl: '' };

const fakeRepository = (overrides: Partial<AuthRepository> = {}): AuthRepository => ({
  login: jest.fn(),
  logout: jest.fn(),
  restoreSession: jest.fn().mockResolvedValue(null),
  refreshTokens: jest.fn(),
  ...overrides,
});

describe('session store', () => {
  it('starts unknown and restores an existing session', async () => {
    const store = createSessionStore(
      fakeRepository({ restoreSession: jest.fn().mockResolvedValue(user) }),
      new QueryClient(),
    );
    expect(store.getState().status).toBe('unknown');

    await store.getState().restore();

    expect(store.getState()).toMatchObject({ status: 'authenticated', user });
  });

  it('signOut logs out and wipes cached server data', async () => {
    const repository = fakeRepository();
    const queryClient = new QueryClient();
    queryClient.setQueryData(['products'], ['secret']);
    const store = createSessionStore(repository, queryClient);
    store.getState().signedIn(user);

    await store.getState().signOut();

    expect(repository.logout).toHaveBeenCalled();
    expect(queryClient.getQueryData(['products'])).toBeUndefined();
    expect(store.getState()).toMatchObject({ status: 'unauthenticated', user: null });
  });
});
