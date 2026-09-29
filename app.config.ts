import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * App environments (flavors).
 * Select one with APP_ENV=development|staging|production (see package.json scripts / eas.json).
 *
 * Everything under `extra.env` is embedded in the JS bundle and is readable by anyone
 * who unpacks the app. Never put secrets here - only public config (URLs, flags, SSL pins).
 */
type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV = (process.env.APP_ENV ?? 'development') as AppEnv;

const BASE_BUNDLE_ID = 'com.example.rnarch';
const APP_NAME = 'RN Arch';

const FLAVORS: Record<
  AppEnv,
  {
    nameSuffix: string;
    idSuffix: string;
    env: {
      apiUrl: string;
      enableHttpLogs: boolean;
      blockCompromisedDevices: boolean;
      /** base64 SHA-256 SPKI hashes; at least 2 per domain (primary + backup). Empty = pinning off. */
      sslPins: Record<string, string[]>;
    };
  }
> = {
  development: {
    nameSuffix: ' (Dev)',
    idSuffix: '.dev',
    env: {
      apiUrl: 'https://dummyjson.com',
      enableHttpLogs: true,
      blockCompromisedDevices: false,
      sslPins: {},
    },
  },
  staging: {
    nameSuffix: ' (Stg)',
    idSuffix: '.stg',
    env: {
      apiUrl: 'https://dummyjson.com',
      enableHttpLogs: true,
      blockCompromisedDevices: false,
      sslPins: {},
    },
  },
  production: {
    nameSuffix: '',
    idSuffix: '',
    env: {
      apiUrl: 'https://dummyjson.com',
      enableHttpLogs: false,
      blockCompromisedDevices: true,
      // Fill before release, e.g. { 'dummyjson.com': ['<primary pin>', '<backup pin>'] }
      // See README "SSL pinning" for the openssl command that generates the pins.
      sslPins: {},
    },
  },
};

const flavor = FLAVORS[APP_ENV];
const bundleId = `${BASE_BUNDLE_ID}${flavor.idSuffix}`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `${APP_NAME}${flavor.nameSuffix}`,
  slug: 'react-native-arch',
  scheme: 'rnarch',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/app/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      // Only allow HTTPS (App Transport Security).
      NSAppTransportSecurity: { NSAllowsArbitraryLoads: false },
    },
  },
  android: {
    package: bundleId,
    // Keep tokens/data out of adb & cloud backups.
    allowBackup: false,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/app/android-icon-foreground.png',
      backgroundImage: './assets/app/android-icon-background.png',
      monochromeImage: './assets/app/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-image',
    'expo-font',
    [
      'expo-localization',
      { supportsRTL: true, supportedLocales: { ios: ['en', 'ar'], android: ['en', 'ar'] } },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/app/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: { backgroundColor: '#0B0F19' },
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          // R8: shrink + obfuscate native/Java code and strip unused resources.
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          usesCleartextTraffic: false,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // Auto-memoizes components/hooks: no manual useMemo/useCallback/memo needed.
    reactCompiler: true,
  },
  extra: {
    appEnv: APP_ENV,
    env: flavor.env,
  },
});
