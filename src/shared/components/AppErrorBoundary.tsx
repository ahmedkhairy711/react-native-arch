import type { ErrorBoundaryProps } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logger } from '@/core/logger/logger';
import { makeStyles } from '@/core/theme/ThemeProvider';

import { ErrorView } from './StateViews';

/** Catches render crashes in any route, reports them, and lets the user retry instead of a white screen. */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const styles = useStyles();
  const { t } = useTranslation();

  useEffect(() => {
    logger.error('Unhandled render error', error);
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <ErrorView message={t('errors.unknown')} onRetry={() => void retry()} />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
}));
