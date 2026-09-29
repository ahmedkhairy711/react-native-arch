import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '@/core/theme/ThemeProvider';
import { AppText } from '@/shared/components/AppText';

export default function NotFoundScreen() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title'), headerShown: true }} />
      <View style={styles.container}>
        <AppText variant="heading">{t('notFound.title')}</AppText>
        <Link href="/" style={styles.link}>
          <AppText color="primary">{t('notFound.goHome')}</AppText>
        </Link>
      </View>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.lg,
    backgroundColor: t.colors.background,
  },
  link: { padding: t.spacing.md },
}));
