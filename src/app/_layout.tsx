import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { env } from '@/core/config/env';
import { createDependencies } from '@/core/di/dependencies';
import { DependenciesProvider } from '@/core/di/DependenciesProvider';
import { Fonts } from '@/core/generated/assets.gen';
import { getDeviceLanguage, initI18n, syncLayoutDirection } from '@/core/i18n/i18n';
import { logger } from '@/core/logger/logger';
import { setupAppFocusRefetch } from '@/core/query/query-client';
import { isDeviceCompromised, setupSslPinning } from '@/core/security/security';
import { ThemeProvider, useTheme } from '@/core/theme/ThemeProvider';
import { useSessionStore } from '@/features/auth/store/session.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { CompromisedDeviceView } from '@/shared/components/CompromisedDeviceView';

export { AppErrorBoundary as ErrorBoundary } from '@/shared/components/AppErrorBoundary';

// ---- One-time, synchronous startup (runs before the first render) ----
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 250 });

const dependencies = createDependencies();

const language = dependencies.settingsStore.getState().language ?? getDeviceLanguage();
initI18n(language);
syncLayoutDirection(language); // takes effect on next launch if it had to change

const blocked = env.blockCompromisedDevices && isDeviceCompromised();

async function bootstrap() {
  try {
    await setupSslPinning(env); // before the first request
  } catch (error) {
    logger.error('SSL pinning setup failed', error);
  }
  await dependencies.sessionStore.getState().restore();
}

if (!blocked) void bootstrap();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <DependenciesProvider value={dependencies}>
          <QueryClientProvider client={dependencies.queryClient}>
            <ThemedApp />
          </QueryClientProvider>
        </DependenciesProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const status = useSessionStore((s) => s.status);
  const [fontsLoaded, fontError] = useFonts(Fonts); // fonts dropped in assets/fonts + `npm run gen:assets`
  const ready = (fontsLoaded || !!fontError) && (blocked || status !== 'unknown');

  // Native splash stays up until we know where to go -> no login-screen flash for signed-in users.
  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  useEffect(() => setupAppFocusRefetch(), []);

  return (
    <ThemeProvider mode={themeMode}>
      <AppStatusBar />
      {blocked ? <CompromisedDeviceView /> : <RootNavigator />}
    </ThemeProvider>
  );
}

function RootNavigator() {
  const status = useSessionStore((s) => s.status);
  const isAuthenticated = status === 'authenticated';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

function AppStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
