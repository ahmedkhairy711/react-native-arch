# React Native Arch — production starter

A clean, production-ready **React Native (Expo SDK 57, New Architecture, TypeScript)** starter.
Clone it, rename it, delete the example features, and start building.

It uses **MVVM with Cubit-style stores**, DI, typed i18n (English + Arabic with RTL), light/dark themes,
secure networking with a dev-only cURL logger, tests, CI, and hardening for release builds. It stays
small on purpose: repositories and entities, **no use-case layer** or other ceremony until you need it.

> **Coming from Flutter?** See the [Flutter → React Native map](#flutter--react-native-map) below.

---

## Quick start

```bash
nvm use                 # Node 22
npm install
npm run android         # or: npm run ios  (builds a dev client: native modules are used)
```

Demo login: **`emilys` / `emilyspass`** (public [DummyJSON](https://dummyjson.com) API).

| Script                                               | What it does                                           |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `npm start` / `start:staging` / `start:prod`         | Metro for the chosen flavor                            |
| `npm run android` / `ios`                            | Build & run the dev client locally                     |
| `npm run build:dev` / `build:staging` / `build:prod` | Cloud builds with EAS (`eas.json`)                     |
| `npm run gen:assets`                                 | Regenerate typed asset index (flutter_gen equivalent)  |
| `npm run check`                                      | Assets check + typecheck + lint + tests (what CI runs) |
| `npm test` / `test:watch` / `test:coverage`          | Jest + React Native Testing Library                    |
| `npm run lint` / `lint:fix` / `format`               | ESLint (strict, type-aware) + Prettier                 |

Git hooks (Husky): **pre-commit** runs lint-staged, **pre-push** runs typecheck + tests.

---

## Flutter → React Native map

| Flutter                                | This starter                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `flutter_lints` / `very_good_analysis` | ESLint 9 flat config (`eslint-config-expo` + type-aware TS rules) + Prettier + strict TS |
| `flutter_gen`                          | `scripts/gen-assets.mjs` → `Images.logo`, `Fonts` (typed, checked in CI)                 |
| `flutter_bloc` Cubit                   | **Zustand** vanilla stores (`createStore`) — state + methods that emit new state         |
| ViewModel                              | `useXxxViewModel()` hook per screen                                                      |
| `get_it` / `injectable`                | `createDependencies()` composition root + `useDependencies()` (React context)            |
| `dio` + interceptors                   | **axios** + interceptors (auth, single-flight token refresh, error mapping)              |
| `pretty_dio_logger` / curl logger      | `http-logger.ts`: every request printed as **cURL** — dev only, stripped from release    |
| `freezed` / `json_serializable`        | **zod** schemas (runtime validation at the API boundary) + mappers to entities           |
| `easy_localization` / `intl`           | **i18next** + `react-i18next` + `expo-localization`, type-safe keys, RTL                 |
| `ThemeData` light/dark                 | `theme.ts` tokens + `ThemeProvider` + `makeStyles()`                                     |
| `flutter_secure_storage`               | `expo-secure-store` (Keychain / Keystore)                                                |
| `shared_preferences` / `hive`          | **MMKV** (sync, AES-256 encrypted, key kept in Keychain/Keystore)                        |
| `go_router` + redirect                 | **Expo Router** (file-based, typed routes) + `Stack.Protected` auth guard                |
| `ListView.builder`                     | **FlashList** (view recycling)                                                           |
| `cached_network_image`                 | **expo-image** (memory + disk cache)                                                     |
| `reactive_forms` / form validators     | **react-hook-form** + zod                                                                |
| `flutter_flavors`                      | `APP_ENV` flavors in `app.config.ts` (+ separate bundle IDs so all can be installed)     |
| `--obfuscate --split-debug-info`       | Hermes bytecode + R8 minify/shrink + console stripping                                   |
| `flutter_jailbreak_detection`          | `jail-monkey`                                                                            |
| `http_certificate_pinning`             | `react-native-ssl-public-key-pinning`                                                    |
| `flutter_test` / `mocktail`            | Jest + React Native Testing Library + plain fakes via DI                                 |
| `integration_test`                     | Maestro flow in `.maestro/`                                                              |

---

## Project structure

```
src/
├── app/                        # Routes only (Expo Router). Thin files that mount feature screens.
│   ├── _layout.tsx             # Startup + providers + auth guard (Stack.Protected)
│   ├── login.tsx
│   ├── (tabs)/_layout.tsx      # Bottom tabs
│   ├── (tabs)/index.tsx        # Products
│   └── (tabs)/settings.tsx
├── core/                       # App-wide infrastructure, no feature knowledge
│   ├── config/env.ts           # Typed, validated flavor config
│   ├── di/                     # Composition root + useDependencies()
│   ├── network/                # HttpClient, ApiError, cURL logger
│   ├── storage/                # SecureStorage, TokenStorage, encrypted MMKV
│   ├── security/               # SSL pinning, root/jailbreak detection
│   ├── i18n/                   # i18next setup, en.json / ar.json, typed keys
│   ├── theme/                  # Tokens, ThemeProvider, makeStyles
│   ├── query/                  # TanStack Query client
│   ├── logger/                 # logger (+ crash-reporter hook)
│   └── generated/              # assets.gen.ts (generated, don't edit)
├── shared/                     # Reusable UI (AppText, AppButton, FormTextField, StateViews), hooks, utils
└── features/
    └── <feature>/
        ├── domain/             # Entities (plain TS types)
        ├── data/               # DTOs (zod) + mappers + Repository (interface + impl)
        ├── store/              # Optional app-wide state for the feature ("Cubit")
        └── presentation/
            └── <screen>/       # XxxScreen.tsx (View) + useXxxViewModel.ts (ViewModel) + tests
test/                           # Jest setup + renderWithProviders()
scripts/gen-assets.mjs          # Typed assets generator
assets/app | images | fonts     # App icon/splash | images used in code | fonts
```

Lint rules enforce the boundaries: `core/` and `shared/` can't import features; features can't import routes.

---

## Architecture

```
View (Screen.tsx)  ──uses──▶  ViewModel (useXxxViewModel)  ──▶  Repository  ──▶  HttpClient / Storage
      ▲                               │   ▲
      └──────── renders state ◀───────┘   └── Store (Zustand "Cubit") for app-wide state (session, settings)
```

- **View**: renders what the ViewModel exposes and forwards user intents. No API calls or business rules.
- **ViewModel**: a hook with the screen's logic. It uses **TanStack Query** for server state (loading,
  errors, caching, pagination, cancellation, refetch on focus) and stores for app state. It returns a
  small, render-ready object.
- **Store ("Cubit")**: a Zustand vanilla store with immutable state and methods that emit new state
  (`session.store.ts`, `settings.store.ts`). Read it with selectors, for example
  `useSessionStore((s) => s.status)`, so components only re-render when that slice changes.
- **Repository**: the only thing that knows the API. It parses responses with zod, maps DTOs to
  entities, and throws only `ApiError`.
- **Entity**: a plain type the UI works with, decoupled from the API shape.
- **DI**: `core/di/dependencies.ts` is the single place where implementations are created and wired.
  Tests and demos pass fakes: `createDependencies({ productsRepository: fake })`.

**Why no use cases?** A use case that only forwards to a repository method adds a file and nothing else.
Add one when real logic spans several repositories.

### Adding a feature (checklist)

1. `features/orders/domain/order.ts`: entity type.
2. `features/orders/data/orders.dto.ts`: zod schema + `toOrder()` mapper.
3. `features/orders/data/orders.repository.ts`: `OrdersRepository` interface + `OrdersRepositoryImpl`.
4. Register it in `core/di/dependencies.ts` (and in `Overrides` if you want it fakeable).
5. `features/orders/presentation/orders-list/useOrdersListViewModel.ts` + `OrdersListScreen.tsx`.
6. Route: `src/app/(tabs)/orders.tsx` → `export { OrdersListScreen as default } from '...'`.
7. Strings in `en.json` **and** `ar.json` (keys are type-checked).
8. Tests next to the files (`*.test.ts(x)`), using `renderWithProviders(<Screen />, { ordersRepository: fake })`.

---

## Networking & debugging

- `HttpClient` (axios) adds `Authorization` and `Accept-Language`, applies a 15 s timeout, and maps every
  failure to a typed `ApiError` (`network | timeout | unauthorized | forbidden | notFound | badRequest |
server | parsing | cancelled | unknown`). The UI shows `t('errors.<kind>')` and never raw server text.
- On **401**, one shared refresh call runs even when many requests fail at once. The failed requests are
  retried with the new token. If the refresh token is rejected, the session expires and the user goes to
  login. Offline errors never log the user out.
- **cURL logging (dev only)**: each request is printed as a copy-pasteable `curl` command with its status
  and timing. It is triple-guarded against reaching production:
  1. It's `require`d inside `if (__DEV__)`, so Metro removes the module from release bundles. CI checks this.
  2. It only runs in flavors with `enableHttpLogs: true`.
  3. Babel strips `console.*` from production builds.
- Other debugging: React Native DevTools (`j` in Metro), TanStack Query state in DevTools, and `logger.debug()`.

---

## i18n (English / Arabic, RTL)

- Strings live in `src/core/i18n/locales/{en,ar}.json`. Keys are **type-safe**, so `t('auth.sigIn')` fails
  the typecheck.
- The first launch follows the device language. The user's choice is saved in the settings store.
- Switching between LTR and RTL languages flips `I18nManager` and reloads the app (`reloadAppAsync`),
  because React Native needs a reload to change direction.
- For layouts, use `start`/`end` (`marginStart`, `paddingEnd`) instead of `left`/`right`, and keep
  `textAlign: 'auto'`, so screens mirror automatically.
- Numbers and currency: `formatCurrency(value, i18n.language)` uses cached `Intl` formatters.

## Theming (light / dark)

- Tokens (colors, spacing, radius, typography) are in `core/theme/theme.ts`. Screens never hardcode values.
- `ThemeMode = 'system' | 'light' | 'dark'` is saved. The same palette also themes navigation
  (headers, tabs) and the native root background, so there's no white flash.
- Styles: `const useStyles = makeStyles((t) => ({ ... }))` at module level, then `useStyles()` in the
  component. There is one `StyleSheet` per scheme, created lazily and reused.

## Assets (flutter_gen equivalent)

Drop files in `assets/images` or `assets/fonts`, then run `npm run gen:assets`:

```ts
import { Images } from '@/core/generated/assets.gen';
<Image source={Images.logo} />   // typed, autocompleted, no string paths
```

`@2x`/`@3x` variants are picked up automatically. Fonts are registered by file name (the key is the
`fontFamily`) and loaded at startup behind the splash screen. CI fails if the generated file is stale.

## Environments (flavors)

`APP_ENV=development | staging | production` selects a block in `app.config.ts`. The app name, bundle ID
(`.dev` and `.stg` suffixes, so all three can be installed side by side), API URL, logging, SSL pins and
the device-integrity policy all change with it. Config is validated with zod at startup (`core/config/env.ts`).

> Anything in `app.config.ts` ships inside the app. Put **public** config there, never secrets. Secrets
> belong on your backend. EAS secrets are only for build-time credentials.

---

## Security checklist

| Threat                        | Mitigation in this starter                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Token theft from storage      | Tokens in Keychain/Keystore (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`); other data in AES-256 MMKV |
| Backups / device migration    | `android.allowBackup: false`; Keychain items are `THIS_DEVICE_ONLY`                             |
| MITM / proxies                | HTTPS only (ATS + `usesCleartextTraffic: false`), optional SSL public-key pinning               |
| Reverse engineering (JS)      | Hermes **bytecode** (no readable JS in the APK/IPA), no console output, dev tooling removed     |
| Reverse engineering (native)  | R8 minify + obfuscation + resource shrinking (`expo-build-properties`)                          |
| Rooted / jailbroken / Frida   | `jail-monkey` check; production shows a blocking screen (`blockCompromisedDevices`)             |
| Screenshots of sensitive data | `usePreventScreenCapture()` on the login screen (also hides the app-switcher preview)           |
| Leaking data after logout     | Tokens and cached user cleared; `queryClient.clear()` drops server data from memory             |
| Malformed / hostile responses | zod validation at the repository boundary                                                       |
| Crashes showing stack traces  | Route-level `ErrorBoundary` with a friendly retry; errors go to `logger.error` → crash reporter |

**SSL pinning.** Generate two pins per domain (current key + backup key) and add them to
`sslPins` for the production flavor:

```bash
openssl s_client -servername api.example.com -connect api.example.com:443 </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary | openssl enc -base64
```

**About assets.** Anything bundled in an app can be extracted by someone determined, so no client-side
trick makes assets truly secret. Keep paid or sensitive content on the server behind auth (signed URLs).
The same goes for business rules and API keys: the client is never trusted.

**Crash reporting.** Install Sentry (`npx expo install @sentry/react-native`) and call
`setErrorReporter((e, ctx) => Sentry.captureException(e, { extra: ctx }))` at startup.

---

## Performance & memory

- **New Architecture + Hermes** (defaults) and the **React Compiler** (`experiments.reactCompiler`), which
  memoizes components automatically, so you don't need to write `useMemo`/`useCallback`/`memo`.
- **FlashList** recycles rows. `expo-image` uses `recyclingKey` and a memory+disk cache.
- **TanStack Query**: `staleTime` 60 s, `gcTime` 5 min (unused data is freed), request cancellation via
  `AbortSignal` when screens unmount, and no retries on 4xx.
- Zustand **selectors**, so components re-render only for the slice they read.
- `makeStyles` creates styles once. `Intl` formatters are cached.
- Only the needed fields are requested (`select=` on the products API), which means smaller payloads and
  less memory.
- The splash stays up until the session is known, so there's no login-screen flash for signed-in users.

## Testing

- **Unit**: cURL builder, error mapping, HTTP client (auth header, single-flight refresh, session
  expiry), repository, and session store.
- **Component**: Login (validation, success, invalid credentials) and Products (data, error + retry),
  rendered with the real providers and fake repositories (`test/test-utils.tsx`).
- **E2E**: `.maestro/login.yaml` (`maestro test .maestro`).

---

## Make it yours

1. Update `APP_NAME`, `BASE_BUNDLE_ID`, `slug` and `scheme` in `app.config.ts`, and `name` in `package.json`.
2. Replace `assets/app/*` (icon and splash) and `assets/images/logo.png`, then run `npm run gen:assets`.
3. Point `apiUrl` at your backend for each flavor and adapt `auth.repository.ts` and `auth.dto.ts` to its API.
4. Adjust the colors in `core/theme/theme.ts`.
5. Delete `features/products` (and its route and test) once you have your own first feature.
6. `npx eas-cli@latest init` to link EAS, then `npm run build:dev`.

### Release checklist

- [ ] Production `sslPins` filled in (two per domain) and tested on a real device
- [ ] Crash reporter connected (`setErrorReporter`)
- [ ] `blockCompromisedDevices` policy confirmed for your audience
- [ ] App icon, splash, name and bundle IDs final
- [ ] `npm run check` green and Maestro flow passing on a release build
