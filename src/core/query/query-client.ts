import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

import { ApiError } from '../network/api-error';

const NON_RETRYABLE = new Set<ApiError['kind']>([
  'unauthorized',
  'forbidden',
  'notFound',
  'badRequest',
  'parsing',
  'cancelled',
]);

/** Server-state cache (loading/error/caching/pagination/refetch). Replaces hand-written loading flags. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000, // unused data is released from memory after 5 min
        retry: (failureCount, error) => failureCount < 2 && !NON_RETRYABLE.has(ApiError.from(error).kind),
      },
      mutations: { retry: false },
    },
  });
}

/** Refetch stale queries when the app returns to foreground. Returns an unsubscribe fn. */
export function setupAppFocusRefetch() {
  const onChange = (status: AppStateStatus) => focusManager.setFocused(status === 'active');
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}
