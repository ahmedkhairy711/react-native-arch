import { createContext, use } from 'react';

import type { Dependencies } from './dependencies';

const DependenciesContext = createContext<Dependencies | null>(null);

/** Provides the container to the tree. Tests pass fakes: <DependenciesProvider value={fakeDeps}>. */
export const DependenciesProvider = DependenciesContext;

export function useDependencies(): Dependencies {
  const dependencies = use(DependenciesContext);
  if (!dependencies) throw new Error('useDependencies must be used inside <DependenciesProvider>');
  return dependencies;
}
