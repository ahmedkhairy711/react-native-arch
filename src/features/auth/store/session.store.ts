import type { QueryClient } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { useDependencies } from '@/core/di/DependenciesProvider';
import { logger } from '@/core/logger/logger';

import type { AuthRepository } from '../data/auth.repository';
import type { User } from '../domain/user';

/**
 * App-wide session state: immutable state + actions that set a new state.
 * Created in the DI container (so it can be replaced in tests), read with `useSessionStore(selector)`.
 */
export type SessionState = {
  status: 'unknown' | 'authenticated' | 'unauthenticated';
  user: User | null;
};

type SessionActions = {
  restore(): Promise<void>;
  signedIn(user: User): void;
  signOut(): Promise<void>;
  /** Called by the HTTP layer when the refresh token is rejected. */
  expire(): void;
};

export type SessionStore = ReturnType<typeof createSessionStore>;

export function createSessionStore(authRepository: AuthRepository, queryClient: QueryClient) {
  return createStore<SessionState & SessionActions>()((set) => {
    const clear = () => {
      queryClient.clear(); // drop the previous user's cached data from memory
      set({ status: 'unauthenticated', user: null });
    };

    return {
      status: 'unknown',
      user: null,

      async restore() {
        try {
          const user = await authRepository.restoreSession();
          set(user ? { status: 'authenticated', user } : { status: 'unauthenticated', user: null });
        } catch (error) {
          logger.error('Session restore failed', error);
          set({ status: 'unauthenticated', user: null });
        }
      },

      signedIn(user) {
        set({ status: 'authenticated', user });
      },

      async signOut() {
        await authRepository.logout();
        clear();
      },

      expire: clear,
    };
  });
}

export function useSessionStore<T>(selector: (state: SessionState & SessionActions) => T): T {
  return useStore(useDependencies().sessionStore, selector);
}
