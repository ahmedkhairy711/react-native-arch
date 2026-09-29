import { useInfiniteQuery } from '@tanstack/react-query';

import { useDependencies } from '@/core/di/DependenciesProvider';
import { useErrorMessage } from '@/shared/hooks/useErrorMessage';

const PAGE_SIZE = 20;

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
};

export function useProductsViewModel() {
  const { productsRepository } = useDependencies();
  const toMessage = useErrorMessage();

  const query = useInfiniteQuery({
    queryKey: productKeys.list(),
    queryFn: ({ pageParam, signal }) =>
      productsRepository.getProducts({ page: pageParam, pageSize: PAGE_SIZE, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return {
    products: query.data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: query.isPending,
    errorMessage: query.isError && !query.data ? toMessage(query.error) : null,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    refresh: () => void query.refetch(),
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
  };
}
