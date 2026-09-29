import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '@/core/theme/ThemeProvider';
import { AppText } from '@/shared/components/AppText';
import { formatCurrency } from '@/shared/utils/format';

import type { Product } from '../../domain/product';

export function ProductCard({ product }: { product: Product }) {
  const styles = useStyles();
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.card}>
      <Image
        source={product.thumbnailUrl}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        // Lets FlashList reuse the native view without flashing the previous image.
        recyclingKey={String(product.id)}
        transition={150}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.body}>
        <AppText variant="label" numberOfLines={1}>
          {product.title}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={2}>
          {product.description}
        </AppText>
        <View style={styles.row}>
          <AppText variant="label" color="primary">
            {formatCurrency(product.price, i18n.language)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {t('products.rating', { rating: product.rating.toFixed(1) })}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    flexDirection: 'row',
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  image: { width: 72, height: 72, borderRadius: t.radius.md },
  body: { flex: 1, gap: t.spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
}));
