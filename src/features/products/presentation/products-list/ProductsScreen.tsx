import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { makeStyles, useTheme } from '@/core/theme/ThemeProvider';
import { EmptyView, ErrorView, LoadingView } from '@/shared/components/StateViews';

import { ProductCard } from './ProductCard';
import { useProductsViewModel } from './useProductsViewModel';

export function ProductsScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const vm = useProductsViewModel();

  if (vm.isLoading) return <LoadingView />;
  if (vm.errorMessage) return <ErrorView message={vm.errorMessage} onRetry={vm.refresh} />;

  return (
    // FlashList recycles views: constant memory no matter how long the list gets.
    <FlashList
      data={vm.products}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <ProductCard product={item} />}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      onEndReached={vm.loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={vm.isRefreshing}
          onRefresh={vm.refresh}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={<EmptyView message={t('products.empty')} />}
      ListFooterComponent={vm.isLoadingMore ? <ActivityIndicator style={styles.footer} /> : null}
    />
  );
}

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

const useStyles = makeStyles((t) => ({
  content: { padding: t.spacing.lg },
  separator: { height: t.spacing.md },
  footer: { paddingVertical: t.spacing.lg },
}));
