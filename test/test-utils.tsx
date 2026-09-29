import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { createDependencies } from '@/core/di/dependencies';
import { DependenciesProvider } from '@/core/di/DependenciesProvider';
import { ThemeProvider } from '@/core/theme/ThemeProvider';

type Overrides = Parameters<typeof createDependencies>[0];

/** Renders `ui` with the real provider tree + a DI container using the given fakes. */
export async function renderWithProviders(
  ui: ReactElement,
  overrides: Overrides = {},
  options?: RenderOptions,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const dependencies = createDependencies({ queryClient, ...overrides });

  const result = await render(
    <DependenciesProvider value={dependencies}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider mode="light">{ui}</ThemeProvider>
      </QueryClientProvider>
    </DependenciesProvider>,
    options,
  );
  return { ...result, dependencies };
}

export * from '@testing-library/react-native';
