/**
 * Composition root (DI container). The ONLY place where concrete implementations are chosen
 * and wired together. Everything else receives its dependencies (constructor args / useDependencies()).
 *
 * Add a feature: create its repository here and expose it on the returned object.
 */
import type { QueryClient } from '@tanstack/react-query';

import { type AuthRepository, AuthRepositoryImpl } from '@/features/auth/data/auth.repository';
import { createSessionStore } from '@/features/auth/store/session.store';
import {
  type ProductsRepository,
  ProductsRepositoryImpl,
} from '@/features/products/data/products.repository';
import { createSettingsStore } from '@/features/settings/store/settings.store';

import { env } from '../config/env';
import { i18n } from '../i18n/i18n';
import { createHttpClient } from '../network/http-client';
import { createQueryClient } from '../query/query-client';
import { createAppStorage } from '../storage/app-storage';
import { secureStorage } from '../storage/secure-storage';
import { TokenStorage } from '../storage/token-storage';

type Overrides = Partial<{
  authRepository: AuthRepository;
  productsRepository: ProductsRepository;
  queryClient: QueryClient;
}>;

export function createDependencies(overrides: Overrides = {}) {
  const tokenStorage = new TokenStorage(secureStorage);
  const appStorage = createAppStorage(secureStorage);
  const queryClient = overrides.queryClient ?? createQueryClient();

  const http = createHttpClient({
    baseURL: env.apiUrl,
    tokenStorage,
    enableLogs: env.enableHttpLogs,
    getLanguage: () => i18n.language || 'en',
    refreshTokens: (refreshToken) => authRepository.refreshTokens(refreshToken),
    onSessionExpired: () => sessionStore.getState().expire(),
  });

  const authRepository = overrides.authRepository ?? new AuthRepositoryImpl(http, tokenStorage, appStorage);
  const productsRepository = overrides.productsRepository ?? new ProductsRepositoryImpl(http);

  const sessionStore = createSessionStore(authRepository, queryClient);
  const settingsStore = createSettingsStore(appStorage);

  return {
    http,
    queryClient,
    appStorage,
    authRepository,
    productsRepository,
    sessionStore,
    settingsStore,
  };
}

export type Dependencies = ReturnType<typeof createDependencies>;
