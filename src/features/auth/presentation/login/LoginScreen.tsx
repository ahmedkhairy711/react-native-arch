import { Image } from 'expo-image';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Images } from '@/core/generated/assets.gen';
import { makeStyles } from '@/core/theme/ThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';
import { FormTextField } from '@/shared/components/FormTextField';

import { useLoginViewModel } from './useLoginViewModel';

export function LoginScreen() {
  // Blocks screenshots/recording and hides content in the app switcher while credentials are on screen.
  usePreventScreenCapture();

  const styles = useStyles();
  const { t } = useTranslation();
  const { control, submit, isSubmitting, errorMessage } = useLoginViewModel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image
          source={Images.logo}
          style={styles.logo}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.header}>
          <AppText variant="title">{t('auth.title')}</AppText>
          <AppText color="textMuted">{t('auth.subtitle')}</AppText>
        </View>

        <FormTextField
          control={control}
          name="username"
          label={t('auth.username')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
        />
        <FormTextField
          control={control}
          name="password"
          label={t('auth.password')}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        {errorMessage ? (
          <AppText color="error" accessibilityRole="alert">
            {errorMessage}
          </AppText>
        ) : null}

        <AppButton title={t('auth.signIn')} loading={isSubmitting} onPress={submit} testID="login-submit" />
        <AppText variant="caption" color="textMuted" style={styles.hint}>
          {t('auth.demoHint')}
        </AppText>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  safeArea: { flex: 1, backgroundColor: t.colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: t.spacing.xl, gap: t.spacing.lg },
  logo: { width: 96, height: 96, alignSelf: 'center' },
  header: { gap: t.spacing.xs, marginBottom: t.spacing.sm },
  hint: { textAlign: 'center' },
}));
