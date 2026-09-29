import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { makeStyles, useTheme } from '@/core/theme/ThemeProvider';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

export function LoadingView() {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <AppText color="textMuted" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? <AppButton title={t('common.retry')} variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  const styles = useStyles();
  return (
    <View style={styles.center}>
      <AppText color="textMuted">{message}</AppText>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.xl,
    gap: t.spacing.lg,
  },
  message: { textAlign: 'center' },
}));
